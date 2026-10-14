import '@/components/landing/landing.css'
import Image from 'next/image'

const developers = [
  {
    name: 'Naam Ramzi',
    role: 'Frontend Developer',
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    avatar: 'NR',
  },
  {
    name: 'Elhreich Haifa',
    role: 'Backend Developer',
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    avatar: 'EH',
  },
]

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">

        
        <div className="footer-brand">
          <div className="footer-logo">
            <div className="footer-logo-icon">
              <Image
                src="/navbar_logo.png"       // path from public/
                alt="Archimind Logo"
                width={26}            // adjust size as needed
                height={26}
              />
            </div>
            <span className="footer-logo-text">Archimind</span>
          </div>
          <p className="footer-tagline">
            The ultimate AI-powered diagramming tool for developers.
          </p>
          <div className="footer-socials">
            <a href="#" className="footer-social-btn" aria-label="GitHub">
              <svg style={{ width: 16, height: 16, fill: '#94a3b8' }} viewBox="0 0 24 24">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.042-1.416-4.042-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
          </div>
        </div>

        
        <div className="footer-col">
          <h4 className="footer-col-title">University</h4>
          <div className="footer-university">
            <div className="footer-university-card">
              <div className="footer-university-icon">
                <span className="material-symbols-outlined" style={{ color: '#7c3bed', fontSize: 20 }}>
                  school
                </span>
              </div>
              <div>
                <p className="footer-university-name">EPI Digital School</p>
                <p className="footer-university-dept">Department of Computer Science</p>
              </div>
            </div>
            <p className="footer-university-year"> Year Project — 2025/2026</p>
          </div>
        </div>

        <div className="footer-col footer-col-span">
          <h4 className="footer-col-title">Developers</h4>
          <div className="footer-dev-grid">
            {developers.map((dev) => (
              <div key={dev.name} className="footer-dev-card">

                <div className="footer-dev-header">
                  <div className="footer-dev-avatar">{dev.avatar}</div>
                  <div>
                    <p className="footer-dev-name">{dev.name}</p>
                    <p className="footer-dev-role">{dev.role}</p>
                  </div>
                </div>

                <div className="footer-dev-links">
                  <a href={dev.github} target="_blank" rel="noreferrer" className="footer-dev-github">
                    <svg style={{ width: 12, height: 12, fill: 'currentColor' }} viewBox="0 0 24 24">
                      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.042-1.416-4.042-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                    </svg>
                    GitHub
                  </a>
                  <a href={dev.linkedin} target="_blank" rel="noreferrer" className="footer-dev-linkedin">
                    <span className="material-symbols-outlined" style={{ fontSize: 12 }}>work</span>
                    LinkedIn
                  </a>
                </div>

              </div>
            ))}
          </div>
        </div>

      </div>

      
      <div className="footer-bottom">
        <p className="footer-copy">
          © 2026 Archimind — All rights reserved.
        </p>
        
      </div>

    </footer>
  )
}