import Link from 'next/link'
import '@/components/landing/landing.css'
import ThemeToggle from '@/components/ui/ThemeToggle'
import Image from 'next/image'

export default function Navbar({ hideActions = false }) {
  return (
    <header className="nav-header">

      <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div className="nav-logo-icon">
          <Image
            src="/logo-test.png"       // path from public/
            alt="Archimind Logo"
            width={32}            // adjust size as needed
            height={32}
          />
        </div>
        <span className="nav-logo-text">Archimind</span>
      </Link>

      
      <div className="nav-actions">
        <ThemeToggle />
        {!hideActions && (
          <Link href="/login" className="btn-cta">Get Started Now</Link>
        )}
      </div>

    </header>
  )
}