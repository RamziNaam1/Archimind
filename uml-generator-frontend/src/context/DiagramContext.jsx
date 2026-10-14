'use client'
import { createContext, useContext, useState } from 'react'

const DiagramContext = createContext(null)

export function DiagramProvider({ children }) {
  const [mermaidCode, setMermaidCode] = useState('')
  const [diagramType, setDiagramType] = useState('flowchart')
  const [isLoading, setIsLoading] = useState(false)

  return (
    <DiagramContext.Provider value={{
      mermaidCode, setMermaidCode,
      diagramType, setDiagramType,
      isLoading, setIsLoading
    }}>
      {children}
    </DiagramContext.Provider>
  )
}

export function useDiagram() {
  const context = useContext(DiagramContext)
  if (!context) throw new Error('useDiagram must be used within DiagramProvider')
  return context
}