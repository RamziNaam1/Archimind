'use client'

import { useState } from 'react'
import '@/components/editor/export-modal.css'

const FORMATS = [
  {
    id: 'png',
    label: 'Export as PNG',
    icon: 'image',
    description: 'Best for presentations and web documentation. Standard raster format.',
    badge: 'High Res',
    badgeActive: true,
  },
  {
    id: 'svg',
    label: 'Export as SVG',
    icon: 'architecture',
    description: 'Vector graphics format. Scales infinitely without losing quality. Ideal for large prints.',
    badge: null,
  },
  {
    id: 'pdf',
    label: 'Export as PDF',
    icon: 'picture_as_pdf',
    description: 'Portable document format. Preserves layout across all devices.',
    badge: 'A4 Layout',
    badgeActive: false,
  },
]

export default function ExportModal({ isOpen, onClose, onExport }) {
  const [selected, setSelected] = useState('png')
  const [exporting, setExporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [success, setSuccess] = useState(false)
  const [filename, setFilename] = useState('')

  if (!isOpen) return null

  const handleExport = async () => {
    setExporting(true)
    setProgress(0)

    // Simulate progress
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) { clearInterval(interval); return 90 }
        return p + 15
      })
    }, 150)

    try {
      await onExport(selected)
      clearInterval(interval)
      setProgress(100)

      const name = `uml-diagram.${selected}`
      setFilename(name)

      setTimeout(() => {
        setExporting(false)
        setProgress(0)
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3500)
        onClose()
      }, 400)
    } catch {
      clearInterval(interval)
      setExporting(false)
      setProgress(0)
    }
  }

  return (
    <>
      {/* Overlay */}
      <div className="export-overlay" onClick={onClose} />

      {/* Modal */}
      <div className="export-modal">

        {/* Header */}
        <div className="export-modal-header">
          <div>
            <h3 className="export-modal-title">Export Diagram</h3>
            <p className="export-modal-subtitle">Choose your preferred format and quality settings</p>
          </div>
          <button className="export-close-btn" onClick={onClose} type="button">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="export-modal-body">

          {/* Format options */}
          <div className="export-formats">
            {FORMATS.map((fmt) => (
              <div
                key={fmt.id}
                className={`export-format-item ${selected === fmt.id ? 'active' : ''}`}
                onClick={() => setSelected(fmt.id)}
              >
                <div className={`export-format-icon ${selected === fmt.id ? 'active' : ''}`}>
                  <span className="material-symbols-outlined" style={{ fontSize: 28 }}>{fmt.icon}</span>
                </div>

                <div className="export-format-info">
                  <div className="export-format-title-row">
                    <h4 className="export-format-title">{fmt.label}</h4>
                    {fmt.badge && (
                      <span className={`export-format-badge ${selected === fmt.id ? 'active' : ''}`}>
                        {fmt.badge}
                      </span>
                    )}
                  </div>
                  <p className="export-format-desc">{fmt.description}</p>
                </div>

                <div className={`export-radio ${selected === fmt.id ? 'active' : ''}`}>
                  {selected === fmt.id && <div className="export-radio-dot" />}
                </div>
              </div>
            ))}
          </div>

          {/* Side panel */}
          <div className="export-side">

            {/* Preview */}
            <div className="export-preview-box">
              <span className="export-preview-label">Preview</span>
              <div className="export-preview-thumb">
                <div className="export-preview-mock">
                  <div style={{ height: 12, width: '50%', background: 'rgba(124,59,237,0.3)', borderRadius: 4 }} />
                  <div style={{ height: 48, width: '100%', border: '1px solid rgba(124,59,237,0.2)', borderRadius: 4 }} />
                  <div style={{ height: 32, width: '75%', border: '1px solid rgba(124,59,237,0.2)', borderRadius: 4, margin: '0 auto' }} />
                </div>
              </div>
              <div className="export-preview-meta">
                <div className="export-meta-row">
                  <span>File size</span>
                  <span>{selected === 'png' ? '1.2 MB' : selected === 'svg' ? '48 KB' : '890 KB'}</span>
                </div>
                <div className="export-meta-row">
                  <span>Format</span>
                  <span>{selected.toUpperCase()}</span>
                </div>
              </div>
            </div>

            {/* Progress + Button */}
            <div className="export-action">
              {exporting && (
                <div className="export-progress-wrap">
                  <div className="export-progress-header">
                    <span className="export-progress-label">EXPORTING...</span>
                    <span className="export-progress-pct">{progress}%</span>
                  </div>
                  <div className="export-progress-bar">
                    <div className="export-progress-fill" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}

              <button
                className="export-generate-btn"
                onClick={handleExport}
                disabled={exporting}
                type="button"
              >
                <span className="material-symbols-outlined">download</span>
                {exporting ? 'Generating...' : 'Generate File'}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Success toast */}
      {success && (
        <div className="export-toast">
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>check_circle</span>
          <span>
            Downloaded <strong style={{ textDecoration: 'underline' }}>{filename}</strong> successfully.
          </span>
          <button onClick={() => setSuccess(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6, color: 'inherit', display: 'flex' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
          </button>
        </div>
      )}
    </>
  )
}