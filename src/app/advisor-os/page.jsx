'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  getClients,
  createClientRepository,
  getRepositoryTree,
  getFileContent,
  saveFile,
  createFile,
  createFolder,
  deleteFile,
  deleteFolder,
} from '@/services/repositoryService'
import RepositoryTree from '@/components/RepositoryTree'
import FileViewer from '@/components/FileViewer'
import FileEditor from '@/components/FileEditor'

// ── SVG helpers ──────────────────────────────────────────────────────────────

function IconMenu() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 12h18M3 6h18M3 18h18" />
    </svg>
  )
}

function IconPlus() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

function IconNewFile() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="18" x2="12" y2="12" />
      <line x1="9" y1="15" x2="15" y2="15" />
    </svg>
  )
}

function IconNewFolder() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      <line x1="12" y1="11" x2="12" y2="17" />
      <line x1="9" y1="14" x2="15" y2="14" />
    </svg>
  )
}

function IconRefresh() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 4v6h6M23 20v-6h-6" />
      <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
    </svg>
  )
}

function IconEye() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function IconEdit() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

// ── Modal ────────────────────────────────────────────────────────────────────

function CreateModal({ modal, name, onNameChange, onCreate, onClose, loading, error }) {
  const isFile = modal.type === 'file'
  const label = isFile ? 'New File' : 'New Folder'
  const placeholder = isFile ? 'filename.md' : 'folder-name'

  // Show the parent path relative to the bucket root — strip the client prefix
  const displayPath = modal.parentPath.includes('/')
    ? modal.parentPath.split('/').slice(1).join('/')
    : '(root)'

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-card__title">{label}</h3>
        <p className="modal-card__subtitle">in {displayPath || '(root)'}</p>
        <input
          className="modal-card__input"
          placeholder={placeholder}
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onCreate()
            if (e.key === 'Escape') onClose()
          }}
          autoFocus
        />
        {error && <p className="modal-card__error">{error}</p>}
        <div className="modal-card__actions">
          <button className="modal-card__cancel-btn" onClick={onClose}>Cancel</button>
          <button
            className="modal-card__confirm-btn"
            onClick={onCreate}
            disabled={!name.trim() || loading}
          >
            {loading ? 'Creating…' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  )
}

function DeleteModal({ confirm, onDelete, onClose, loading }) {
  const isFolder = confirm.type === 'folder'
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-card__title modal-card__title--danger">
          Delete {isFolder ? 'Folder' : 'File'}
        </h3>
        <p className="modal-card__body">
          {isFolder
            ? <>Delete <strong>{confirm.name}</strong> and all its contents? This cannot be undone.</>
            : <>Delete <strong>{confirm.name}</strong>? This cannot be undone.</>}
        </p>
        <div className="modal-card__actions">
          <button className="modal-card__cancel-btn" onClick={onClose}>Cancel</button>
          <button
            className="modal-card__delete-btn"
            onClick={onDelete}
            disabled={loading}
          >
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AdvisorOSPage() {
  // ── Client list ──────────────────────────────────
  const [clients, setClients] = useState([])
  const [selectedClient, setSelectedClient] = useState(null)
  const [loadingClients, setLoadingClients] = useState(true)
  const [showNewClient, setShowNewClient] = useState(false)
  const [newClientName, setNewClientName] = useState('')
  const [clientCreating, setClientCreating] = useState(false)

  // ── Repository tree ──────────────────────────────
  const [tree, setTree] = useState([])
  const [loadingTree, setLoadingTree] = useState(false)

  // ── File viewer / editor ─────────────────────────
  const [selectedFile, setSelectedFile] = useState(null)
  const [fileContent, setFileContent] = useState('')
  const [viewMode, setViewMode] = useState('view') // 'view' | 'edit'
  const [loadingFile, setLoadingFile] = useState(false)

  // ── UI ───────────────────────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // ── Create modal ─────────────────────────────────
  const [createModal, setCreateModal] = useState(null) // { type: 'file'|'folder', parentPath: string }
  const [createName, setCreateName] = useState('')
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState('')

  // ── Delete confirm ────────────────────────────────
  const [deleteConfirm, setDeleteConfirm] = useState(null) // { type: 'file'|'folder', path, name }
  const [deleteLoading, setDeleteLoading] = useState(false)

  // ── Effects ──────────────────────────────────────
  useEffect(() => { fetchClients() }, [])

  useEffect(() => {
    if (selectedClient) fetchTree(selectedClient.name)
  }, [selectedClient])

  // ── Data helpers ─────────────────────────────────
  const fetchClients = async () => {
    setLoadingClients(true)
    try {
      setClients(await getClients())
    } catch (err) {
      console.error('Failed to load clients:', err)
    } finally {
      setLoadingClients(false)
    }
  }

  const fetchTree = async (clientName) => {
    setLoadingTree(true)
    try {
      setTree(await getRepositoryTree(clientName))
    } catch (err) {
      console.error('Failed to load tree:', err)
    } finally {
      setLoadingTree(false)
    }
  }

  // ── Handlers ─────────────────────────────────────
  const handleSelectClient = (client) => {
    setSelectedClient(client)
    setSelectedFile(null)
    setFileContent('')
    setViewMode('view')
  }

  const handleSelectFile = useCallback(async (file) => {
    setSelectedFile(file)
    setViewMode('view')
    setLoadingFile(true)
    try {
      setFileContent(await getFileContent(file.path))
    } catch (err) {
      console.error('Failed to load file:', err)
      setFileContent('Error loading file content.')
    } finally {
      setLoadingFile(false)
    }
  }, [])

  const handleSaveFile = useCallback(async (path, content) => {
    await saveFile(path, content)
    setFileContent(content)
  }, [])

  const handleCreateClient = async () => {
    if (!newClientName.trim()) return
    setClientCreating(true)
    try {
      await createClientRepository(newClientName.trim())
      setNewClientName('')
      setShowNewClient(false)
      await fetchClients()
    } catch (err) {
      console.error('Failed to create client:', err)
    } finally {
      setClientCreating(false)
    }
  }

  // ── Tree action dispatcher ────────────────────────
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

  // ── Create file / folder ──────────────────────────
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
        await fetchTree(selectedClient.name)
        // Auto-open the new file in edit mode
        const newNode = { name, path: fullPath, type: 'file' }
        await handleSelectFile(newNode)
        setViewMode('edit')
      } else {
        await createFolder(fullPath)
        setCreateModal(null)
        await fetchTree(selectedClient.name)
      }
    } catch (err) {
      console.error('Failed to create:', err)
      setCreateError(err.message || 'Failed to create. The name may already be taken.')
    } finally {
      setCreateLoading(false)
    }
  }, [createModal, createName, selectedClient, handleSelectFile])

  // ── Delete file / folder ──────────────────────────
  const handleDelete = useCallback(async () => {
    if (!deleteConfirm) return
    setDeleteLoading(true)
    try {
      if (deleteConfirm.type === 'folder') {
        await deleteFolder(deleteConfirm.path)
      } else {
        await deleteFile(deleteConfirm.path)
      }
      // Clear file view if the deleted item was open
      if (
        selectedFile?.path === deleteConfirm.path ||
        selectedFile?.path?.startsWith(deleteConfirm.path + '/')
      ) {
        setSelectedFile(null)
        setFileContent('')
      }
      setDeleteConfirm(null)
      await fetchTree(selectedClient.name)
    } catch (err) {
      console.error('Failed to delete:', err)
    } finally {
      setDeleteLoading(false)
    }
  }, [deleteConfirm, selectedFile, selectedClient])

  // ── Render ────────────────────────────────────────
  return (
    <div className="advisor-os">
      {/* Header */}
      <header className="advisor-header">
        <div className="advisor-header__left">
          <button
            className="advisor-header__menu-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            <IconMenu />
          </button>
          <div className="advisor-header__brand">
            <span className="advisor-header__logo">◆</span>
            <h1 className="advisor-header__title">AdvisorOS</h1>
          </div>
        </div>
        <div className="advisor-header__right">
          {selectedClient && (
            <div className="advisor-header__client-badge">
              <span className="advisor-header__client-dot" />
              {selectedClient.name}
            </div>
          )}
        </div>
      </header>

      <div className="advisor-main">
        {/* Sidebar */}
        <aside className={`advisor-sidebar ${sidebarOpen ? 'advisor-sidebar--open' : ''}`}>

          {/* Client list section */}
          <div className="advisor-sidebar__section">
            <div className="advisor-sidebar__section-header">
              <h2 className="advisor-sidebar__section-title">Clients</h2>
              <button
                className="advisor-sidebar__add-btn"
                onClick={() => setShowNewClient(true)}
                title="New Client"
              >
                <IconPlus />
              </button>
            </div>

            {showNewClient && (
              <div className="advisor-sidebar__new-client">
                <input
                  type="text"
                  className="advisor-sidebar__input"
                  placeholder="Client name…"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateClient()
                    if (e.key === 'Escape') { setShowNewClient(false); setNewClientName('') }
                  }}
                  autoFocus
                />
                <div className="advisor-sidebar__new-client-actions">
                  <button
                    className="advisor-sidebar__create-btn"
                    onClick={handleCreateClient}
                    disabled={clientCreating || !newClientName.trim()}
                  >
                    {clientCreating ? 'Creating…' : 'Create'}
                  </button>
                  <button
                    className="advisor-sidebar__cancel-btn"
                    onClick={() => { setShowNewClient(false); setNewClientName('') }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="advisor-sidebar__client-list">
              {loadingClients ? (
                <div className="advisor-sidebar__loading">
                  <div className="advisor-sidebar__spinner" />
                  <span>Loading clients…</span>
                </div>
              ) : clients.length === 0 ? (
                <div className="advisor-sidebar__empty">
                  <p>No clients yet.</p>
                  <button
                    className="advisor-sidebar__empty-btn"
                    onClick={() => setShowNewClient(true)}
                  >
                    + Create your first client
                  </button>
                </div>
              ) : (
                clients.map((client) => (
                  <button
                    key={client.name}
                    className={`advisor-sidebar__client-item ${
                      selectedClient?.name === client.name
                        ? 'advisor-sidebar__client-item--active'
                        : ''
                    }`}
                    onClick={() => handleSelectClient(client)}
                  >
                    <span className="advisor-sidebar__client-avatar">
                      {client.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="advisor-sidebar__client-name">{client.name}</span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Repository tree section */}
          {selectedClient && (
            <div className="advisor-sidebar__section advisor-sidebar__section--tree">
              <div className="advisor-sidebar__section-header">
                <h2 className="advisor-sidebar__section-title">Repository</h2>
                <div className="advisor-sidebar__section-actions">
                  <button
                    className="advisor-sidebar__icon-btn"
                    title="New File"
                    onClick={() => {
                      setCreateError('')
                      setCreateName('')
                      setCreateModal({ type: 'file', parentPath: selectedClient.name })
                    }}
                  >
                    <IconNewFile />
                  </button>
                  <button
                    className="advisor-sidebar__icon-btn"
                    title="New Folder"
                    onClick={() => {
                      setCreateError('')
                      setCreateName('')
                      setCreateModal({ type: 'folder', parentPath: selectedClient.name })
                    }}
                  >
                    <IconNewFolder />
                  </button>
                  <button
                    className="advisor-sidebar__icon-btn"
                    onClick={() => fetchTree(selectedClient.name)}
                    title="Refresh"
                  >
                    <IconRefresh />
                  </button>
                </div>
              </div>

              <div className="advisor-sidebar__tree-container">
                <RepositoryTree
                  tree={tree}
                  selectedFile={selectedFile}
                  onSelectFile={handleSelectFile}
                  onAction={handleTreeAction}
                  loading={loadingTree}
                />
              </div>
            </div>
          )}
        </aside>

        {/* Main content */}
        <main className="advisor-content">
          {!selectedClient ? (
            <div className="advisor-content__welcome">
              <div className="advisor-content__welcome-inner">
                <span className="advisor-content__welcome-icon">◆</span>
                <h2>Welcome to AdvisorOS</h2>
                <p>Select a client from the sidebar or create a new one to get started.</p>
                <div className="advisor-content__features">
                  <div className="advisor-content__feature">
                    <span>📂</span>
                    <div>
                      <h4>Client Repositories</h4>
                      <p>Organize files, notes, and conversations per client.</p>
                    </div>
                  </div>
                  <div className="advisor-content__feature">
                    <span>🧠</span>
                    <div>
                      <h4>Memory System</h4>
                      <p>Auto-maintained memory logs for each client interaction.</p>
                    </div>
                  </div>
                  <div className="advisor-content__feature">
                    <span>📝</span>
                    <div>
                      <h4>Markdown Editor</h4>
                      <p>View and edit client files directly in the browser.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : !selectedFile ? (
            <div className="advisor-content__no-file">
              <span className="advisor-content__no-file-icon">📋</span>
              <h3>Select a file</h3>
              <p>Choose a file from the repository tree to view or edit its contents.</p>
            </div>
          ) : (
            <div className="advisor-content__workspace">
              <div className="advisor-content__mode-toggle">
                <button
                  className={`advisor-content__mode-btn ${viewMode === 'view' ? 'advisor-content__mode-btn--active' : ''}`}
                  onClick={() => setViewMode('view')}
                >
                  <IconEye />
                  Preview
                </button>
                <button
                  className={`advisor-content__mode-btn ${viewMode === 'edit' ? 'advisor-content__mode-btn--active' : ''}`}
                  onClick={() => setViewMode('edit')}
                >
                  <IconEdit />
                  Edit
                </button>
              </div>
              {viewMode === 'view' ? (
                <FileViewer file={selectedFile} content={fileContent} loading={loadingFile} />
              ) : (
                <FileEditor file={selectedFile} content={fileContent} onSave={handleSaveFile} />
              )}
            </div>
          )}
        </main>
      </div>

      {/* Create file/folder modal */}
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

      {/* Delete confirmation modal */}
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