'use client'

import { useEffect, useRef, useState } from 'react'
import { useTheme } from 'next-themes'
import ExportModal from '@/components/editor/ExportModal'

export default function PreviewPanel({ code }) {
  const { resolvedTheme } = useTheme()
  const containerRef = useRef(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [scale, setScale] = useState(1)
  const mermaidTheme = resolvedTheme === 'light' ? 'default' : 'dark'

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.2, 3))
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5))
  const handleCenter = () => setScale(1)

  useEffect(() => {
    if (!code) return

    let cancelled = false
    setLoading(true)
    setError(null)

    const renderDiagram = async () => {
      try {
        const mermaid = (await import('mermaid')).default
        mermaid.initialize({ 
          startOnLoad: false, 
          theme: mermaidTheme,
          securityLevel: 'loose' 
        })

        const id = `mermaid-${Date.now()}`
        if (!containerRef.current) return
        containerRef.current.innerHTML = ''

        const result = await mermaid.render(id, code)
        const svg = typeof result === 'string' ? result : result.svg

        if (!containerRef.current) return
        containerRef.current.innerHTML = svg

        const svgEl = containerRef.current.querySelector('svg')
        if (svgEl) {
          svgEl.style.maxWidth = '100%'
          svgEl.style.height = 'auto'
        }
      } catch (err) {
        console.error('MERMAID ERROR:', err)
        if (!cancelled) setError(err.message || 'Syntax error in diagram code.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    const timer = setTimeout(renderDiagram, 400)
    return () => { cancelled = true; clearTimeout(timer) }
  }, [code, mermaidTheme])

  // ── Export Logic ──
  const handleExport = async (format) => {
  if (!containerRef.current) return;
  const svgEl = containerRef.current.querySelector('svg');
  if (!svgEl) return;

  // 1. Prepare the SVG string and encode it safely for the browser
  const serializer = new XMLSerializer();
  let svgString = serializer.serializeToString(svgEl);
  
  // Ensure the XML namespace is present, otherwise the canvas might fail
  if (!svgString.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
    svgString = svgString.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
  }

  // Use btoa with encodeURIComponent to handle special characters (like emojis/symbols)
  const svgBase64 = window.btoa(unescape(encodeURIComponent(svgString)));
  const url = `data:image/svg+xml;base64,${svgBase64}`;

  if (format === 'svg') {
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diagram.svg';
    a.click();
    return;
  }

  if (format === 'png' || format === 'pdf') {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    // CRITICAL: This helps prevent the "Tainted Canvas" error
    img.crossOrigin = 'anonymous';

    await new Promise((resolve, reject) => {
      img.onload = async () => {
        try {
          const multiplier = 2; // High DPI export
          canvas.width = img.width * multiplier;
          canvas.height = img.height * multiplier;
          
          // Background fill (prevents transparency turning black in PDF)
          ctx.fillStyle = '#0a0712'; 
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          if (format === 'png') {
            const pngUrl = canvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = pngUrl;
            a.download = 'diagram.png';
            a.click();
          } 
          else if (format === 'pdf') {
            const { jsPDF } = await import('jspdf');
            const orientation = img.width > img.height ? 'l' : 'p';
            const pdf = new jsPDF(orientation, 'px', [img.width, img.height]);
            const imgData = canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', 0, 0, img.width, img.height);
            pdf.save('diagram.pdf');
          }
          resolve();
        } catch (err) {
          console.error("Export failed:", err);
          reject(err);
        }
      };
      img.onerror = reject;
      img.src = url;
    });
  }
};

  return (
    <>
      <section className="preview-panel">
        <div className="panel-toolbar">
          <div className="panel-toolbar-left">
            <span className="material-symbols-outlined" style={{ color: '#7c3bed', fontSize: 18 }}>monitoring</span>
            <span className="panel-toolbar-title">Diagram Preview</span>
          </div>
          <div className="panel-toolbar-right">
            <button className="toolbar-btn" title="Zoom in" onClick={handleZoomIn}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>zoom_in</span>
            </button>
            <button className="toolbar-btn" title="Zoom out" onClick={handleZoomOut}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>zoom_out</span>
            </button>
            <button className="toolbar-btn" title="Center" onClick={handleCenter}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>center_focus_strong</span>
            </button>
            <div className="toolbar-divider" />
            <button
              className="toolbar-btn"
              onClick={() => setExportOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.375rem 0.75rem', color: '#7c3bed', fontWeight: 700, fontSize: '0.8rem' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>download</span>
              Export
            </button>
          </div>
        </div>

        <div className="preview-content">
          {loading && (
            <div className="preview-loading">
              <div className="preview-loading-spinner" />
              <span>Rendering...</span>
            </div>
          )}

          {error && !loading && (
            <div className="preview-error-box" style={{ textAlign: 'center', color: '#f87171' }}>
              <span className="material-symbols-outlined">error</span>
              <p>{error}</p>
            </div>
          )}

          <div 
            className="preview-mermaid-wrap" 
            style={{ 
              display: loading || error ? 'none' : 'flex',
              overflow: 'auto',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              width: '100%'
            }}
          >
            <div 
              ref={containerRef} 
              style={{ 
                transform: `scale(${scale})`, 
                transition: 'transform 0.2s ease-out',
                transformOrigin: 'center' 
              }} 
            />
          </div>
        </div>
      </section>

      <ExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        onExport={handleExport}
      />
    </>
  )
}
