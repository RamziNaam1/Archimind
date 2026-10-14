'use client'

import { useState } from 'react'
import Link from 'next/link'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'
import ForgotPasswordForm from './ForgotPasswordForm'
import '@/components/auth/auth.css'

export default function AuthForm({ defaultMode = 'login' }) {
  const [mode, setMode] = useState(defaultMode)

  const isLogin    = mode === 'login'
  const isRegister = mode === 'register'
  const isForgot   = mode === 'forgot'

  return (
    <div className="auth-page">
      <div className="auth-grid" />
      <div className="auth-blob-tr" />
      <div className="auth-blob-bl" />

      <main className="auth-main">
        <div className="auth-container">

          {/* Title 
          <div className="auth-title-wrap">
            <Link href="/" style={{ textDecoration: 'none' }}>
              <h1 className="auth-title">Archimind</h1>
            </Link>
            <p className="auth-subtitle">Convert code to diagrams in seconds.</p>
          </div>*/}

          {/* Card */}
          <div className="auth-card">

            {/* Tabs — hidden on forgot mode */}
            {!isForgot && (
              <div className="auth-tabs">
                <button
                  className={`auth-tab ${isLogin ? 'active' : ''}`}
                  onClick={() => setMode('login')}
                  type="button"
                >
                  Login
                </button>
                <button
                  className={`auth-tab ${isRegister ? 'active' : ''}`}
                  onClick={() => setMode('register')}
                  type="button"
                >
                  Register
                </button>
              </div>
            )}

            {/* Forgot header — shown only on forgot mode */}
            {isForgot && (
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: 'var(--text)',
                  marginBottom: '0.25rem',
                }}>
                  Reset Password
                </h2>
              </div>
            )}

            {/* Swap between forms */}
            {isLogin    && <LoginForm    onSwitch={() => setMode('register')} onForgot={() => setMode('forgot')} />}
            {isRegister && <RegisterForm onSwitch={() => setMode('login')} />}
            {isForgot   && <ForgotPasswordForm onBack={() => setMode('login')} />}

          </div>
        </div>
      </main>

      <footer className="auth-footer">
        
        <p className="auth-footer-copy">© 2025 Archimind. Built for developers by developers.</p>
      </footer>
    </div>
  )
}