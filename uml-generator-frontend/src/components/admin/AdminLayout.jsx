'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader'
import StatsCards from './StatsCards'
import UsersTable from './UsersTable'
import './admin.css'

export default function AdminLayout() {
  const [activeNav, setActiveNav] = useState('User Management')
  const [user, setUser] = useState(null)
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [editingUser, setEditingUser] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', email: '', role: 'user', status: 'active' })
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    adminUsers: 0
  })
  const router = useRouter()

  const filterUsers = (userList, term = searchTerm) => {
    return userList.filter(u =>
      u.name.toLowerCase().includes(term.toLowerCase()) ||
      u.email.toLowerCase().includes(term.toLowerCase())
    )
  }

  const saveUsers = (regularUsers) => {
    const storedUsers = localStorage.getItem('users')
    const { users: mockUsers } = require('@/lib/mocks')
    const allUsers = storedUsers ? JSON.parse(storedUsers) : mockUsers
    const adminUsers = allUsers.some(u => u.role === 'admin')
      ? allUsers.filter(u => u.role === 'admin')
      : mockUsers.filter(u => u.role === 'admin')
    const nextUsers = [...regularUsers, ...adminUsers]

    localStorage.setItem('users', JSON.stringify(nextUsers))
    return nextUsers
  }

  // Load data on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (!storedUser) {
      router.push('/login')
      return
    }

    const userData = JSON.parse(storedUser)
    if (userData.role !== 'admin') {
      router.push('/dashboard')
      return
    }

    setUser(userData)

    // Load all users from localStorage
    const storedUsers = localStorage.getItem('users')
    const { users: mockUsers } = require('@/lib/mocks')
    
    let allUsers = storedUsers ? JSON.parse(storedUsers) : mockUsers
    if (!allUsers.some(u => u.role === 'admin')) {
      allUsers = [...allUsers, ...mockUsers.filter(u => u.role === 'admin')]
    }
    if (!storedUsers) {
      localStorage.setItem('users', JSON.stringify(mockUsers))
    }
    
    // Filter out admin users from regular user list
    const regularUsers = allUsers.filter(u => u.role !== 'admin')
    setUsers(regularUsers)
    setFilteredUsers(regularUsers)

    // Calculate stats
    calculateStats(allUsers)
  }, [router])

  // Calculate user statistics
  const calculateStats = (userList) => {
    const activeCount = userList.filter(u => u.status === 'active').length
    const inactiveCount = userList.filter(u => u.status === 'inactive').length
    const adminCount = userList.filter(u => u.role === 'admin').length
    const totalCount = userList.length

    setStats({
      totalUsers: totalCount,
      activeUsers: activeCount,
      inactiveUsers: inactiveCount,
      adminUsers: adminCount
    })
  }

  // Handle search
  const handleSearch = (term) => {
    setSearchTerm(term)
    setFilteredUsers(filterUsers(users, term))
  }

  // Handle user delete
  const handleDeleteUser = (userId) => {
    const targetUser = users.find(u => u.id === userId)
    if (!targetUser) return
    if (!window.confirm(`Delete ${targetUser.name}? This cannot be undone.`)) return

    const updatedUsers = users.filter(u => u.id !== userId)
    const allUsers = saveUsers(updatedUsers)
    setUsers(updatedUsers)
    setFilteredUsers(filterUsers(updatedUsers))
    calculateStats(allUsers)
  }

  // Handle user status toggle
  const handleToggleStatus = (userId) => {
    const updatedUsers = users.map(u => 
      u.id === userId ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u
    )
    const allUsers = saveUsers(updatedUsers)
    setUsers(updatedUsers)
    setFilteredUsers(filterUsers(updatedUsers))
    calculateStats(allUsers)
  }

  const handleResetPassword = (userId) => {
    const targetUser = users.find(u => u.id === userId)
    if (!targetUser) return
    if (!window.confirm(`Reset ${targetUser.name}'s password to 123456?`)) return

    const updatedUsers = users.map(u =>
      u.id === userId ? { ...u, password: '123456' } : u
    )
    saveUsers(updatedUsers)
    setUsers(updatedUsers)
    setFilteredUsers(filterUsers(updatedUsers))
    window.alert(`${targetUser.name}'s password was reset to 123456.`)
  }

  const handleOpenEdit = (selectedUser) => {
    setEditingUser(selectedUser)
    setEditForm({
      name: selectedUser.name,
      email: selectedUser.email,
      role: selectedUser.role,
      status: selectedUser.status,
    })
  }

  const handleSaveEdit = (e) => {
    e.preventDefault()
    if (!editingUser) return

    const updatedUsers = users.map(u =>
      u.id === editingUser.id ? { ...u, ...editForm } : u
    )
    const allUsers = saveUsers(updatedUsers)
    setUsers(updatedUsers)
    setFilteredUsers(filterUsers(updatedUsers))
    calculateStats(allUsers)
    setEditingUser(null)
  }

  if (!user) {
    return (
      <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh'}}>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="admin-container">
      <AdminSidebar activeNav={activeNav} setActiveNav={setActiveNav} />
      
      <div className="admin-main-wrapper">
        <AdminHeader searchTerm={searchTerm} onSearch={handleSearch} />
        
        <main className="admin-main-content">
          <div className="admin-content-header">
            <div>
              <label className="admin-section-label">Security Node / IAM</label>
              <div className="admin-header-title-group">
                <h2 className="admin-page-title">All Users</h2>
                <span className="admin-total-count">{stats.totalUsers} Total Entities</span>
              </div>
            </div>
          </div>

          <StatsCards stats={stats} />
          
          <div className="admin-table-section">
            <UsersTable 
              users={filteredUsers} 
              onDeleteUser={handleDeleteUser}
              onToggleStatus={handleToggleStatus}
              onResetPassword={handleResetPassword}
              onEditUser={handleOpenEdit}
              totalCount={users.length}
            />
          </div>

          
        </main>
      </div>

      {editingUser && (
        <div className="admin-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="edit-user-title">
          <form className="admin-edit-modal" onSubmit={handleSaveEdit}>
            <div className="admin-edit-header">
              <div>
                <h2 id="edit-user-title" className="admin-edit-title">Edit User</h2>
                <p className="admin-edit-subtitle">{editingUser.email}</p>
              </div>
              <button className="admin-edit-close" type="button" onClick={() => setEditingUser(null)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <label className="admin-edit-field">
              <span>Name</span>
              <input
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </label>

            <label className="admin-edit-field">
              <span>Email</span>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </label>

            <label className="admin-edit-field">
              <span>Role</span>
              <select
                value={editForm.role}
                onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))}
              >
                <option value="user">user</option>
                <option value="lead-dev">lead-dev</option>
                <option value="security-analyst">security-analyst</option>
                <option value="contractor">contractor</option>
                <option value="qa-lead">qa-lead</option>
              </select>
            </label>

            <label className="admin-edit-field">
              <span>Status</span>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </select>
            </label>

            <div className="admin-edit-actions">
              <button className="admin-edit-cancel" type="button" onClick={() => setEditingUser(null)}>
                Cancel
              </button>
              <button className="admin-edit-save" type="submit">
                Save changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
