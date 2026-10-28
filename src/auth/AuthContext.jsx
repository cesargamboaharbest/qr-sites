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
    <AuthContext.Provider value={{ user, ready, authenticate, logout, setUser }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

// Where each role lands after logging in
export function homeFor(user) {
  return user.role === 'waiter' ? '/mesero' : '/dashboard'
}

export const isOwner = (user) => (user.role ?? 'owner') === 'owner'

// Owners and waiters with admin permission can edit menus
export const canManageMenus = (user) => isOwner(user) || Boolean(user.isAdmin)

// `role` limits the route to 'owner', 'waiter' or 'admin' (owners and admin
// waiters); others go to their own home
export function RequireAuth({ role, children }) {
  const { user, ready } = useAuth()
  const location = useLocation()
  if (!ready) return <p className="page-status">{t('app.loading')}</p>
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  const allowed = role === 'admin' ? canManageMenus(user) : !role || (user.role ?? 'owner') === role
  if (!allowed) return <Navigate to={homeFor(user)} replace />
  return children
}
