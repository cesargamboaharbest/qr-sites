import { useAuth } from '../auth/AuthContext.jsx'
import { t } from '../i18n/index.js'
import OrdersBoard from '../components/OrdersBoard.jsx'

// What a waiter ("mesero") sees after logging in: the orders of all the
// businesses of the owner who created them
export default function WaiterPage() {
  const { user, logout } = useAuth()

  return (
    <div className="admin" data-theme={user.theme}>
      <header className="admin-header">
        <span className="brand">{t('app.name')}</span>
        <div className="admin-user">
          <span className="muted">{t('waiter.signedInAs', { username: user.username })}</span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={logout}>
            {t('app.logout')}
          </button>
        </div>
      </header>
      <main className="admin-main">
        <h1 className="page-title">{t('waiter.title')}</h1>
        <OrdersBoard path="/waiter/orders" />
      </main>
    </div>
  )
}
