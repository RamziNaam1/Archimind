'use client'

import { useState } from 'react'

export default function NewProjectModal({ isOpen, onClose, onCreate }) {
  const [title, setTitle] = useState('')
  const [diagramType, setDiagramType] = useState('classDiagram')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return

    setLoading(true)
    setError('')

    try {
      // Passes inputs up to your parent component (dashboard/page.jsx),
      // which will handle calling the apiRequest and routing to the editor
      await onCreate({ title: title.trim(), diagramType })
      
      // Clear tracking variables if successful
      setTitle('')
      setDiagramType('classDiagram')
      onClose()
    } catch (err) {
      console.error("Failed to insert new layout row:", err.message)
      setError(err.message || 'Server rejected creation payload. Try a different title.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="new-project-overlay" role="dialog" aria-modal="true" aria-labelledby="new-project-title">
      <div className="new-project-modal">
        <div className="new-project-header">
          <div>
            <h2 id="new-project-title" className="new-project-title">Create New Project</h2>
            <p className="new-project-subtitle">Name your diagram before opening the editor.</p>
          </div>
          <button 
            className="new-project-close" 
            type="button" 
            onClick={onClose} 
            title="Close"
            disabled={loading}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
          </button>
        </div>

        <form className="new-project-form" onSubmit={handleSubmit}>
          
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '0.5rem',
              padding: '0.75rem 1rem',
              color: '#f87171',
              fontSize: '0.875rem',
              fontFamily: 'monospace',
              marginBottom: '1rem'
            }}>
              {error}
            </div>
          )}

          <div className="new-project-field">
            <label htmlFor="title" className="new-project-label">
              Project Title
            </label>
            <input
              className="new-project-input"
              id="title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                setError('')
              }}
              placeholder="Example: Inventory System"
              required
              autoFocus
              disabled={loading}
            />
          </div>

          <div className="new-project-field">
            <label htmlFor="diagramType" className="new-project-label">
              Diagram Type
            </label>
            <select
              className="new-project-select"
              id="diagramType"
              value={diagramType}
              onChange={(e) => setDiagramType(e.target.value)}
              disabled={loading}
            >
              <option value="classDiagram">Class Diagram</option>
              <option value="sequenceDiagram">Sequence Diagram</option>
              <option value="flowchart">Flowchart</option>
              <option value="erDiagram">Entity Relationship</option>
            </select>
          </div>

          <div className="new-project-actions">
            <button 
              className="new-project-cancel" 
              type="button" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              className="new-project-submit" 
              type="submit"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}