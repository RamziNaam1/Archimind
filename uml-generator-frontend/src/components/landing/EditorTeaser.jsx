import Link from 'next/link'
import '@/components/landing/landing.css'

const checkItems = [
 
  { text: 'Describe your diagram in natural language', color: '#7c3bed' },
  { text: 'Edit the generated Mermaid.js code',        color: '#06b6d4' },
  { text: 'Export as PNG, SVG or PDF',                 color: '#10b981' },
]


export default function EditorTeaser() {
  return (
    <section className="editor-section">
      <div className="editor-wrapper">
        <div className="editor-gradient" />
        <div className="editor-inner">

          <div className="editor-left">
            <h2 className="editor-title">Experience the 3-Panel Editor</h2>
            <p className="editor-desc">
              A glassmorphic interface designed for deep focus. Watch your code evolve
              into visual structures as you type. Real-time collaboration made simple.
            </p>
            <ul className="editor-checklist">
              {checkItems.map((item) => (
                <li key={item.text} className="editor-check-item">
                  <span className="material-symbols-outlined" style={{ color: item.color, fontSize: 20 }}>
                    check_circle
                  </span>
                  {item.text}
                </li>
              ))}
            </ul>
            <Link href="/login" className="editor-cta">Try the Editor Now</Link>
          </div>

          <div className="editor-preview">
            <div className="editor-panels">

              <div className="panel panel-chat">
                <p className="panel-label">AI Assistant</p>
                <div className="chat-user">"Add a sequence diagram for the auth flow."</div>
                <div className="chat-ai">"Generating Mermaid syntax for OAuth2 flow..."</div>
              </div>

              <div className="panel panel-code">
                <p className="code-label">Editor.md</p>
                <div style={{ color: '#06b6d4' }}>sequenceDiagram</div>
                <div style={{ color: '#e2e8f0' }}>{'  Alice->>John: Hello'}</div>
                <div style={{ color: '#e2e8f0' }}>{'  loop Healthcheck'}</div>
                <div style={{ color: '#7c3bed', paddingLeft: '1rem' }}>{'John->>John: Fight'}</div>
                <div style={{ color: '#e2e8f0' }}>{'  end'}</div>
              </div>

              <div className="panel panel-preview">
                <p className="panel-label">Live Preview</p>
                <div className="preview-box">
                  <div className="preview-nodes">
                    <div className="preview-node-a" />
                    <div className="preview-node-b" />
                  </div>
                  <div className="preview-arrow">
                    <div className="preview-arrow-line" />
                    <div className="preview-arrow-dot" />
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  )
}