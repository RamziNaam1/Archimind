'use client'

import ThemeToggle from '@/components/ui/ThemeToggle'

export default function AdminHeader({ searchTerm = '', onSearch }) {
  return (
    <header className="admin-header">
      <div className="admin-header-inner">
        {/* Left: Title */}
        <h1 className="admin-console-title">Admin Console</h1>

        {/* Center: Search */}
        <div className="admin-search-wrap">
          <span className="material-symbols-outlined admin-search-icon" data-icon="search">
            search
          </span>
          <input
            className="admin-search-input"
            type="text"
            placeholder="Search systems..."
            value={searchTerm}
            onChange={(e) => onSearch && onSearch(e.target.value)}
          />
        </div>

        <div className="admin-header-actions">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
