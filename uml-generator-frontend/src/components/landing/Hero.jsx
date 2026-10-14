import Link from 'next/link'
import '@/components/landing/landing.css'

export default function Hero() {
  return (
    <section className="hero-section">

      <div className="hero-left">

        <div className="hero-badge">
          <span className="hero-badge-dot">
            <span className="hero-badge-ping" />
            <span className="hero-badge-core" />
          </span>
          Make it simple. Make it clear. Make it Archimind.
        </div>

        <h1 className="hero-title">
          Transform Code into Clarity{' '}
          <span className="hero-title-accent">with AI</span>
        </h1>

        <p className="hero-subtext">
          Generate professional UML diagrams from natural language or code in seconds.
          Experience the future of software architecture.
        </p>

        <div className="hero-buttons">
          <Link href="/login" className="hero-btn-primary">
            Get Started Now
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_forward</span>
          </Link>
          
        </div>

      </div>

      <div className="hero-right" data-theme="dark">
        <div className="hero-glow" />
        <div className="hero-window">

          <div className="hero-titlebar">
            {['#ef4444', '#eab308', '#22c55e'].map((color, i) => (
              <div key={i} className="hero-dot" style={{ background: color }} />
            ))}
          </div>

          <div className="hero-body">
            <div className="hero-sidebar">
              {[75, 50, 65].map((w, i) => (
                <div key={i} className="hero-skeleton" style={{ width: `${w}%` }} />
              ))}
            </div>
            <div className="hero-canvas">
              <div className="uml-wrapper">
                <div className="uml-box">
                  <div className="uml-line" />
                  <div className="uml-line-sm" />
                </div>
                <div className="uml-connector" />
                <div className="uml-children">
                  <div className="uml-child" />
                  <div className="uml-child" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

    </section>
  )
}