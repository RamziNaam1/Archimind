'use client'

import { apiRequest } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { createContext, useContext, useState, useEffect } from 'react'
import * as authApi from '@/lib/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter() // 🚀 Initialisation correcte du router ici

  // Charger l'utilisateur et le token depuis localStorage au premier rendu
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    const savedToken = localStorage.getItem('token')
    if (savedUser) setUser(JSON.parse(savedUser))
    if (savedToken) setToken(savedToken)
    loadingStateFix()
  }, [])

  const loadingStateFix = () => {
    setLoading(false)
  }

  // Connexion synchronisée avec le backend NestJS
  const login = async (email, password) => {
  try {
    // 1. Login
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email, password },
    })

    // 2. Save token
    const tokenPayload =
      data.access_token || data.token || data.accessToken

    if (!tokenPayload) {
      throw new Error('No token returned from backend')
    }

    localStorage.setItem('token', tokenPayload)
    setToken(tokenPayload)

    // Save refresh token if exists
    if (data.refresh_token) {
      localStorage.setItem('refresh_token', data.refresh_token)
    }

    // 3. Fetch REAL profile from backend
    const profile = await apiRequest('/users/profile', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${tokenPayload}`,
      },
    })

    // 4. Save complete user
    localStorage.setItem('user', JSON.stringify(profile))
    setUser(profile)

    // 5. Redirect
    router.push('/dashboard')

  } catch (err) {
    console.error('Login failed:', err.message)
    throw new Error(err.message)
  }
}

  // Inscription connectée au backend
  const register = async (userData) => {
  try {
    // 1. Create user
    await authApi.register(userData)

    // 2. Immediately login after register
    const loginResponse = await apiRequest('/auth/login', {
      method: 'POST',
      body: {
        email: userData.email,
        password: userData.password,
      },
    })

    const token =
      loginResponse.access_token ||
      loginResponse.token ||
      loginResponse.accessToken

    if (!token) throw new Error('No token after register login')

    localStorage.setItem('token', token)
    setToken(token)

    // 3. Fetch real profile
    const profile = await apiRequest('/users/profile', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    localStorage.setItem('user', JSON.stringify(profile))
    setUser(profile)

    // 4. redirect
    router.push('/dashboard')

    return profile
  } catch (error) {
    throw error
  }
}

  // Déconnexion complète avec nettoyage du stockage local
  const logout = async () => {
    try {
      await authApi.logout().catch(() => {}) // Notifie le backend si nécessaire
    } catch (err) {
      console.warn("Session clean notification bypassed")
    } finally {
      // 🧼 Nettoyage complet du LocalStorage pour éviter les conflits d'anciennes sessions
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setToken(null)
      setUser(null)
      router.push('/login')
    }
  }

  const updateUser = (updatedFields) => {
    const updated = { ...user, ...updatedFields }
    localStorage.setItem('user', JSON.stringify(updated))
    setUser(updated)
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      register, 
      logout, 
      updateUser, 
      loading,
      isAuthenticated: !!token 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}