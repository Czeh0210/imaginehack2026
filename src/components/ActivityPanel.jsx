'use client'

const AI_FILES = new Set(['MEMORY.md', 'CLAUDE.md'])

function isAIFile(name) {
  return AI_FILES.has(name)
}

function FileMetadata({ file }) {
  const ext = file.name.includes('.') ? file.name.split('.').pop().toUpperCase() : '—'
  const isAI = isAIFile(file.name)

  return (
    <div className="activity-section" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px', marginBottom: '14px' }}>
      <div className="activity-section__label">File Info</div>
      {isAI && (
        <div style={{ marginBottom: '10px' }}>
          <span className="ai-badge">✦ AI Managed</span>
        </div>
      )}
      <div className="meta-section">
        <div className="meta-row">
          <span className="meta-row__label">Name</span>
          <span className="meta-row__value" style={{ fontFamily: 'var(--font-mono)' }}>{file.name}</span>
        </div>
        <div className="meta-row">
          <span className="meta-row__label">Type</span>
          <span className="meta-row__value">{ext}</span>
        </div>
        {file.updatedAt && (
          <div className="meta-row">
            <span className="meta-row__label">Modified</span>
            <span className="meta-row__value">
              {new Date(file.updatedAt).toLocaleDateString('en-SG', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>
        )}
        {file.metadata?.size && (
          <div className="meta-row">
            <span className="meta-row__label">Size</span>
            <span className="meta-row__value">{formatBytes(file.metadata.size)}</span>
          </div>
        )}
      </div>
    </div>
  )
}

function formatBytes(bytes) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function ActivityPanel({ log, selectedFile }) {
  const hasLog = log && log.length > 0

  return (
    <div style={{ height: '100%', overflowY: 'auto' }}>
      <div style={{ padding: '12px' }}>
        {/* File metadata when a file is open */}
        {selectedFile && <FileMetadata file={selectedFile} />}

        {/* Activity feed */}
        <div className="activity-section">
          <div className="activity-section__label">Activity</div>
          {!hasLog ? (
            <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', paddingTop: '4px', lineHeight: 1.6 }}>
              No activity yet. Open a client repository to begin.
            </p>
          ) : (
            log.map((item) => (
              <div key={item.id} className="activity-item">
                <div className={`activity-item__dot activity-item__dot--${item.source}`} />
                <div className="activity-item__body">
                  <div className="activity-item__action">{item.action}</div>
                  {item.filename && (
                    <div className="activity-item__file">{item.filename}</div>
                  )}
                </div>
                <div className="activity-item__time">{item.time}</div>
              </div>
            ))
          )}
        </div>

        {/* Legend */}
        {hasLog && (
          <div style={{ marginTop: '16px', display: 'flex', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10.5px', color: 'var(--text-tertiary)' }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--ai-color)', display: 'inline-block' }} />
              AI
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10.5px', color: 'var(--text-tertiary)' }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent-primary)', display: 'inline-block' }} />
              Advisor
            </div>
          </div>
        )}
      </div>
    </div>
  )
}