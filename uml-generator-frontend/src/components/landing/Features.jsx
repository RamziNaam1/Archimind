import '@/components/landing/landing.css'

const features = [
  {
    icon: 'hub',
    color: '#7c3bed',
    bg: 'rgba(124,59,237,0.15)',
    title: 'AI-Powered Generation',
    desc: 'Convert natural language requirements into complex diagrams instantly using advanced large language models.',
  },
  {
    icon: 'code',
    color: '#06b6d4',
    bg: 'rgba(6,182,212,0.15)',
    title: 'Mermaid.js Integration',
    desc: 'Full compatibility with Mermaid.js syntax for version-controlled, text-based diagramming in your CI/CD.',
  },
  {
    icon: 'download',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.15)',
    title: 'Multi-format Export',
    desc: 'Export your architectures as high-resolution SVG, PNG, or PDF for seamless documentation in Notion or Jira.',
  },
]

export default function Features() {
  return (
    <section className="features-section">
      <div className="features-header">
        <h2 className="features-title">Engineered for Modern Developers</h2>
        <div className="features-divider" />
        <p className="features-subtitle">
          Powerful tools to streamline your documentation workflow and eliminate technical debt.
        </p>
      </div>
      <div className="features-grid">
        {features.map((f) => (
          <div key={f.title} className="feature-card">
            <div className="feature-glow" style={{ background: f.bg }} />
            <div className="feature-icon" style={{ background: f.bg }}>
              <span className="material-symbols-outlined" style={{ color: f.color, fontSize: 28 }}>
                {f.icon}
              </span>
            </div>
            <h3 className="feature-title">{f.title}</h3>
            <p className="feature-desc">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}