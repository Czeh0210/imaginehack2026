'use client'

import { useState, useCallback } from 'react'

const FILE_ICONS = {
  md: '📄',
  pdf: '📕',
  txt: '📝',
  json: '⚙️',
  csv: '📊',
  png: '🖼️',
  jpg: '🖼️',
  jpeg: '🖼️',
  gif: '🖼️',
  default: '📎',
}

function getFileIcon(name) {
  const ext = name.split('.').pop().toLowerCase()
  return FILE_ICONS[ext] || FILE_ICONS.default
}

// ── SVG icons ──────────────────────────────────────────────────────────────

function IconNewFile() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="18" x2="12" y2="12" />
      <line x1="9" y1="15" x2="15" y2="15" />
    </svg>
  )
}

function IconNewFolder() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      <line x1="12" y1="11" x2="12" y2="17" />
      <line x1="9" y1="14" x2="15" y2="14" />
    </svg>
  )
}

function IconTrash() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  )
}

// ── TreeNode ────────────────────────────────────────────────────────────────

function TreeNode({ node, depth = 0, selectedFile, onSelectFile, onAction }) {
  const [expanded, setExpanded] = useState(depth < 1)
  const [hovered, setHovered] = useState(false)

  const isSelected = node.type === 'file' && selectedFile?.path === node.path

  const handleMainClick = useCallback(() => {
    if (node.type === 'folder') {
      setExpanded((prev) => !prev)
    } else {
      onSelectFile(node)
    }
  }, [node, onSelectFile])

  const fireAction = useCallback(
    (action, e) => {
      e.stopPropagation()
      onAction?.(action, node)
    },
    [node, onAction],
  )

  return (
    <div>
      {/* Row wrapper — handles hover highlight and indentation */}
      <div
        className={`tree-node-row ${isSelected ? 'tree-node-row--selected' : ''}`}
        style={{ paddingLeft: `${depth * 16}px` }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Main click area */}
        <button className="tree-node__main" onClick={handleMainClick} title={node.path}>
          <span className="tree-node__icon">
            {node.type === 'folder'
              ? expanded
                ? '📂'
                : '📁'
              : getFileIcon(node.name)}
          </span>
          <span className="tree-node__label">{node.name}</span>
          {node.type === 'folder' && node.children?.length > 0 && (
            <span className="tree-node__chevron">{expanded ? '▾' : '▸'}</span>
          )}
        </button>

        {/* Action buttons — visible on hover */}
        {hovered && (
          <div className="tree-node__actions">
            {node.type === 'folder' && (
              <>
                <button
                  className="tree-node__action-btn"
                  title="New file"
                  onClick={(e) => fireAction('new-file', e)}
                >
                  <IconNewFile />
                </button>
                <button
                  className="tree-node__action-btn"
                  title="New folder"
                  onClick={(e) => fireAction('new-folder', e)}
                >
                  <IconNewFolder />
                </button>
              </>
            )}
            <button
              className="tree-node__action-btn tree-node__action-btn--danger"
              title={node.type === 'folder' ? 'Delete folder' : 'Delete file'}
              onClick={(e) => fireAction('delete', e)}
            >
              <IconTrash />
            </button>
          </div>
        )}
      </div>

      {/* Children */}
      {node.type === 'folder' && expanded && node.children && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              selectedFile={selectedFile}
              onSelectFile={onSelectFile}
              onAction={onAction}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── RepositoryTree ──────────────────────────────────────────────────────────

export default function RepositoryTree({
  tree,
  selectedFile,
  onSelectFile,
  onAction,
  loading,
}) {
  if (loading) {
    return (
      <div className="tree-loading">
        <div className="tree-loading__spinner" />
        <span>Loading repository…</span>
      </div>
    )
  }

  if (!tree || tree.length === 0) {
    return (
      <div className="tree-empty">
        <span className="tree-empty__icon">📂</span>
        <p>Repository is empty</p>
        <p className="tree-empty__hint">Use the buttons above to create files or folders.</p>
      </div>
    )
  }

  return (
    <div className="repository-tree">
      {tree.map((node) => (
        <TreeNode
          key={node.path}
          node={node}
          depth={0}
          selectedFile={selectedFile}
          onSelectFile={onSelectFile}
          onAction={onAction}
        />
      ))}
    </div>
  )
}