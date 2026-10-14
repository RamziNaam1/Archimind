'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useParams, useRouter } from 'next/navigation'
import { getUserProjects } from '@/lib/projects'
import { apiRequest } from '@/lib/api'
import ChatPanel from '@/components/editor/ChatPanel'
import CodePanel from '@/components/editor/CodePanel'
import PreviewPanel from '@/components/editor/PreviewPanel'
import '@/components/editor/editor.css'
import Image from 'next/image'

export default function EditorPage() {
  const { logout } = useAuth()
  const router = useRouter()
  const params = useParams()
  const projectId = params?.id 

  const [code, setCode] = useState('')
  const [diagramType, setDiagramType] = useState('classDiagram')
  const [projectTitle, setProjectTitle] = useState('Loading Architecture...')
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState('')
  const [saveError, setSaveError] = useState('')

  // Load project data on mount
  useEffect(() => {
    if (!projectId) return;

    const fetchProjectData = async () => {
      try {
        setLoading(true)
        const diagrams = await getUserProjects()

        const currentProject = Array.isArray(diagrams) 
          ? diagrams.find(p => String(p.id) === String(projectId) || String(p._id) === String(projectId))
          : null

        if (currentProject) {
          setProjectTitle(currentProject.name || 'Untitled Diagram')
          setCode(currentProject.generatedCode || `classDiagram\n  class Start {\n  }`)
          setDiagramType(currentProject.type || 'classDiagram')
        } else {
          setProjectTitle('New Diagram')
          setCode(`classDiagram\n  class Start {\n  }`)
        }
      } catch (err) {
        console.error("Failed to load project:", err)
        setProjectTitle('New Diagram (Offline)')
        setCode(`classDiagram\n  class Start {\n  }`)
      } finally {
        setLoading(false)
      }
    }

    fetchProjectData()
  }, [projectId])

  // Save project
  const handleSaveProject = async () => {
    setSaving(true)
    setSaveError('')
    setSaveSuccess('')
    
    try {
      await apiRequest(`/uml/${projectId}`, {
        method: 'PATCH',
        body: {
          generatedCode: code,
          type: diagramType
        }
      })
      setSaveSuccess('Changes saved successfully! ✓')
      setTimeout(() => setSaveSuccess(''), 3000)
    } catch (err) {
      console.error("Save failed:", err.message)
      setSaveError(err.message || 'Failed to save changes')
      setTimeout(() => setSaveError(''), 4000)
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  // Delete project
  const handleDeleteProject = async () => {
    setDeleting(true)
    setSaveError('')
    
    try {
      await apiRequest(`/uml/${projectId}`, {
        method: 'DELETE'
      })
      
      setSaveSuccess('Project deleted successfully! Redirecting...')
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    } catch (err) {
      console.error("Delete failed:", err.message)
      setSaveError(err.message || 'Failed to delete project')
      setConfirmDeleteOpen(false)
      setTimeout(() => setSaveError(''), 4000)
    } finally {
      setDeleting(false)
    }
  }

  if (false && loading) { 
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0b0f19', color: '#64748b', fontFamily: 'monospace' }}>
        <p>Opening Secure Canvas Environment...</p>
      </div>
    )
  }

  return (
    <div className="editor-page">

      {/* ── Success/Error Notifications ── */}
      {saveSuccess && (
        <div style={{
          position: 'fixed',
          top: '1rem',
          right: '1rem',
          background: 'rgba(16,185,129,0.1)',
          border: '1px solid rgba(16,185,129,0.3)',
          borderRadius: '0.75rem',
          padding: '1rem 1.5rem',
          color: '#34d399',
          fontSize: '0.875rem',
          fontFamily: 'JetBrains Mono, monospace',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          zIndex: 1000,
          animation: 'slideIn 0.3s ease-out'
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>check_circle</span>
          {saveSuccess}
        </div>
      )}

      {saveError && (
        <div style={{
          position: 'fixed',
          top: '1rem',
          right: '1rem',
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: '0.75rem',
          padding: '1rem 1.5rem',
          color: '#f87171',
          fontSize: '0.875rem',
          fontFamily: 'JetBrains Mono, monospace',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          zIndex: 1000,
          animation: 'slideIn 0.3s ease-out'
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>error</span>
          {saveError}
        </div>
      )}

      {/* ── Header ── */}
      <header className="editor-header">
        <div className="editor-header-left">
          <Link href="/dashboard" className="dash-logo">
            <div className="dash-logo-icon">
              <Image
                src="/dash_logo.png"       
                alt="Archimind Logo"
                width={32}           
                height={32}
              />
            </div>
          </Link>
          <span className="dash-logo-text">Archimind</span>
          <div className="editor-header-divider" />
          <span style={{ color: '#94a3b8', fontSize: '0.875rem', fontFamily: 'JetBrains Mono, monospace' }}>
            {projectTitle}
          </span>
        </div>

        <div className="editor-header-right">
          {/* Save button */}
          <button
            className="editor-save-btn"
            type="button"
            onClick={handleSaveProject}
            disabled={saving}
            title="Save changes to database"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#06b6d4',
              color: '#fff',
              border: 'none',
              padding: '0.4rem 0.8rem',
              borderRadius: '0.375rem',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              opacity: saving ? 0.7 : 1,
              transition: 'all 0.2s'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>save</span>
            {saving ? 'Syncing...' : 'Save Changes'}
          </button>

          {/* Delete button */}
          <button
            className="editor-delete-btn"
            type="button"
            onClick={() => setConfirmDeleteOpen(true)}
            title="Delete this project"
            disabled={deleting}
            style={{
              opacity: deleting ? 0.7 : 1
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
            Delete project
          </button>
          
          <div className="editor-header-divider" />
          
          <Link href="/profile">
            <button className="editor-icon-btn" title="Profile">
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>account_circle</span>
            </button>
          </Link>
          <button className="editor-icon-btn" title="Logout" onClick={handleLogout}>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>logout</span>
          </button>
        </div>
      </header>

      {/* ── Main 3-panel workspace ── */}
      <main className="editor-main">

        {/* Left — Chat */}
        <ChatPanel
          onGenerate={setCode}
          diagramType={diagramType}
          onDiagramTypeChange={setDiagramType}
          projectName={projectTitle}
          projectId={projectId}
          currentCode={code}
        />

        {/* Middle — Code */}
        <CodePanel code={code} onChange={setCode} />

        {/* Right — Preview */}
        <PreviewPanel code={code} />

      </main>

      {/* ── Delete Confirmation Modal ── */}
      {confirmDeleteOpen && (
        <div className="editor-confirm-overlay" role="dialog" aria-modal="true" aria-labelledby="delete-project-title">
          <div className="editor-confirm-modal">
            <div className="editor-confirm-icon" style={{ color: '#ef4444' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 48 }}>delete_forever</span>
            </div>
            <div>
              <h2 id="delete-project-title" className="editor-confirm-title">Delete "{projectTitle}"?</h2>
              <p className="editor-confirm-text">
                This action is permanent and cannot be undone. All diagram data will be lost.
              </p>
            </div>
            <div className="editor-confirm-actions">
              <button
                className="editor-confirm-cancel"
                type="button"
                onClick={() => setConfirmDeleteOpen(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="editor-confirm-delete"
                type="button"
                onClick={handleDeleteProject}
                disabled={deleting}
                style={{
                  opacity: deleting ? 0.7 : 1,
                  cursor: deleting ? 'not-allowed' : 'pointer'
                }}
              >
                {deleting ? 'Deleting...' : 'Delete project'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>

    </div>
  )
} 