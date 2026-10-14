'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/context/AuthContext'


const TABS = ['All Projects']

export default function DashboardHeader() {
  const [activeTab, setActiveTab] = useState('All Projects')
  const router = useRouter()
  const { user } = useAuth()

  return (
    <header className="dash-header glass-header">
      <div className="dash-header-inner">

        {/* Left: Logo + Tabs */}
        <div className="dash-header-left">

          {/* Logo */}
          <Link href="/" className="dash-logo">
            <div className="dash-logo-icon">
              <Image
                src="/dash_logo.png"       
                alt="Archimind Logo"
                width={32}           
                height={32}
              />
            </div>
            <span className="dash-logo-text">Archimind </span>
          </Link>

          {/* Filter tabs */}
          <nav className="dash-tabs">
            {TABS.map((tab) => (
              <button
                key={tab}
                className={`dash-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
                type="button"
              >
                {tab}
              </button>
            ))}
          </nav>

        </div>

        {/* Right: User menu */}
        <div className="dash-user">
          <button className="dash-user-btn" type="button">
            <div className="dash-avatar">{user?.firstName?.[0]?.toUpperCase() || 'U'}</div>
            <span className="material-symbols-outlined" style={{ color: '#94a3b8', fontSize: 18 }}>
              expand_more
            </span>
          </button>

          <div className="dash-dropdown glass-card">
            <Link href="/profile" className="dash-dropdown-item">
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>person</span>
              Profile
            </Link>
            <button
              className="dash-dropdown-item danger"
              onClick={() => router.push('/login')}
              type="button"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>logout</span>
              Logout
            </button>
          </div>
        </div>

      </div>
    </header>
  )
}