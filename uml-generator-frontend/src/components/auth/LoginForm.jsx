'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { FcGoogle } from 'react-icons/fc'

export default function LoginForm({ onSwitch, onForgot }) {
  const router = useRouter()
  const { login } = useAuth() // This calls the live backend login through AuthContext

  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', remember: false })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      // 1. Live system authentication request 
      const loggedInUser = await login(form.email, form.password)
      
      // 2. Direct user based on their real backend database role
      if (loggedInUser && loggedInUser.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      // Catches and renders NestJS validation errors beautifully
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>

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

      <div className="auth-field">
        <label className="auth-label">Email Address</label>
        <div className="auth-input-wrap">
          <span className="material-symbols-outlined auth-input-icon">mail</span>
          <input
            className="auth-input"
            name="email"
            type="email"
            placeholder="ramzi@test.com"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="auth-field">
        <div className="auth-label-row">
          <label className="auth-label">Password</label>
          <button className="auth-forgot" type="button" onClick={onForgot}>
            Forgot password?
          </button>
        </div>
        <div className="auth-input-wrap">
          <span className="material-symbols-outlined auth-input-icon">lock</span>
          <input
            className="auth-input auth-input-pr"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button className="auth-eye-btn" type="button" onClick={() => setShowPassword(!showPassword)}>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              {showPassword ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        </div>
      </div>

      <label className="auth-remember">
        <input type="checkbox" name="remember" checked={form.remember} onChange={handleChange} />
        <span className="auth-remember-label">Remember me</span>
      </label>

      <button className="auth-submit" type="submit" disabled={loading}>
        <span>{loading ? 'Signing in...' : 'Sign In'}</span>
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>login</span>
      </button>

      <div className="auth-divider">
        <span className="auth-divider-text">Or continue with</span>
      </div>

      <button className="auth-google" type="button">
        <FcGoogle size={20} />
        <span>Google Account</span>
      </button>

      <div className="auth-switch">
        New here?{' '}
        <button className="auth-switch-link" type="button" onClick={onSwitch}>
          Create an account
        </button>
      </div>

    </form>
  )
}