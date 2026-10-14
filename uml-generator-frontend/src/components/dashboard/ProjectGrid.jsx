'use client'

import { useEffect, useState } from "react"
import ProjectCard from './ProjectCard'
import { getUserProjects, deleteProject } from "@/lib/projects"

export default function ProjectGrid({ searchTerm = '' }) {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Centralized loader to easily refresh after deleting an item
  const loadLiveDiagrams = async () => {
    try {
      setLoading(true)
      const data = await getUserProjects()
      // Fallback safely if data is undefined or nested differently
      setProjects(Array.isArray(data) ? data : data?.diagrams || [])
    } catch (err) {
      console.error("Failed loading diagrams:", err.message)
      setError("Unable to connect to database to fetch your diagrams.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLiveDiagrams()
  }, [])

  // Handler passed down to your items to delete them live
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this diagram?")) return
    try {
      await deleteProject(id)
      // Optimistically update or refetch
      setProjects((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      alert(`Could not delete diagram: ${err.message}`)
    }
  }

  const filteredProjects = projects.filter((project) =>
  (project.name || '').toLowerCase().includes(searchTerm.toLowerCase())
)

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', fontFamily: 'monospace', color: '#64748b' }}>
        Loading live data blocks from PostgreSQL...
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '1.5rem', color: '#ef4444', background: 'rgba(239,68,68,0.1)', borderRadius: '0.5rem', border: '1px solid rgba(239,68,68,0.2)' }}>
        {error}
      </div>
    )
  }

  if (filteredProjects.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
        No diagrams found. Create your first architectural canvas!
      </div>
    )
  }

  return (
    <div className="dash-grid">
      {filteredProjects.map((project) => (
        <ProjectCard 
          key={project.id} 
          project={{
            ...project,
            // Maps her database fields to your layout needs safely
            title: project.name || "Untitled Diagram",
            diagramType: project.type || project.diagramType,
            date: project.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : "Just now"
          }} 
          onDelete={() => handleDelete(project.id)}
        />
      ))}
    </div>
  )
}