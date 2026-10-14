import Link from 'next/link'
import Image from 'next/image'
const NAV_ITEMS = [
  { label: 'General',       icon: 'person',        href: '/profile' },
  //{ label: 'Security',      icon: 'security',      href: '/profile/security' },
  //{ label: 'Notifications', icon: 'notifications', href: '/profile/notifications' },
  //{ label: 'API Keys',      icon: 'vpn_key',       href: '/profile/api-keys' },
]

export default function ProfileSidebar({ active = 'General' }) {
  return (
    <aside className="profile-sidebar">

      {/* Brand */}
      <Link href="/dashboard" className="profile-sidebar-brand">
        <button className="profile-arrow-back" type="button" title="Back to Dashboard">
            <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#fff' }}>
              arrow_back
            </span>
        </button>
        <div className="profile-sidebar-icon">
          <Image
            src="/dash_logo.png"       
            alt="Archimind Logo"
            width={32}           
            height={32}
          />
        </div>
        <div>
          <span className="profile-sidebar-name">Archimind</span>
          <span className="profile-sidebar-sub">Settings</span>
        </div>
      </Link>

      {/* Nav */}
      <nav className="profile-nav">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`profile-nav-item ${active === item.label ? 'active' : ''}`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              {item.icon}
            </span>
            {item.label}
          </Link>
        ))}
      </nav>

    </aside>
  )
}