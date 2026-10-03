import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import { t } from '../i18n/index.js'

export default function AdminLayout() {
  const { user, logout } = useAuth()
  return (
    <div className="admin">
      <header className="admin-header">
        <Link to="/dashboard" className="brand">
          {t('app.name')}
        </Link>
        <div className="admin-user">
          <span className="muted">{user.username}</span>
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
