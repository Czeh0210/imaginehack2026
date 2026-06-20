'use client'

import ReactMarkdown from 'react-markdown'

const AI_FILES = new Set(['MEMORY.md', 'CLAUDE.md'])

export default function FileViewer({ file, content, loading, loadError }) {
  if (loading) {
    return (
      <div className="file-viewer file-viewer--loading">
        <div className="file-viewer__spinner" />
        <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Loading…</span>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="file-viewer file-viewer--empty">
        <div className="file-viewer__empty-state">
          <span className="file-viewer__empty-icon">⚠️</span>
          <h3>Could not load file</h3>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)' }}>{loadError}</p>
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 8 }}>
            Check that the Supabase bucket has a public read policy or that you are authenticated.
          </p>
        </div>
      </div>
    )
  }

  if (!file) {
    return (
      <div className="file-viewer file-viewer--empty">
        <div className="file-viewer__empty-state">
          <span className="file-viewer__empty-icon">📋</span>
          <h3>No file selected</h3>
          <p>Select a file from the explorer to view it here.</p>
        </div>
      </div>
    )
  }

  const isAI = AI_FILES.has(file.name)
  const isMd = file.name.endsWith('.md')

  return (
    <div className="file-viewer">
      <div className="file-viewer__header">
        <div className="file-viewer__path">
          {file.path.split('/').map((seg, i, arr) => (
            <span key={i}>
              {i < arr.length - 1 ? (
                <>
                  <span className="file-viewer__segment">{seg}</span>
                  <span className="file-viewer__separator">/</span>
                </>
              ) : (
                <span className="file-viewer__filename">{seg}</span>
              )}
            </span>
          ))}
        </div>
        <div className="file-viewer__meta">
          {isAI && <span className="ai-badge">✦ AI Managed</span>}
          {file.updatedAt && (
            <span className="file-viewer__date">
              {new Date(file.updatedAt).toLocaleDateString('en-SG', {
                day: 'numeric', month: 'short', year: 'numeric',
              })}
            </span>
          )}
        </div>
      </div>

      <div className="file-viewer__content">
        {isMd ? (
          <div className="markdown-body">
            <ReactMarkdown>{content || ''}</ReactMarkdown>
          </div>
        ) : (
          <pre style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 13,
            lineHeight: 1.7,
            color: 'var(--text-primary)',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}>
            {content || ''}
          </pre>
        )}
      </div>
    </div>
  )
}