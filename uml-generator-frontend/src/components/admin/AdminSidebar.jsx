'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function AdminSidebar({ activeNav, setActiveNav }) {
  const router = useRouter()
  const [user, setUser] = useState(null)

  // Get user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const navItems = [
    { icon: 'group', label: 'User Management' },
  ]

  const handleLogout = () => {
    localStorage.removeItem('user')
    router.push('/login')
  }

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-inner">
        {/* Logo */}
        <div className="admin-logo">
          <div className="admin-logo-text">Obsidian Admin</div>
        </div>

        {/* User Profile */}
        <div className="admin-user-profile">
          <div className="admin-avatar">
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="admin-user-info">
            <p className="admin-user-name">{user?.name || 'The Architect'}</p>
            <p className="admin-user-role">Super Admin</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="admin-nav">
          {navItems.map((item) => (
            <a
              key={item.label}
              className={`admin-nav-item ${activeNav === item.label ? 'active' : ''}`}
              onClick={() => setActiveNav(item.label)}
            >
              <span className="material-symbols-outlined admin-nav-icon" data-icon={item.icon}>
                {item.icon}
              </span>
              <span className="admin-nav-label">{item.label}</span>
            </a>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="admin-sidebar-bottom">
          <button className="admin-deploy-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </aside>
  )
}