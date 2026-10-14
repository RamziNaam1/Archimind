'use client'

import { useState } from 'react'
import { users } from '@/lib/mocks'

export default function ForgotPasswordForm({ onBack }) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    const user = users.find((u) => u.email === email)
    if (!user) {
      setError('No account found with this email address.')
      return
    }

    // TODO: connect to backend — send real reset email
    console.log('Reset link sent to:', email)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="auth-form" style={{ textAlign: 'center', gap: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'rgba(16,185,129,0.1)',
          border: '1px solid rgba(16,185,129,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 32, color: '#10b981' }}>
            mark_email_read
          </span>
        </div>
        <div>
          <p style={{ color: 'var(--text)', fontWeight: 700, marginBottom: '0.5rem' }}>Check your inbox</p>
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>
            A reset link has been sent to{' '}
            <strong style={{ color: '#7c3bed' }}>{email}</strong>
          </p>
        </div>
        <button className="auth-switch-link" type="button" onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
          Back to Login
        </button>
      </div>
    )
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Enter your email to receive a recovery link
        </p>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: '0.75rem',
          padding: '0.75rem 1rem',
          color: '#f87171',
          fontSize: '0.875rem',
          fontFamily: 'JetBrains Mono, monospace',
        }}>
          {error}
        </div>
      )}

      {/* Email */}
      <div className="auth-field">
        <label className="auth-label">Email Address</label>
        <div className="auth-input-wrap">
          <span className="material-symbols-outlined auth-input-icon">mail</span>
          <input
            className="auth-input"
            type="email"
            placeholder="ramzi@test.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError('') }}
            required
          />
        </div>
      </div>

      {/* Submit */}
      <button className="auth-submit" type="submit">
        <span>Send Reset Link</span>
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>send</span>
      </button>

      {/* Back to login */}
      <div className="auth-switch">
        <button className="auth-switch-link" type="button" onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', margin: '0 auto' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
          Back to Login
        </button>
      </div>

    </form>
  )
}