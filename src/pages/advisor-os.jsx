import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
  getClients,
  getRootFiles,
  createClientRepository,
  getRepositoryTree,
  getFileContent,
  saveFile,
  createFile,
  createFolder,
  deleteFile,
  deleteFolder,
  uploadFile,
  uploadToRoot,
} from '@/services/repositoryService'
import RepositoryTree from '@/components/RepositoryTree'
import FileViewer from '@/components/FileViewer'
import FileEditor from '@/components/FileEditor'
import ActivityPanel from '@/components/ActivityPanel'

// â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const FILE_ICONS = { md: 'ðŸ“„', pdf: 'ðŸ“•', txt: 'ðŸ“', json: 'âš™ï¸', csv: 'ðŸ“Š', png: 'ðŸ–¼ï¸', jpg: 'ðŸ–¼ï¸', jpeg: 'ðŸ–¼ï¸' }
function fileIcon(name) {
  const ext = name.split('.').pop().toLowerCase()
  return FILE_ICONS[ext] || 'ðŸ“Ž'
}

function formatClientName(folderName) {
  const stripped = folderName.replace(/^\d+_?/, '').replace(/_/g, ' ').trim()
  return stripped.replace(/\b\w/g, (c) => c.toUpperCase()) || folderName
}

function formatTime(date) {
  return new Date(date).toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function flattenTree(nodes) {
  const result = []
  for (const node of nodes) {
    if (node.type === 'file') result.push(node)
    else if (node.children) result.push(...flattenTree(node.children))
  }
  return result
}

function findInTree(nodes, name) {
  for (const node of nodes) {
    if (node.type === 'file' && node.name === name) return node
    if (node.children) {
      const found = findInTree(node.children, name)
      if (found) return found
    }
  }
  return null
}

// â”€â”€ SVG Icons â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const Ic = {
  menu: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 12h18M3 6h18M3 18h18" />
    </svg>
  ),
  panel: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 3v18" />
      <path d="M15 3v18" />
    </svg>
  ),
  newFile: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="18" x2="12" y2="12" />
      <line x1="9" y1="15" x2="15" y2="15" />
    </svg>
  ),
  newFolder: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      <line x1="12" y1="11" x2="12" y2="17" />
      <line x1="9" y1="14" x2="15" y2="14" />
    </svg>
  ),
  refresh: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 4v6h6M23 20v-6h-6" />
      <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
    </svg>
  ),
  upload: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
}

// â”€â”€ Modal components â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function CreateModal({ modal, name, onNameChange, onCreate, onClose, loading, error }) {
  const isFile = modal.type === 'file'
  const displayPath = modal.parentPath.includes('/')
    ? modal.parentPath.split('/').slice(1).join('/')
    : '(root)'

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-card__title">{isFile ? 'New File' : 'New Folder'}</h3>
        <p className="modal-card__subtitle">in /{displayPath || '(root)'}</p>
        <input
          className="modal-card__input"
          placeholder={isFile ? 'filename.md' : 'folder-name'}
          value={name}
          autoFocus
          onChange={(e) => onNameChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') onCreate(); if (e.key === 'Escape') onClose() }}
        />
        {error && <p className="modal-card__error">{error}</p>}
        <div className="modal-card__actions">
          <button className="modal-card__cancel-btn" onClick={onClose}>Cancel</button>
          <button className="modal-card__confirm-btn" onClick={onCreate} disabled={!name.trim() || loading}>
            {loading ? 'Creatingâ€¦' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  )
}

function DeleteModal({ confirm, onDelete, onClose, loading }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-card__title modal-card__title--danger">
          Delete {confirm.type === 'folder' ? 'Folder' : 'File'}
        </h3>
        <p className="modal-card__body">
          {confirm.type === 'folder'
            ? <>Delete <strong>{confirm.name}</strong> and all its contents? This cannot be undone.</>
            : <>Delete <strong>{confirm.name}</strong>? This cannot be undone.</>}
        </p>
        <div className="modal-card__actions">
          <button className="modal-card__cancel-btn" onClick={onClose}>Cancel</button>
          <button className="modal-card__delete-btn" onClick={onDelete} disabled={loading}>
            {loading ? 'Deletingâ€¦' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

// â”€â”€ Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function AdvisorOSPage() {
  // Navigation
  const [view, setView] = useState('home') // 'home' | 'clients' | 'repo'
  const [selectedClient, setSelectedClient] = useState(null)

  // Panel visibility
  const [explorerOpen, setExplorerOpen] = useState(true)
  const [activityOpen, setActivityOpen] = useState(true)

  // Client list
  const [clients, setClients] = useState([])
  const [loadingClients, setLoadingClients] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewClient, setShowNewClient] = useState(false)
  const [newClientName, setNewClientName] = useState('')
  const [clientCreating, setClientCreating] = useState(false)

  // Repository tree
  const [tree, setTree] = useState([])
  const [loadingTree, setLoadingTree] = useState(false)

  // Tabs: [{file, content, loading}]
  const [openTabs, setOpenTabs] = useState([])
  const [activeTabPath, setActiveTabPath] = useState(null)
  const [viewMode, setViewMode] = useState('view') // 'view' | 'edit'

  // Activity log
  const [activityLog, setActivityLog] = useState([])

  // Vault (bucket-root files)
  const [rootFiles, setRootFiles] = useState([])

  // Upload
  const uploadRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  // Modals
  const [createModal, setCreateModal] = useState(null)
  const [createName, setCreateName] = useState('')
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // â”€â”€ Activity log helper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const addActivity = useCallback((action, filename, source = 'user') => {
    const time = formatTime(new Date())
    setActivityLog((prev) => [{ id: Date.now(), time, action, filename, source }, ...prev].slice(0, 30))
  }, [])

  // â”€â”€ Tabs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const openTab = useCallback(async (file) => {
    setOpenTabs((prev) => {
      if (prev.find((t) => t.file.path === file.path)) return prev
      return [...prev, { file, content: null, loading: true }]
    })
    setActiveTabPath(file.path)
    setViewMode('view')

    try {
      const content = await getFileContent(file.path)
      setOpenTabs((prev) =>
        prev.map((t) => (t.file.path === file.path ? { ...t, content, loading: false } : t)),
      )
    } catch (err) {
      console.error('Failed to load file:', err)
      setOpenTabs((prev) =>
        prev.map((t) =>
          t.file.path === file.path
            ? { ...t, loading: false, loadError: err.message || 'Could not load file' }
            : t,
        ),
      )
    }
  }, [])

  const closeTab = useCallback((filePath, e) => {
    e?.stopPropagation()
    setOpenTabs((prev) => {
      const remaining = prev.filter((t) => t.file.path !== filePath)
      if (activeTabPath === filePath) {
        const idx = prev.findIndex((t) => t.file.path === filePath)
        const next = remaining[Math.min(idx, remaining.length - 1)]
        setActiveTabPath(next?.file.path ?? null)
      }
      return remaining
    })
  }, [activeTabPath])

  const switchTab = useCallback((filePath) => {
    setActiveTabPath(filePath)
  }, [])

  const handleSaveFile = useCallback(async (path, content) => {
    await saveFile(path, content)
    setOpenTabs((prev) =>
      prev.map((t) => (t.file.path === path ? { ...t, content } : t)),
    )
    addActivity('Saved', path.split('/').pop(), 'user')
  }, [addActivity])

  const activeTab = useMemo(
    () => openTabs.find((t) => t.file.path === activeTabPath) ?? null,
    [openTabs, activeTabPath],
  )

  // â”€â”€ Load clients â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const fetchClients = useCallback(async () => {
    setLoadingClients(true)
    try {
      setClients(await getClients())
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingClients(false)
    }
  }, [])

  // â”€â”€ Load vault (bucket-root) files â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const fetchRootFiles = useCallback(async () => {
    try {
      setRootFiles(await getRootFiles())
    } catch (err) {
      console.error(err)
    }
  }, [])

  // â”€â”€ Load client repo â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const fetchTree = useCallback(async (clientName) => {
    setLoadingTree(true)
    try {
      const data = await getRepositoryTree(clientName)
      setTree(data)
      return data
    } catch (err) {
      console.error(err)
      return []
    } finally {
      setLoadingTree(false)
    }
  }, [])

  const handleSelectClient = useCallback(async (client) => {
    setSelectedClient(client)
    setView('repo')
    setOpenTabs([])
    setActiveTabPath(null)
    setExplorerOpen(true)

    const treeData = await fetchTree(client.name)

    // Seed activity from file timestamps
    const files = flattenTree(treeData)
      .filter((f) => f.updatedAt)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 8)

    const seeded = files.map((f) => ({
      id: `seed-${f.path}`,
      time: formatTime(f.updatedAt),
      action: f.name === 'MEMORY.md' ? 'Memory updated' : f.name === 'CLAUDE.md' ? 'Context updated' : 'Modified',
      filename: f.name,
      source: f.name === 'MEMORY.md' || f.name === 'CLAUDE.md' ? 'ai' : 'user',
    }))
    setActivityLog(seeded)

    // Auto-open README.md
    const readme = findInTree(treeData, 'README.md')
    if (readme) openTab(readme)

    addActivity(`Opened repository`, client.name, 'user')
  }, [fetchTree, openTab, addActivity])

  // â”€â”€ Init â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => { fetchClients(); fetchRootFiles() }, [fetchClients, fetchRootFiles])

  // â”€â”€ Create client â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleCreateClient = useCallback(async () => {
    if (!newClientName.trim()) return
    setClientCreating(true)
    try {
      await createClientRepository(newClientName.trim())
      setNewClientName('')
      setShowNewClient(false)
      await fetchClients()
      addActivity('Created repository', newClientName.trim(), 'user')
    } catch (err) {
      console.error(err)
    } finally {
      setClientCreating(false)
    }
  }, [newClientName, fetchClients, addActivity])

  // â”€â”€ Tree actions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleTreeAction = useCallback((action, node) => {
    setCreateError('')
    if (action === 'new-file') {
      setCreateName('')
      setCreateModal({ type: 'file', parentPath: node.path })
    } else if (action === 'new-folder') {
      setCreateName('')
      setCreateModal({ type: 'folder', parentPath: node.path })
    } else if (action === 'delete') {
      setDeleteConfirm({ type: node.type, path: node.path, name: node.name })
    }
  }, [])

  const handleCreate = useCallback(async () => {
    if (!createName.trim() || !createModal) return
    const name = createName.trim()
    if (name.includes('/') || name.includes('\\')) {
      setCreateError('Name cannot contain slashes.')
      return
    }
    setCreateLoading(true)
    setCreateError('')
    try {
      const fullPath = `${createModal.parentPath}/${name}`
      if (createModal.type === 'file') {
        await createFile(fullPath, '')
        setCreateModal(null)
        const newNode = { name, path: fullPath, type: 'file' }
        await fetchTree(selectedClient.name)
        openTab(newNode)
        setViewMode('edit')
        addActivity('Created file', name, 'user')
      } else {
        await createFolder(fullPath)
        setCreateModal(null)
        await fetchTree(selectedClient.name)
        addActivity('Created folder', name, 'user')
      }
    } catch (err) {
      setCreateError(err.message || 'Already exists or an error occurred.')
    } finally {
      setCreateLoading(false)
    }
  }, [createModal, createName, selectedClient, fetchTree, openTab, addActivity])

  const handleDelete = useCallback(async () => {
    if (!deleteConfirm) return
    setDeleteLoading(true)
    try {
      if (deleteConfirm.type === 'folder') {
        await deleteFolder(deleteConfirm.path)
      } else {
        await deleteFile(deleteConfirm.path)
      }
      setOpenTabs((prev) =>
        prev.filter(
          (t) => t.file.path !== deleteConfirm.path && !t.file.path.startsWith(deleteConfirm.path + '/'),
        ),
      )
      if (
        activeTabPath === deleteConfirm.path ||
        activeTabPath?.startsWith(deleteConfirm.path + '/')
      ) {
        setActiveTabPath(null)
      }
      setDeleteConfirm(null)
      await fetchTree(selectedClient.name)
      addActivity('Deleted', deleteConfirm.name, 'user')
    } catch (err) {
      console.error(err)
    } finally {
      setDeleteLoading(false)
    }
  }, [deleteConfirm, activeTabPath, selectedClient, fetchTree, addActivity])

  // â”€â”€ Upload â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleUpload = useCallback(async (files) => {
    if (!files || files.length === 0) return
    setUploading(true)
    for (const file of Array.from(files)) {
      try {
        if (selectedClient) {
          await uploadFile(selectedClient.name, '', file)
        } else {
          await uploadToRoot(file)
        }
        addActivity('Uploaded', file.name, 'user')
      } catch (err) {
        console.error(`Upload failed for ${file.name}:`, err)
      }
    }
    if (selectedClient) {
      await fetchTree(selectedClient.name)
    } else {
      await fetchRootFiles()
      setView('vault')
      setSelectedClient(null)
      setExplorerOpen(true)
    }
    setUploading(false)
  }, [selectedClient, fetchTree, fetchRootFiles, addActivity])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files.length > 0) handleUpload(e.dataTransfer.files)
  }, [handleUpload])

  // â”€â”€ Derived â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clients
    const q = searchQuery.toLowerCase()
    return clients.filter(
      (c) => c.name.toLowerCase().includes(q) || formatClientName(c.name).toLowerCase().includes(q),
    )
  }, [clients, searchQuery])

  // â”€â”€ Vault navigation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleOpenVaultFile = useCallback((file) => {
    setView('vault')
    setSelectedClient(null)
    setExplorerOpen(true)
    openTab(file)
  }, [openTab])

  const handleOpenVault = useCallback(() => {
    setView('vault')
    setSelectedClient(null)
    setExplorerOpen(true)
    setOpenTabs([])
    setActiveTabPath(null)
  }, [])

  // â”€â”€ Breadcrumb â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const breadcrumbs = useMemo(() => {
    const crumbs = []
    if (view === 'vault') {
      crumbs.push({ label: 'Vault', onClick: null })
    } else if (view === 'clients' || view === 'repo') {
      crumbs.push({
        label: 'Clients',
        onClick: () => { setView('clients'); setSelectedClient(null); setOpenTabs([]); setActivityLog([]) },
      })
    }
    if (view === 'repo' && selectedClient) {
      crumbs.push({ label: formatClientName(selectedClient.name), onClick: null })
    }
    return crumbs
  }, [view, selectedClient])

  // â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <div className="advisoros">

      {/* â”€â”€ Top Bar â”€â”€ */}
      <header className="topbar">
        {/* Logo */}
        <button
          className="topbar__logo"
          onClick={() => { setView('home'); setSelectedClient(null); setOpenTabs([]); setActivityLog([]) }}
        >
          <span className="topbar__logo-mark">â—†</span>
          <span className="topbar__logo-name">AdvisorOS</span>
        </button>

        {/* Breadcrumb */}
        {breadcrumbs.length > 0 && (
          <>
            <div className="topbar__sep" />
            <nav className="topbar__breadcrumb">
              {breadcrumbs.map((crumb, i) => (
                <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
                  {i > 0 && <span className="topbar__crumb-chevron">â€º</span>}
                  <button
                    className={`topbar__crumb ${crumb.onClick === null ? 'topbar__crumb--active' : ''}`}
                    onClick={crumb.onClick ?? undefined}
                  >
                    {crumb.label}
                  </button>
                </span>
              ))}
            </nav>
          </>
        )}

        {/* Actions */}
        <div className="topbar__actions" style={{ marginLeft: breadcrumbs.length === 0 ? 'auto' : undefined }}>
          {view === 'repo' && selectedClient && (
            <>
              <button
                className="topbar__icon-btn"
                title="New File"
                onClick={() => {
                  setCreateError('')
                  setCreateName('')
                  setCreateModal({ type: 'file', parentPath: selectedClient.name })
                }}
              >
                {Ic.newFile}
              </button>
              <button
                className="topbar__icon-btn"
                title="New Folder"
                onClick={() => {
                  setCreateError('')
                  setCreateName('')
                  setCreateModal({ type: 'folder', parentPath: selectedClient.name })
                }}
              >
                {Ic.newFolder}
              </button>
              <button
                className="topbar__icon-btn"
                title="Refresh"
                onClick={() => fetchTree(selectedClient.name)}
              >
                {Ic.refresh}
              </button>
              <div className="topbar__sep" />
            </>
          )}
          <button
            className="topbar__icon-btn"
            title={selectedClient ? `Upload to ${formatClientName(selectedClient.name)}` : 'Upload to advisor vault'}
            disabled={uploading}
            onClick={() => uploadRef.current?.click()}
            style={{ opacity: uploading ? 0.5 : 1 }}
          >
            {uploading
              ? <span className="spinner" style={{ width: 13, height: 13, borderWidth: 1.5 }} />
              : Ic.upload}
          </button>
          <button
            className="topbar__icon-btn"
            title={explorerOpen ? 'Hide explorer' : 'Show explorer'}
            onClick={() => setExplorerOpen((p) => !p)}
          >
            {Ic.menu}
          </button>
          <button
            className="topbar__icon-btn"
            title={activityOpen ? 'Hide activity' : 'Show activity'}
            onClick={() => setActivityOpen((p) => !p)}
          >
            {Ic.panel}
          </button>
        </div>
      </header>

      {/* â”€â”€ Body â”€â”€ */}
      <div className="advisoros__body">

        {/* â”€â”€ Left: Explorer â”€â”€ */}
        <aside className={`explorer ${explorerOpen && (view === 'repo' || view === 'vault') ? '' : 'explorer--hidden'}`}>
          <div className="explorer__header">
            <span className="explorer__title">
              {view === 'vault' ? 'Vault' : selectedClient ? formatClientName(selectedClient.name) : 'Explorer'}
            </span>
            {view === 'repo' && (
              <div className="explorer__actions">
                <button
                  className="explorer__icon-btn"
                  title="New File"
                  onClick={() => {
                    setCreateError('')
                    setCreateName('')
                    setCreateModal({ type: 'file', parentPath: selectedClient.name })
                  }}
                >
                  {Ic.newFile}
                </button>
                <button
                  className="explorer__icon-btn"
                  title="New Folder"
                  onClick={() => {
                    setCreateError('')
                    setCreateName('')
                    setCreateModal({ type: 'folder', parentPath: selectedClient.name })
                  }}
                >
                  {Ic.newFolder}
                </button>
                <button
                  className="explorer__icon-btn"
                  title="Refresh"
                  onClick={() => fetchTree(selectedClient.name)}
                >
                  {Ic.refresh}
                </button>
              </div>
            )}
            {view === 'vault' && (
              <div className="explorer__actions">
                <button className="explorer__icon-btn" title="Refresh" onClick={fetchRootFiles}>
                  {Ic.refresh}
                </button>
              </div>
            )}
          </div>
          <div className="explorer__tree">
            {view === 'vault' ? (
              <VaultFileList
                files={rootFiles}
                selectedPath={activeTab?.file?.path ?? null}
                onSelect={openTab}
              />
            ) : (
              <RepositoryTree
                tree={tree}
                selectedFile={activeTab?.file ?? null}
                onSelectFile={openTab}
                onAction={handleTreeAction}
                loading={loadingTree}
              />
            )}
          </div>
        </aside>

        {/* â”€â”€ Center: Workspace â”€â”€ */}
        <main
          className="workspace"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{ position: 'relative' }}
        >
          {/* Drag-and-drop overlay */}
          {isDragging && (
            <div className="workspace-drop-overlay">
              <div className="workspace-drop-overlay__inner">
                <span style={{ fontSize: 32 }}>ðŸ“</span>
                <span>Drop files to upload</span>
                <span style={{ fontSize: 11, opacity: 0.7 }}>PDF, Word, Excel, Markdown, imagesâ€¦</span>
              </div>
            </div>
          )}

          {view === 'home' && (
            <HomeView
              clientCount={clients.length}
              rootFiles={rootFiles}
              onOpenClients={() => { setView('clients'); fetchClients() }}
              onOpenVault={handleOpenVault}
              onOpenVaultFile={handleOpenVaultFile}
            />
          )}

          {view === 'clients' && (
            <ClientsView
              clients={filteredClients}
              loading={loadingClients}
              searchQuery={searchQuery}
              onSearch={setSearchQuery}
              onSelectClient={handleSelectClient}
              showNewClient={showNewClient}
              onNewClient={() => setShowNewClient(true)}
              newClientName={newClientName}
              onNewClientName={setNewClientName}
              onCreateClient={handleCreateClient}
              clientCreating={clientCreating}
              onCancelNew={() => { setShowNewClient(false); setNewClientName('') }}
            />
          )}

          {(view === 'repo' || view === 'vault') && (
            <RepoWorkspace
              openTabs={openTabs}
              activeTabPath={activeTabPath}
              activeTab={activeTab}
              viewMode={viewMode}
              onSwitchTab={switchTab}
              onCloseTab={closeTab}
              onSetViewMode={setViewMode}
              onSave={handleSaveFile}
            />
          )}
        </main>

        {/* â”€â”€ Right: Activity â”€â”€ */}
        <aside className={`activity-panel ${activityOpen ? '' : 'activity-panel--hidden'}`}>
          <div className="activity-panel__header">
            <span className="activity-panel__title">Activity</span>
          </div>
          <div className="activity-panel__body" style={{ padding: 0 }}>
            <ActivityPanel
              log={activityLog}
              selectedFile={activeTab?.file ?? null}
            />
          </div>
        </aside>
      </div>

      {/* Hidden file input for upload */}
      <input
        ref={uploadRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.xls,.xlsx,.md,.txt,.csv,.png,.jpg,.jpeg,.gif,.webp,.mp3,.wav,.m4a"
        style={{ display: 'none' }}
        onChange={(e) => { handleUpload(e.target.files); e.target.value = '' }}
      />

      {/* Modals */}
      {createModal && (
        <CreateModal
          modal={createModal}
          name={createName}
          onNameChange={(v) => { setCreateName(v); setCreateError('') }}
          onCreate={handleCreate}
          onClose={() => { setCreateModal(null); setCreateError('') }}
          loading={createLoading}
          error={createError}
        />
      )}
      {deleteConfirm && (
        <DeleteModal
          confirm={deleteConfirm}
          onDelete={handleDelete}
          onClose={() => setDeleteConfirm(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  )
}

// â”€â”€ Sub-views â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function VaultFileList({ files, selectedPath, onSelect }) {
  if (!files.length) {
    return (
      <div style={{ padding: '16px 12px', fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.6 }}>
        No files in vault yet.
        <br />Upload a file using the â†‘ button above.
      </div>
    )
  }
  return (
    <div>
      {files.map((file) => (
        <div
          key={file.path}
          className={`tree-node-row${selectedPath === file.path ? ' tree-node-row--active' : ''}`}
          onClick={() => onSelect(file)}
          style={{ cursor: 'pointer' }}
        >
          <button className="tree-node__main" type="button" style={{ pointerEvents: 'none' }}>
            <span style={{ flexShrink: 0 }}>{fileIcon(file.name)}</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
          </button>
        </div>
      ))}
    </div>
  )
}

function HomeView({ clientCount, rootFiles, onOpenClients, onOpenVault, onOpenVaultFile }) {
  const memoryFile = rootFiles.find((f) => f.name === 'MEMORY.md')
  const claudeFile = rootFiles.find((f) => f.name === 'CLAUDE.md')
  const otherFiles = rootFiles.filter((f) => f.name !== 'MEMORY.md' && f.name !== 'CLAUDE.md')

  return (
    <div className="home-view">
      <p className="home-view__eyebrow">Repository OS</p>
      <h1 className="home-view__heading">AdvisorOS</h1>
      <p className="home-view__sub">
        Every client is a repository. Their history, documents, and AI-generated memory live here â€” organised, searchable, and always up to date.
      </p>

      <div className="folder-grid">
        <button className="folder-card" onClick={onOpenClients}>
          <span className="folder-card__icon">ðŸ“</span>
          <span className="folder-card__name">Clients</span>
          <span className="folder-card__meta">
            {clientCount > 0 ? `${clientCount} repositor${clientCount === 1 ? 'y' : 'ies'}` : 'No clients yet'}
          </span>
        </button>

        <button
          className={`folder-card${rootFiles.length === 0 ? ' folder-card--disabled' : ''}`}
          onClick={rootFiles.length > 0 ? onOpenVault : undefined}
          title={rootFiles.length > 0 ? `${rootFiles.length} file${rootFiles.length === 1 ? '' : 's'} in vault` : 'No vault files yet â€” upload to add'}
        >
          <span className="folder-card__icon">ðŸ“š</span>
          <span className="folder-card__name">Vault</span>
          <span className="folder-card__meta">
            {rootFiles.length > 0 ? `${rootFiles.length} file${rootFiles.length === 1 ? '' : 's'}` : 'Advisor knowledge base'}
          </span>
        </button>

        <button
          className={`folder-card${!memoryFile ? ' folder-card--disabled' : ''}`}
          onClick={memoryFile ? () => onOpenVaultFile(memoryFile) : undefined}
          title={memoryFile ? 'Open global memory file' : 'Upload MEMORY.md to the vault to enable'}
        >
          <span className="folder-card__icon">ðŸ§ </span>
          <span className="folder-card__name">MEMORY.md</span>
          <span className="folder-card__meta">{memoryFile ? 'Global AI context' : 'Not in vault yet'}</span>
        </button>

        <button
          className={`folder-card${!claudeFile ? ' folder-card--disabled' : ''}`}
          onClick={claudeFile ? () => onOpenVaultFile(claudeFile) : undefined}
          title={claudeFile ? 'Open system instructions' : 'Upload CLAUDE.md to the vault to enable'}
        >
          <span className="folder-card__icon">âš™ï¸</span>
          <span className="folder-card__name">CLAUDE.md</span>
          <span className="folder-card__meta">{claudeFile ? 'System instructions' : 'Not in vault yet'}</span>
        </button>
      </div>

      {otherFiles.length > 0 && (
        <div style={{ marginTop: 32, maxWidth: 560 }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 10 }}>
            Vault Files
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {otherFiles.map((f) => (
              <button
                key={f.path}
                onClick={() => onOpenVaultFile(f)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px',
                  background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)',
                  borderRadius: 6, cursor: 'pointer', textAlign: 'left', width: '100%',
                  fontSize: 13, color: 'var(--text-primary)',
                }}
              >
                <span style={{ flexShrink: 0 }}>{fileIcon(f.name)}</span>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)', flexShrink: 0 }}>
                  {f.updatedAt ? new Date(f.updatedAt).toLocaleDateString('en-SG', { day: 'numeric', month: 'short' }) : ''}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ClientsView({
  clients, loading, searchQuery, onSearch,
  onSelectClient, showNewClient, onNewClient,
  newClientName, onNewClientName, onCreateClient,
  clientCreating, onCancelNew,
}) {
  return (
    <div className="client-view">
      <div className="client-view__header">
        <div>
          <h2 className="client-view__heading">Clients</h2>
          <p className="client-view__count">
            {loading ? 'Loadingâ€¦' : `${clients.length} repositor${clients.length === 1 ? 'y' : 'ies'}`}
          </p>
        </div>
        <div className="client-search">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-tertiary)', flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="client-search__input"
            placeholder="Search clientsâ€¦"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      </div>

      {showNewClient && (
        <div className="new-client-form">
          <input
            type="text"
            placeholder="Client nameâ€¦"
            value={newClientName}
            autoFocus
            onChange={(e) => onNewClientName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') onCreateClient(); if (e.key === 'Escape') onCancelNew() }}
          />
          <div className="new-client-form__actions">
            <button className="btn-primary" onClick={onCreateClient} disabled={clientCreating || !newClientName.trim()}>
              {clientCreating ? 'Creatingâ€¦' : 'Create Repository'}
            </button>
            <button className="btn-ghost" onClick={onCancelNew}>Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '20px 0', color: 'var(--text-tertiary)', fontSize: 13 }}>
          <span className="spinner" /> Loading client repositoriesâ€¦
        </div>
      ) : (
        <div className="client-grid">
          {/* New Client card */}
          <button className="client-card client-card--new" onClick={onNewClient}>
            <div className="client-card__avatar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <span className="client-card__name">New Client</span>
            <span className="client-card__slug">Create repository</span>
          </button>

          {clients.map((client) => {
            const displayName = formatClientName(client.name)
            const initials = displayName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
            return (
              <button
                key={client.name}
                className="client-card"
                onClick={() => onSelectClient(client)}
              >
                <div className="client-card__avatar">{initials}</div>
                <span className="client-card__name">{displayName}</span>
                <span className="client-card__slug">{client.name}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function RepoWorkspace({ openTabs, activeTabPath, activeTab, viewMode, onSwitchTab, onCloseTab, onSetViewMode, onSave }) {
  if (openTabs.length === 0) {
    return (
      <div className="workspace-empty" style={{ flex: 1 }}>
        <span className="workspace-empty__icon">ðŸ“‹</span>
        <h3>Repository open</h3>
        <p>Select a file from the explorer on the left to view or edit it here.</p>
      </div>
    )
  }

  return (
    <>
      {/* Tab Bar */}
      <div className="tabbar">
        {openTabs.map((tab) => (
          <button
            key={tab.file.path}
            className={`tabbar__tab ${activeTabPath === tab.file.path ? 'tabbar__tab--active' : ''}`}
            onClick={() => onSwitchTab(tab.file.path)}
          >
            <span className="tabbar__tab-icon">{fileIcon(tab.file.name)}</span>
            <span className="tabbar__tab-name">{tab.file.name}</span>
            <span
              className="tabbar__tab-close"
              role="button"
              onClick={(e) => onCloseTab(tab.file.path, e)}
              title="Close tab"
            >
              Ã—
            </span>
          </button>
        ))}

        {activeTab && (
          <div className="tabbar__right">
            <button
              className={`tabbar__mode-btn ${viewMode === 'view' ? 'tabbar__mode-btn--active' : ''}`}
              onClick={() => onSetViewMode('view')}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              Preview
            </button>
            <button
              className={`tabbar__mode-btn ${viewMode === 'edit' ? 'tabbar__mode-btn--active' : ''}`}
              onClick={() => onSetViewMode('edit')}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit
            </button>
          </div>
        )}
      </div>

      {/* File content */}
      {activeTab ? (
        viewMode === 'view' ? (
          <FileViewer
            file={activeTab.file}
            content={activeTab.content}
            loading={activeTab.loading}
            loadError={activeTab.loadError}
          />
        ) : (
          <FileEditor
            file={activeTab.file}
            content={activeTab.content ?? ''}
            onSave={onSave}
          />
        )
      ) : (
        <div className="workspace-empty" style={{ flex: 1 }}>
          <span className="workspace-empty__icon">ðŸ“‹</span>
          <h3>No active file</h3>
          <p>Click a tab above to continue.</p>
        </div>
      )}
    </>
  )
}
