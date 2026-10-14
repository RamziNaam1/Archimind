'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { apiRequest } from '@/lib/api'
import { FaGithub } from 'react-icons/fa' 
import Image from 'next/image'

const EXPORT_FORMATS = ['SVG', 'PNG', 'PDF', 'MERMAID']
const UML_TYPES = ['Class Diagram', 'Sequence Diagram', 'State Machine', 'Use Case']

export default function ProfileForm() {
  const router = useRouter()
  const { user } = useAuth()

  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    umlType: 'Class Diagram',
    exportFormat: 'SVG',
    avatarUrl: user?.avatarUrl || '',
  })

  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirm: '',
  })

  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirm: false,
  })

  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [saveSuccess, setSaveSuccess] = useState('')
  const [saveError, setSaveError] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // Load current profile from API
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await apiRequest('/users/profile', { method: 'GET' })
        if (profile) {
          setForm((prev) => ({
            ...prev,
            firstName: profile.firstName || '',
            lastName: profile.lastName || '',
            email: profile.email || '',
            avatarUrl: profile.avatarUrl || '',
          }))
        }
      } catch (err) {
        console.error('Failed to load profile:', err)
      }
    }
    loadProfile()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleExport = (format) => {
    setForm((prev) => ({ ...prev, exportFormat: format }))
  }

  const toggleEye = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  // ── Save profile info ──
  const handleSave = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    setSaveError('')
    setSaveSuccess('')

    try {
      await apiRequest('/users/profile', {
        method: 'PATCH',
        body: {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
        }
      })
      setSaveSuccess('Profile saved successfully! ✓')
      setTimeout(() => setSaveSuccess(''), 3000)
    } catch (err) {
      setSaveError(err.message || 'Failed to save profile')
    } finally {
      setSavingProfile(false)
    }
  }

  // ── Change password ──
  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    // Validation
    if (!passwords.oldPassword.trim()) {
      setPasswordError('Current password is required')
      return
    }

    if (!passwords.newPassword.trim()) {
      setPasswordError('New password is required')
      return
    }

    if (passwords.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters')
      return
    }

    if (passwords.newPassword !== passwords.confirm) {
      setPasswordError('Passwords do not match')
      return
    }

    // Check password strength
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/
    if (!strongPasswordRegex.test(passwords.newPassword)) {
      setPasswordError('Password must contain uppercase, lowercase, number, and special character (@$!%*?&)')
      return
    }

    setSavingPassword(true)

    try {
      await apiRequest('/users/change-password', {
        method: 'POST',
        body: {
          oldPassword: passwords.oldPassword.trim(),
          newPassword: passwords.newPassword.trim(),
        }
      })

      setPasswordSuccess('Password updated successfully! ✓')
      setPasswords({ oldPassword: '', newPassword: '', confirm: '' })
      setTimeout(() => setPasswordSuccess(''), 3000)
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password')
    } finally {
      setSavingPassword(false)
    }
  }

  // ── Upload avatar ──
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.match(/image\/(jpg|jpeg|png)/)) {
      setSaveError('Only JPG, JPEG, and PNG files are allowed')
      return
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      setSaveError('File size must be less than 2MB')
      return
    }

    setUploadingAvatar(true)
    setSaveError('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const response = await fetch('http://localhost:3001/api/users/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.message || 'Failed to upload avatar')
      }

      const data = await response.json()
      setForm((prev) => ({ ...prev, avatarUrl: data.avatarUrl }))
      setSaveSuccess('Avatar updated successfully! ✓')
      setTimeout(() => setSaveSuccess(''), 3000)
    } catch (err) {
      setSaveError(err.message || 'Failed to upload avatar')
    } finally {
      setUploadingAvatar(false)
    }
  }

  return (
    <div>
      {/* ── Avatar card ── */}
      <div className="profile-glass profile-avatar-card">
        <div className="profile-avatar-wrap">
          <div className="profile-avatar-img">
            {form.avatarUrl ? (
              <Image
                src={form.avatarUrl}
                alt="Profile avatar"
                width={100}
                height={100}
                style={{ borderRadius: '8px', objectFit: 'cover' }}
              />
            ) : (
              <div className="profile-avatar-img-placeholder">
                {form.firstName?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
          </div>
          <button className="profile-avatar-cam" type="button" title="Change photo"
            onClick={(e) => e.currentTarget.nextElementSibling?.click()}>
            <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#fff' }}>
              photo_camera
            </span>
            <input
              type="file"
              accept="image/jpg,image/jpeg,image/png"
              onChange={handleAvatarUpload}
              disabled={uploadingAvatar}
              style={{ display: 'none' }}
            />
          </button>
        </div>

        <div className="profile-avatar-info">
          <h3 className="profile-avatar-name">{form.firstName || 'User'}</h3>
          <p className="profile-avatar-role">Developer</p>
          <div className="profile-avatar-actions">
            <button 
              className="profile-btn-primary" 
              type="button"
              onClick={(e) => e.currentTarget.previousElementSibling?.previousElementSibling?.previousElementSibling?.querySelector('input')?.click()}
              disabled={uploadingAvatar}
            >
              {uploadingAvatar ? 'Uploading...' : 'Upload New Avatar'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Profile form ── */}
      <form onSubmit={handleSave}>
        <div className="profile-grid">

          {/* Basic Information */}
          <section>
            <h4 className="profile-section-title">
              <span className="material-symbols-outlined" style={{ color: '#8b5cf6', fontSize: 22 }}>badge</span>
              Basic Information
            </h4>

            {saveSuccess && (
              <div style={{
                background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.3)',
                borderRadius: '0.75rem',
                padding: '0.75rem 1rem',
                color: '#34d399',
                fontSize: '0.8rem',
                marginBottom: '1rem',
                fontFamily: 'JetBrains Mono, monospace',
              }}>
                {saveSuccess}
              </div>
            )}

            {saveError && (
              <div style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '0.75rem',
                padding: '0.75rem 1rem',
                color: '#f87171',
                fontSize: '0.8rem',
                marginBottom: '1rem',
                fontFamily: 'JetBrains Mono, monospace',
              }}>
                {saveError}
              </div>
            )}

            <div className="profile-field">
              <label className="profile-label">First Name</label>
              <input
                className="profile-input"
                name="firstName"
                type="text"
                value={form.firstName}
                onChange={handleChange}
                placeholder="John"
                disabled={savingProfile}
              />
            </div>

            <div className="profile-field">
              <label className="profile-label">Last Name</label>
              <input
                className="profile-input"
                name="lastName"
                type="text"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Doe"
                disabled={savingProfile}
              />
            </div>

            <div className="profile-field">
              <label className="profile-label">Work Email</label>
              <input
                className="profile-input"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="your@email.com"
                disabled={savingProfile}
              />
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label className="profile-label">Change Theme</label>
              <ThemeToggle />
            </div>
          </section>

          {/* Dev Preferences */}
          <section>
            <h4 className="profile-section-title">
              <span className="material-symbols-outlined" style={{ color: '#06b6d4', fontSize: 22 }}>terminal</span>
              Dev Preferences
            </h4>

            <div className="profile-field">
              <label className="profile-label">Default UML Type</label>
              <select
                className="profile-select"
                name="umlType"
                value={form.umlType}
                onChange={handleChange}
              >
                {UML_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="profile-field">
              <label className="profile-label">Preferred Export Format</label>
              <div className="profile-export-btns">
                {EXPORT_FORMATS.map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    className={`profile-export-btn ${form.exportFormat === fmt ? 'active' : ''}`}
                    onClick={() => handleExport(fmt)}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            <div className="profile-field">
              <label className="profile-label">GitHub Integration</label>
              <div className="profile-github">
                <div className="profile-github-left">
                  <FaGithub size={22} />
                  <span className="profile-github-handle">Connect GitHub</span>
                </div>
                <button className="profile-github-disconnect" type="button">Connect</button>
              </div>
            </div>
          </section>

        </div>

        {/* Save footer */}
        <footer className="profile-footer">
          <p className="profile-footer-date">
            Logged in as {form.email || '—'}
          </p>
          <div className="profile-footer-actions">
            <button
              className="profile-btn-cancel"
              type="button"
              onClick={() => router.push('/dashboard')}
              disabled={savingProfile}
            >
              Cancel
            </button>
            <button 
              className="profile-btn-save" 
              type="submit"
              disabled={savingProfile}
            >
              {savingProfile ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </footer>
      </form>

      {/* ── Change Password section ── */}
      <div style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <h4 className="profile-section-title">
          <span className="material-symbols-outlined" style={{ color: '#8b5cf6', fontSize: 22 }}>lock</span>
          Change Password
        </h4>

        <form onSubmit={handleChangePassword} style={{ maxWidth: 440, display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Error / Success */}
          {passwordError && (
            <div style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '0.75rem',
              padding: '0.75rem 1rem',
              color: '#f87171',
              fontSize: '0.8rem',
              fontFamily: 'JetBrains Mono, monospace',
            }}>
              {passwordError}
            </div>
          )}
          {passwordSuccess && (
            <div style={{
              background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.3)',
              borderRadius: '0.75rem',
              padding: '0.75rem 1rem',
              color: '#34d399',
              fontSize: '0.8rem',
              fontFamily: 'JetBrains Mono, monospace',
            }}>
              {passwordSuccess}
            </div>
          )}

          {/* Current password */}
          <div className="profile-field">
            <label className="profile-label">Current Password</label>
            <div style={{ position: 'relative' }}>
              <input
                className="profile-input"
                type={showPasswords.oldPassword ? 'text' : 'password'}
                value={passwords.oldPassword}
                onChange={(e) => setPasswords((p) => ({ ...p, oldPassword: e.target.value }))}
                placeholder="••••••••"
                style={{ paddingRight: '3rem' }}
                disabled={savingPassword}
                required
              />
              <button 
                type="button" 
                onClick={() => toggleEye('oldPassword')}
                disabled={savingPassword}
                style={{
                  position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#475569', display: 'flex',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                  {showPasswords.oldPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* New password */}
          <div className="profile-field">
            <label className="profile-label">New Password</label>
            <div style={{ position: 'relative' }}>
              <input
                className="profile-input"
                type={showPasswords.newPassword ? 'text' : 'password'}
                value={passwords.newPassword}
                onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))}
                placeholder="Min 8 characters with uppercase, lowercase, number, and special char"
                style={{ paddingRight: '3rem' }}
                disabled={savingPassword}
                required
              />
              <button 
                type="button" 
                onClick={() => toggleEye('newPassword')}
                disabled={savingPassword}
                style={{
                  position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#475569', display: 'flex',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                  {showPasswords.newPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>
              Min 8 chars with uppercase, lowercase, number, and special character (@$!%*?&)
            </p>
          </div>

          {/* Confirm password */}
          <div className="profile-field">
            <label className="profile-label">Confirm New Password</label>
            <div style={{ position: 'relative' }}>
              <input
                className="profile-input"
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwords.confirm}
                onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
                placeholder="••••••••"
                style={{ paddingRight: '3rem' }}
                disabled={savingPassword}
                required
              />
              <button 
                type="button" 
                onClick={() => toggleEye('confirm')}
                disabled={savingPassword}
                style={{
                  position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#475569', display: 'flex',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                  {showPasswords.confirm ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <button 
            className="profile-btn-save" 
            type="submit" 
            style={{ alignSelf: 'flex-start', padding: '0.75rem 2rem' }}
            disabled={savingPassword}
          >
            {savingPassword ? 'Updating...' : 'Update Password'}
          </button>

        </form>
      </div>

    </div>
  )
}