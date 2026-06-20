'use client'

import ReactMarkdown from 'react-markdown'

/**
 * FileViewer — Renders markdown files with styled preview.
 * Shows file metadata header and markdown content.
 */
export default function FileViewer({ file, content, loading }) {
  if (loading) {
    return (
      <div className="file-viewer file-viewer--loading">
        <div className="file-viewer__spinner" />
        <span>Loading file…</span>
      </div>
    )
  }

  if (!file) {
    return (
      <div className="file-viewer file-viewer--empty">
        <div className="file-viewer__empty-state">
          <span className="file-viewer__empty-icon">📋</span>
          <h3>No file selected</h3>
          <p>Select a file from the repository tree to view its contents.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="file-viewer">
      <div className="file-viewer__header">
        <div className="file-viewer__path">
          {file.path.split('/').map((segment, i, arr) => (
            <span key={i}>
              <span className={i === arr.length - 1 ? 'file-viewer__filename' : 'file-viewer__segment'}>
                {segment}
              </span>
              {i < arr.length - 1 && <span className="file-viewer__separator">/</span>}
            </span>
          ))}
        </div>
        {file.updatedAt && (
          <span className="file-viewer__date">
            Updated {new Date(file.updatedAt).toLocaleDateString()}
          </span>
        )}
      </div>
      <div className="file-viewer__content markdown-body">
        <ReactMarkdown>{content || ''}</ReactMarkdown>
      </div>
    </div>
  )
}
