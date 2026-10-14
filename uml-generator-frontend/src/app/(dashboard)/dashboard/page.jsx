'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import DashboardHeader from '@/components/dashboard/dashboardHeader'
import ProjectGrid from '@/components/dashboard/ProjectGrid'
import NewProjectModal from '@/components/dashboard/NewProjectModal'
import { createProject } from '@/lib/projects'

import '@/components/dashboard/dashboard.css'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [newProjectOpen, setNewProjectOpen] = useState(false)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')

    if (!storedUser) {
      router.push('/login')
      return
    }

    setUser(JSON.parse(storedUser))
    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignParagraph: 'center', alignItems: 'center', height: '100vh', fontFamily: 'monospace', color: '#64748b' }}>
        <p>Loading Workspace...</p>
      </div>
    )
  }

  // Adjusted to handle the asynchronous network promise returned from NestJS
  const handleCreateProject = async ({ title, diagramType }) => {
    try {
      const project = await createProject({
        title,
        diagramType,
      })

      // Ensure we have a valid database item ID before attempting to push the route
      const projectId = project?.id || project?._id || project?.diagram?.id
      
      if (projectId) {
        router.push(`/editor/${projectId}`)
      } else {
        // Fallback catch if her response layout returns a raw array or alternative schema wrapper
        throw new Error("Missing tracking ID string from server response structure.")
      }
    } catch (error) {
      // Passes the backend validation error up into the NewProjectModal display box
      throw error
    }
  }

  // Safely fallback if names are parsed weirdly from nested response profiles
  const displayName = user?.firstName 
    ? `${user.firstName} ${user.lastName || ''}`.trim() 
    : (user?.name || 'Architect')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      {/* Header */}
      <DashboardHeader user={user} />

      <main className="dash-main">

        {/* Page header */}
        <div className="dash-page-header">

          <div>
            <h1>{displayName}</h1>
            <h2 className="dash-page-title">Workspace</h2>
            <p className="dash-page-subtitle">
              Manage your diagrams and system architectures
            </p>
          </div>

          {/* Search */}
          <div className="dash-search-wrap">
            <span className="material-symbols-outlined dash-search-icon">
              search
            </span>

            <input
              className="dash-search"
              type="text"
              placeholder="Search diagrams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

        </div>

        {/* Projects */}
        <ProjectGrid searchTerm={searchTerm} />

      </main>

      {/* Floating button */}
      <button className="dash-fab" type="button" onClick={() => setNewProjectOpen(true)}>
        <span className="material-symbols-outlined">add</span>
        <span>New Project</span>
      </button>

      <NewProjectModal
        isOpen={newProjectOpen}
        onClose={() => setNewProjectOpen(false)}
        onCreate={handleCreateProject}
      />

    </div>
  )
}