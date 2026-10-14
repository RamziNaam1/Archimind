'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { FcGoogle } from 'react-icons/fc'

export default function RegisterForm({ onSwitch }) {
  const router = useRouter()
  const { register } = useAuth() // Pull our live register method from context

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  // Dans votre RegisterForm.jsx :
const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setError('') // Clear errors as the user types
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // 1. Vérification des mots de passe côté client
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      setLoading(false)
      return
    }

    try {
      // 2. Découpage du nom
      const trimmedName = form.name.trim()
      const spaceIndex = trimmedName.indexOf(' ')
      
      let firstName = trimmedName
      let lastName = 'Archimind' // Un nom de famille par défaut si l'utilisateur n'en saisit qu'un

      if (spaceIndex !== -1) {
        firstName = trimmedName.substring(0, spaceIndex)
        lastName = trimmedName.substring(spaceIndex + 1).trim()
      }

      // 3. Envoi d'un objet propre et explicite au contexte
      await register({
        firstName: firstName,
        lastName: lastName,
        email: form.email,
        password: form.password // Garantit que le mot de passe n'est pas perdu dans l'ordre des arguments
      })
      
      router.push('/dashboard')
    } catch (err) {
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

      {/* Full Name */}
      <div className="auth-field">
        <label className="auth-label">Full Name</label>
        <div className="auth-input-wrap">
          <span className="material-symbols-outlined auth-input-icon">person</span>
          <input
            className="auth-input"
            name="name"
            type="text"
            placeholder="ramzi naam"
            value={form.name}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
      </div>

      {/* Email */}
      <div className="auth-field">
        <label className="auth-label">Email Address</label>
        <div className="auth-input-wrap">
          <span className="material-symbols-outlined auth-input-icon">mail</span>
          <input
            className="auth-input"
            name="email"
            type="email"
            placeholder="email@archimind.com"
            value={form.email}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
      </div>

      {/* Password */}
      <div className="auth-field">
        <label className="auth-label">Password</label>
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
            disabled={loading}
          />
          <button className="auth-eye-btn" type="button" onClick={() => setShowPassword(!showPassword)}>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              {showPassword ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        </div>
      </div>

      {/* Confirm Password */}
      <div className="auth-field">
        <label className="auth-label">Confirm Password</label>
        <div className="auth-input-wrap">
          <span className="material-symbols-outlined auth-input-icon">lock_reset</span>
          <input
            className="auth-input auth-input-pr"
            name="confirmPassword"
            type={showConfirm ? 'text' : 'password'}
            placeholder="••••••••"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            disabled={loading}
          />
          <button className="auth-eye-btn" type="button" onClick={() => setShowConfirm(!showConfirm)}>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              {showConfirm ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        </div>
      </div>

      {/* Submit */}
      <button className="auth-submit" type="submit" disabled={loading}>
        <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>person_add</span>
      </button>

      {/* Divider */}
      <div className="auth-divider">
        <span className="auth-divider-text">Or continue with</span>
      </div>

      {/* Google */}
      <button className="auth-google" type="button" disabled={loading}>
        <FcGoogle size={20} />
        <span>Google Account</span>
      </button>

      {/* Switch */}
      <div className="auth-switch">
        Already have an account?{' '}
        <button className="auth-switch-link" type="button" onClick={onSwitch} disabled={loading}>
          Sign In
        </button>
      </div>

    </form>
  )
}