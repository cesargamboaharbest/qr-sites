import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { api, getToken, setToken } from '../api/client.js'
import { t } from '../i18n/index.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(!getToken())

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
  }, [])

  // Restore the session from a stored token
  useEffect(() => {
    if (!getToken()) return
    api('/auth/me')
      .then((data) => setUser(data.user))
      .catch(logout)
      .finally(() => setReady(true))
  }, [logout])

  useEffect(() => {
    window.addEventListener('auth:expired', logout)
    return () => window.removeEventListener('auth:expired', logout)
  }, [logout])

  const authenticate = useCallback(async (mode, credentials) => {
    const data = await api(`/auth/${mode}`, { method: 'POST', body: credentials })
    setToken(data.token)
    setUser(data.user)
  }, [])

  return (
    <AuthContext.Provider value={{ user, ready, authenticate, logout }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

export function RequireAuth({ children }) {
  const { user, ready } = useAuth()
  const location = useLocation()
  if (!ready) return <p className="page-status">{t('app.loading')}</p>
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  return children
}
