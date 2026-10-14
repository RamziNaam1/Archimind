import { apiRequest } from "./api"

// ✅ Add simple cache
let projectsCache = null
let cacheTimestamp = 0
const CACHE_DURATION = 5000 // Cache for 5 seconds

function mapDiagramTypeToBackend(type) {
  const mapping = {
    classDiagram: 'CLASS',
    sequenceDiagram: 'SEQUENCE',
    erDiagram: 'ER',
    stateDiagram: 'ACTIVITY',
    flowchart: 'ACTIVITY'
  }
  return mapping[type] || 'CLASS'
}

/**
 * Get user projects with caching to avoid rate limit
 */
export async function getUserProjects() {
  try {
    // Return cached data if still fresh
    if (projectsCache && Date.now() - cacheTimestamp < CACHE_DURATION) {
      return projectsCache
    }

    const data = await apiRequest("/uml/my-diagrams", { method: "GET" })
    
    // Cache the result
    projectsCache = Array.isArray(data) ? data : []
    cacheTimestamp = Date.now()
    
    return projectsCache
  } catch (error) {
    console.error("Erreur lors de la récupération des projets:", error)
    return []
  }
}

/**
 * Clear cache when needed (after creating/deleting)
 */
export function clearProjectsCache() {
  projectsCache = null
  cacheTimestamp = 0
}

/**
 * Delete a project and clear cache
 */
export async function deleteProject(projectId) {
  const result = await apiRequest(`/uml/${projectId}`, {
    method: "DELETE"
  })
  clearProjectsCache() // Clear cache after deletion
  return result
}

/**
 * Create project
 */
export async function createProject({ title, diagramType }) {
  const result = await apiRequest("/uml/generate", {
    method: "POST",
    body: {
      name: title,
      text: `Initial blank workspace layout structure for ${title || 'New Project'}`,
      type: mapDiagramTypeToBackend(diagramType)
    }
  })
  clearProjectsCache() // Clear cache after creation
  return result
}