import { useCallback, useEffect, useState } from 'react'
import { Navigate, useOutletContext } from 'react-router-dom'
import { api } from '../../api/client.js'
import { errorMessage, t } from '../../i18n/index.js'
import { formatPrice, formatTime } from '../../utils/format.js'

const REFRESH_MS = 10_000

// Next step for each status, shown as the order's main button
const NEXT_STATUS = {
  pending: { status: 'preparing', label: 'orders.actions.prepare' },
  preparing: { status: 'served', label: 'orders.actions.serve' },
}

function OrderCard({ order, currency, onStatus }) {
  const next = NEXT_STATUS[order.status]
  const active = Boolean(next)

  return (
    <li className={`card order-card order-${order.status}`}>
      <header className="order-head">
        <strong>{t('orders.number', { n: order.number })}</strong>
        <span className={`badge badge-${order.status}`}>{t(`orders.statuses.${order.status}`)}</span>
      </header>
      <p className="order-meta">
        <strong>{order.table.name}</strong> · <span className="muted">{formatTime(order.createdAt)}</span>
      </p>
      <ul className="order-items">
        {order.items.map((item, i) => (
          <li key={i}>
            <span className="order-qty">{item.quantity}×</span> {item.name}
            <span className="muted">{formatPrice(item.price * item.quantity, currency)}</span>
          </li>
        ))}
      </ul>
      {order.notes && (
        <p className="order-notes">
          <strong>{t('orders.notes')}:</strong> {order.notes}
        </p>
      )}
      <p className="order-total">
        {t('orders.total')}: <strong>{formatPrice(order.total, currency)}</strong>
      </p>
      {active && (
        <div className="row-actions">
          <button type="button" className="btn btn-primary btn-sm" onClick={() => onStatus(order, next.status)}>
            {t(next.label)}
          </button>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={() =>
              window.confirm(t('orders.cancelConfirm', { n: order.number })) && onStatus(order, 'cancelled')
            }
          >
            {t('orders.actions.cancel')}
          </button>
        </div>
      )}
    </li>
  )
}

export default function OrdersTab() {
  const { business } = useOutletContext()
  const [filter, setFilter] = useState('active')
  const [orders, setOrders] = useState(null)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      const data = await api(`/businesses/${business.id}/orders?status=${filter}`)
      setOrders(data.orders)
      setError('')
    } catch (err) {
      setError(errorMessage(err.code))
    }
  }, [business.id, filter])

  useEffect(() => {
    load()
    const timer = setInterval(load, REFRESH_MS)
    return () => clearInterval(timer)
  }, [load])

  if (!business.published) return <Navigate to=".." relative="path" replace />

  async function updateStatus(order, status) {
    try {
      await api(`/businesses/${business.id}/orders/${order._id}`, { method: 'PATCH', body: { status } })
      await load()
    } catch (err) {
      setError(errorMessage(err.code))
    }
  }

  return (
    <div className="stack">
      <div className="orders-toolbar">
        <div className="segmented" role="group" aria-label={t('orders.filterLabel')}>
          {['active', 'all'].map((value) => (
            <button
              key={value}
              type="button"
              className={filter === value ? 'is-active' : undefined}
              aria-pressed={filter === value}
              onClick={() => {
                setOrders(null)
                setFilter(value)
              }}
            >
              {t(value === 'active' ? 'orders.filterActive' : 'orders.filterAll')}
            </button>
          ))}
        </div>
        <span className="muted">{t('orders.autoRefresh')}</span>
      </div>

      {error && <p className="form-error" role="alert">{error}</p>}
      {!orders && !error && <p className="muted">{t('app.loading')}</p>}
      {orders?.length === 0 && <p className="muted">{t('orders.empty')}</p>}
      <ul className="order-grid">
        {orders?.map((order) => (
          <OrderCard key={order._id} order={order} currency={business.currency} onStatus={updateStatus} />
        ))}
      </ul>
    </div>
  )
}
