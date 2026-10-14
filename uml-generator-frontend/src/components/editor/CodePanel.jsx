'use client'

import { useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'

const DEFAULT_CODE = `classDiagram
  direction LR

  class User {
    +String username
    +String email
    +login()
  }

  class Wallet {
    +Float balance
    +deposit(amount)
  }

  User "1" -- "1" Wallet : owns`

export default function CodePanel({ code, onChange }) {
  const { resolvedTheme } = useTheme()
  const editorRef = useRef(null)
  const monacoRef = useRef(null)
  const containerRef = useRef(null)
  const monacoTheme = resolvedTheme === 'light' ? 'vs' : 'vs-dark'
  const monacoThemeRef = useRef(monacoTheme)

  useEffect(() => {
    // Dynamically load Monaco Editor
    if (typeof window === 'undefined') return

    let cancelled = false

    const loadMonaco = async () => {
      const monaco = await import('monaco-editor')
      if (cancelled || !containerRef.current) return

      monacoRef.current = monaco

      editorRef.current = monaco.editor.create(containerRef.current, {
        value: code || DEFAULT_CODE,
        language: 'markdown',
        theme: monacoThemeRef.current,
        fontSize: 13,
        fontFamily: "'JetBrains Mono', monospace",
        lineHeight: 24,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        padding: { top: 16, bottom: 16 },
        renderLineHighlight: 'gutter',
        scrollbar: {
          verticalScrollbarSize: 4,
          horizontalScrollbarSize: 4,
        },
      })

      editorRef.current.onDidChangeModelContent(() => {
        onChange?.(editorRef.current.getValue())
      })
    }

    loadMonaco()

    return () => {
      cancelled = true
      editorRef.current?.dispose()
    }
  }, [])

  useEffect(() => {
    monacoThemeRef.current = monacoTheme
    if (monacoRef.current) {
      monacoRef.current.editor.setTheme(monacoTheme)
    }
  }, [monacoTheme])

  // Update editor content when code prop changes externally (from AI)
  useEffect(() => {
    if (editorRef.current && code !== undefined) {
      const currentValue = editorRef.current.getValue()
      if (currentValue !== code) {
        editorRef.current.setValue(code)
      }
    }
  }, [code])

  const handleCopy = () => {
    const value = editorRef.current?.getValue() || ''
    navigator.clipboard.writeText(value)
  }

  const handleUndo = () => editorRef.current?.trigger('keyboard', 'undo', null)
  const handleRedo = () => editorRef.current?.trigger('keyboard', 'redo', null)

  return (
    <section className="code-panel">

      {/* Toolbar */}
      <div className="panel-toolbar">
        <div className="panel-toolbar-left">
          <span className="material-symbols-outlined" style={{ color: '#06b6d4', fontSize: 18 }}>code</span>
          <span className="panel-toolbar-title">Mermaid Code</span>
        </div>
        <div className="panel-toolbar-right">
          <button className="toolbar-btn" onClick={handleUndo} title="Undo">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>undo</span>
          </button>
          <button className="toolbar-btn" onClick={handleRedo} title="Redo">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>redo</span>
          </button>
          <div className="toolbar-divider" />
          <button className="toolbar-btn" onClick={handleCopy} title="Copy code">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>content_copy</span>
          </button>
        </div>
      </div>

      {/* Monaco container */}
      <div className="code-editor-wrap">
        <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      </div>

    </section>
  )
}
