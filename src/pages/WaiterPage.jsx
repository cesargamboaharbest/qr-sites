import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import { t } from '../i18n/index.js'
import { formatPrice, tableLabel } from '../utils/format.js'
import OrdersBoard from '../components/OrdersBoard.jsx'
import SiteFooter from '../components/SiteFooter.jsx'
import WaiterOrderForm from '../components/WaiterOrderForm.jsx'

// "Tomar pedido" takes the whole screen: waiters use it on their phones
function TakeOrderScreen({ onClose, onPlaced }) {
  useEffect(() => {
    // The page underneath shouldn't scroll along with the menu
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = overflow
    }
  }, [])

  return (
    <div className="take-order" role="dialog" aria-modal="true" aria-labelledby="take-order-title">
      <header className="take-order-head">
        <h2 id="take-order-title">{t('waiter.takeOrder')}</h2>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
          {t('menu.close')}
        </button>
      </header>
      <div className="take-order-body">
        <WaiterOrderForm onPlaced={onPlaced} />
      </div>
    </div>
  )
}

// What a waiter ("mesero") sees after logging in: the orders of the owner's
// businesses (or of their location), and a form to take an order for a table
export default function WaiterPage() {
  const { user, logout } = useAuth()
  const [taking, setTaking] = useState(false)
  const [placed, setPlaced] = useState(null)

  function handlePlaced(order) {
    setPlaced(order)
    setTaking(false)
  }

  return (
    <div className="admin">
      <header className="admin-header">
        <span className="brand">{t('app.name')}</span>
        {user.isAdmin && (
          <nav className="admin-nav" aria-label={t('nav.label')}>
            <Link to="/dashboard">{t('nav.businesses')}</Link>
          </nav>
        )}
        <div className="admin-user">
          <span className="muted">{t('waiter.signedInAs', { username: user.username })}</span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={logout}>
            {t('app.logout')}
          </button>
        </div>
      </header>
      <main className="admin-main stack">
        <div className="waiter-title">
          <h1 className="page-title">
            {user.location ? t('waiter.titleLocation', { location: user.location.name }) : t('waiter.title')}
          </h1>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setPlaced(null)
              setTaking(true)
            }}
          >
            {t('waiter.takeOrder')}
          </button>
        </div>

        {placed && (
          <p className="notice" role="status">
            {t('waiter.placedNotice', {
              n: placed.number,
              table: tableLabel(placed.table),
              total: formatPrice(placed.total, placed.currency),
            })}
          </p>
        )}

        <OrdersBoard path="/waiter/orders" refreshKey={placed} />
      </main>
      {taking && <TakeOrderScreen onClose={() => setTaking(false)} onPlaced={handlePlaced} />}
      <SiteFooter />
    </div>
  )
}
