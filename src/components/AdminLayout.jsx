import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { api } from '../api/client.js'
import { useAuth } from '../auth/AuthContext.jsx'
import { errorMessage, t } from '../i18n/index.js'
import { THEMES, themeLabel } from '../themes/index.js'
import ProChip from './ProChip.jsx'

// Theme for all of the owner's public sites (menus and cart pages)
function ThemeSelect() {
  const { user, setUser } = useAuth()
  const [pending, setPending] = useState(false)

  async function change(e) {
    setPending(true)
    try {
      const data = await api('/auth/me', { method: 'PATCH', body: { theme: e.target.value } })
      setUser(data.user)
    } catch (err) {
      window.alert(errorMessage(err.code))
    } finally {
      setPending(false)
    }
  }

  return (
    <label className="theme-select" title={t('nav.themeHint')}>
      <span>{t('nav.theme')}</span>
      <select value={user.theme} onChange={change} disabled={pending}>
        {Object.keys(THEMES).map((key) => (
          <option key={key} value={key} title={themeLabel(key)}>
            {t(`themes.${key}.name`)}
          </option>
        ))}
      </select>
    </label>
  )
}

export default function AdminLayout() {
  const { user, logout } = useAuth()
  return (
    <div className="admin" data-theme={user.theme}>
      <header className="admin-header">
        <Link to="/dashboard" className="brand">
          {t('app.name')}
        </Link>
        <nav className="admin-nav" aria-label={t('nav.label')}>
          <NavLink to="/dashboard">{t('nav.businesses')}</NavLink>
          {user.proPlan ? (
            <NavLink to="/meseros">{t('nav.waiters')}</NavLink>
          ) : (
            <span className="admin-nav-locked" aria-disabled="true" title={t('plan.lockedHint')}>
              <span className="admin-nav-locked-label">{t('nav.waiters')}</span> <ProChip />
            </span>
          )}
        </nav>
        <div className="admin-user">
          <ThemeSelect />
          <span className="muted">{user.username}</span>
          {user.proPlan && <span className="badge badge-pro">{t('plan.proBadge')}</span>}
          <button type="button" className="btn btn-ghost btn-sm" onClick={logout}>
            {t('app.logout')}
          </button>
        </div>
      </header>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  )
}
