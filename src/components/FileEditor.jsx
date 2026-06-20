'use client'

import { useState, useCallback, useEffect } from 'react'

/**
 * FileEditor — Markdown editor with save functionality.
 * Tracks dirty state and provides visual save feedback.
 */
export default function FileEditor({ file, content, onSave }) {
  const [editContent, setEditContent] = useState(content || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const isDirty = editContent !== (content || '')

  useEffect(() => {
    setEditContent(content || '')
    setSaved(false)
  }, [content, file?.path])

  const handleSave = useCallback(async () => {
    if (!file || !isDirty) return
    setSaving(true)
    try {
      await onSave(file.path, editContent)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error('Save failed:', err)
    } finally {
      setSaving(false)
    }
  }, [file, editContent, isDirty, onSave])

  // Ctrl+S shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleSave])

  if (!file) {
    return (
      <div className="file-editor file-editor--empty">
        <div className="file-editor__empty-state">
          <span className="file-editor__empty-icon">✏️</span>
          <h3>No file selected</h3>
          <p>Select a file to edit its contents.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="file-editor">
      <div className="file-editor__toolbar">
        <span className="file-editor__filename">{file.name}</span>
        <div className="file-editor__actions">
          {isDirty && <span className="file-editor__dirty-badge">Unsaved changes</span>}
          {saved && <span className="file-editor__saved-badge">✓ Saved</span>}
          <button
            className={`file-editor__save-btn ${isDirty ? 'file-editor__save-btn--active' : ''}`}
            onClick={handleSave}
            disabled={!isDirty || saving}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
      <textarea
        className="file-editor__textarea"
        value={editContent}
        onChange={(e) => setEditContent(e.target.value)}
        spellCheck={false}
        placeholder="Start writing…"
      />
    </div>
  )
}
