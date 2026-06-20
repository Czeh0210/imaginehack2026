import { createClient } from '@/utils/supabase/client'

const BUCKET = 'Advisor_OS'

function sanitizePath(path) {
  return path.replace(/\/+/g, '/').replace(/^\/|\/$/g, '')
}

// ──────────────────────────────────────────────
// Client (repository) CRUD
// ──────────────────────────────────────────────

export async function getClients() {
  const supabase = createClient()
  const { data, error } = await supabase.storage.from(BUCKET).list('', {
    limit: 100,
    offset: 0,
    sortBy: { column: 'name', order: 'asc' },
  })

  if (error) throw error

  // Supabase Storage represents folders as items with id === null
  return (data || []).filter((item) => item.id === null)
}

/**
 * Create a new client repository with only the three mandatory scaffold files.
 * No additional folders are created — those are user-defined resources.
 */
export async function createClientRepository(clientName) {
  const supabase = createClient()
  const safeName = sanitizePath(clientName)

  const scaffoldFiles = {
    'CLAUDE.md': `# ${safeName}\n\nClient-specific instructions and context for AI interactions.\n`,
    'MEMORY.md': `# Memory Log\n\n## ${new Date().toISOString().split('T')[0]}\n- Repository created\n`,
    'README.md': `# ${safeName}\n\n## Overview\nClient repository for ${safeName}.\n\n## Files\n- \`CLAUDE.md\` — AI context and instructions\n- \`MEMORY.md\` — Running memory log\n`,
  }

  const results = []
  for (const [filePath, content] of Object.entries(scaffoldFiles)) {
    const fullPath = `${safeName}/${filePath}`
    const blob = new Blob([content], { type: 'text/markdown' })
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(fullPath, blob, { upsert: true })

    if (error) console.error(`Error creating ${fullPath}:`, error.message)
    results.push({ path: fullPath, data, error })
  }

  return results
}

// ──────────────────────────────────────────────
// Repository tree
// ──────────────────────────────────────────────

export async function getRepositoryTree(clientName) {
  const supabase = createClient()
  const safeName = sanitizePath(clientName)

  async function buildTree(prefix) {
    const { data, error } = await supabase.storage.from(BUCKET).list(prefix, {
      limit: 200,
      sortBy: { column: 'name', order: 'asc' },
    })

    if (error) {
      console.error(`Error listing ${prefix}:`, error.message)
      return []
    }

    const items = []
    for (const item of data || []) {
      // Skip internal placeholder files used to materialise empty folders
      if (item.name === '.placeholder' || item.name === '.gitkeep') continue

      const fullPath = prefix ? `${prefix}/${item.name}` : item.name

      if (item.id === null) {
        const children = await buildTree(fullPath)
        items.push({ name: item.name, path: fullPath, type: 'folder', children })
      } else {
        items.push({
          name: item.name,
          path: fullPath,
          type: 'file',
          metadata: item.metadata,
          updatedAt: item.updated_at,
        })
      }
    }

    // Folders first, then files; alphabetical within each group
    items.sort((a, b) => {
      if (a.type === 'folder' && b.type !== 'folder') return -1
      if (a.type !== 'folder' && b.type === 'folder') return 1
      return a.name.localeCompare(b.name)
    })

    return items
  }

  return buildTree(safeName)
}

// ──────────────────────────────────────────────
// File operations
// ──────────────────────────────────────────────

export async function getFileContent(filePath) {
  const supabase = createClient()
  const safePath = sanitizePath(filePath)

  const { data, error } = await supabase.storage.from(BUCKET).download(safePath)
  if (error) throw error

  return data.text()
}

export async function saveFile(filePath, content) {
  const supabase = createClient()
  const safePath = sanitizePath(filePath)

  const blob = new Blob([content], { type: 'text/plain' })
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .update(safePath, blob, { upsert: true })

  if (error) throw error
  return data
}

/**
 * Create a new file. Throws if the file already exists (upsert: false).
 */
export async function createFile(filePath, content = '') {
  const supabase = createClient()
  const safePath = sanitizePath(filePath)

  const blob = new Blob([content], { type: 'text/plain' })
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(safePath, blob, { upsert: false })

  if (error) throw error
  return data
}

/**
 * Create a folder by uploading an invisible marker file.
 * Supabase Storage is object-based; folders exist only as path prefixes.
 */
export async function createFolder(folderPath) {
  const supabase = createClient()
  const safePath = sanitizePath(folderPath)

  const blob = new Blob([''], { type: 'text/plain' })
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(`${safePath}/.gitkeep`, blob, { upsert: false })

  if (error) throw error
  return data
}

export async function deleteFile(filePath) {
  const supabase = createClient()
  const safePath = sanitizePath(filePath)

  const { data, error } = await supabase.storage.from(BUCKET).remove([safePath])
  if (error) throw error
  return data
}

/**
 * Recursively delete all objects inside a folder prefix, then remove the
 * folder itself (by deleting any marker files at that exact path).
 */
export async function deleteFolder(folderPath) {
  const supabase = createClient()
  const safePath = sanitizePath(folderPath)

  const allFiles = []

  async function collectFiles(prefix) {
    const { data, error } = await supabase.storage.from(BUCKET).list(prefix, {
      limit: 1000,
    })
    if (error || !data) return
    for (const item of data) {
      const fullPath = `${prefix}/${item.name}`
      if (item.id === null) {
        await collectFiles(fullPath)
      } else {
        allFiles.push(fullPath)
      }
    }
  }

  await collectFiles(safePath)

  if (allFiles.length > 0) {
    const { error } = await supabase.storage.from(BUCKET).remove(allFiles)
    if (error) throw error
  }
}

/**
 * Upload a raw File object into a client repository.
 */
export async function uploadFile(clientName, folderPath, file) {
  const supabase = createClient()
  const safeName = sanitizePath(clientName)
  const safeFolder = folderPath ? sanitizePath(folderPath) : ''
  const fullPath = safeFolder
    ? `${safeName}/${safeFolder}/${file.name}`
    : `${safeName}/${file.name}`

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(fullPath, file, { upsert: true })

  if (error) throw error
  return data
}

/**
 * Append a dated entry to a client's MEMORY.md.
 */
export async function updateMemoryFile(clientName, entry) {
  const supabase = createClient()
  const safeName = sanitizePath(clientName)
  const memoryPath = `${safeName}/MEMORY.md`

  let existingContent = ''
  try {
    const { data } = await supabase.storage.from(BUCKET).download(memoryPath)
    if (data) existingContent = await data.text()
  } catch {
    // File might not exist yet — that's fine
  }

  const today = new Date().toISOString().split('T')[0]
  const newContent = existingContent.includes(`## ${today}`)
    ? existingContent + `- ${entry}\n`
    : existingContent + `\n## ${today}\n- ${entry}\n`

  const blob = new Blob([newContent], { type: 'text/markdown' })
  const { error } = await supabase.storage
    .from(BUCKET)
    .update(memoryPath, blob, { upsert: true })

  if (error) throw error
}