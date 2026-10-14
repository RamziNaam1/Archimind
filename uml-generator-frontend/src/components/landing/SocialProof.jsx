import '@/components/landing/landing.css'

const stack = [
  { name: 'Next.js 16',    icon: '▲' },
  { name: 'NestJS',        icon: '⬡' },
  { name: 'Ai-tool',        icon: '✦' },
  { name: 'Mermaid.js',    icon: '◈' },
  { name: 'Monaco Editor', icon: '{ }' },
  { name: 'PostgreSQL',    icon: '🐘' },
]

export default function SocialProof() {
  return (
    <section className="social-section">
      <p className="social-label">Built with modern technologies</p>
      <div className="social-logos">
        {stack.map((s) => (
          <div key={s.name} className="social-company">
            <span>{s.icon}</span>
            {s.name}
          </div>
        ))}
      </div>
    </section>
  )
}