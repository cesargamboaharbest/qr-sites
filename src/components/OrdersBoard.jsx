import { useCallback, useEffect, useState } from 'react'
import { api } from '../api/client.js'
import { errorMessage, t } from '../i18n/index.js'
import { formatPrice, formatTime, tableLabel } from '../utils/format.js'

const REFRESH_MS = 10_000

// Next step for each status, shown as the order's main button
const NEXT_STATUS = {
  pending: { status: 'preparing', label: 'orders.actions.prepare' },
  preparing: { status: 'served', label: 'orders.actions.serve' },
}

// The waiter view lists orders from several businesses, so those orders carry
// their own businessName and currency
function OrderCard({ order, currency: defaultCurrency, onStatus }) {
  const next = NEXT_STATUS[order.status]
  const active = Boolean(next)
  const currency = order.currency ?? defaultCurrency

  return (
    <li className={`card order-card order-${order.status}`}>
      <header className="order-head">
        <strong>{t('orders.number', { n: order.number })}</strong>
        <span className={`badge badge-${order.status}`}>{t(`orders.statuses.${order.status}`)}</span>
      </header>
      {order.businessName && <p className="order-business">{order.businessName}</p>}
      <p className="order-meta">
        <strong>{tableLabel(order.table)}</strong> · <span className="muted">{formatTime(order.createdAt)}</span>
        {order.waiter && <span className="badge">{t('orders.byWaiter')}</span>}
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

const PERIODS = ['today', 'yesterday', 'week', 'month', 'date', 'all']

// Days in the user's local time, so "today" starts at their midnight
function addDays(date, days) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

// [from, to) for a period; `day` is a "YYYY-MM-DD" from the date picker
function periodRange(period, day) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  switch (period) {
    case 'today':
      return [today, addDays(today, 1)]
    case 'yesterday':
      return [addDays(today, -1), today]
    case 'week':
      return [addDays(today, -6), null]
    case 'month':
      return [addDays(today, -29), null]
    case 'date': {
      if (!day) return [null, null]
      const start = new Date(`${day}T00:00:00`)
      return [start, addDays(start, 1)]
    }
    default:
      return [null, null]
  }
}

const todayInput = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Live list of a business's orders. Used by the owner's "Pedidos" tab
// (path /businesses/:id/orders) and the waiter view (path /waiter/orders).
// Opens on today's orders; earlier ones are a dropdown away.
// Changing `refreshKey` reloads right away (e.g. after a waiter places one).
// `location` filters by table location ('' = tables without one).
export default function OrdersBoard({ path, currency, refreshKey, location }) {
  const [filter, setFilter] = useState('active')
  const [period, setPeriod] = useState('today')
  const [day, setDay] = useState(todayInput)
  const [orders, setOrders] = useState(null)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams({ status: filter })
      if (location !== undefined) params.set('location', location)
      // Recomputed on every refresh so "Hoy" rolls over at midnight
      const [from, to] = periodRange(period, day)
      if (from) params.set('from', from.toISOString())
      if (to) params.set('to', to.toISOString())
      const data = await api(`${path}?${params}`)
      setOrders(data.orders)
      setError('')
    } catch (err) {
      setError(errorMessage(err.code))
    }
  }, [path, filter, location, period, day])

  useEffect(() => {
    load()
    const timer = setInterval(load, REFRESH_MS)
    return () => clearInterval(timer)
  }, [load, refreshKey])

  async function updateStatus(order, status) {
    try {
      await api(`${path}/${order._id}`, { method: 'PATCH', body: { status } })
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
        <label className="orders-period">
          <span className="visually-hidden">{t('orders.periodLabel')}</span>
          <select
            value={period}
            onChange={(e) => {
              setOrders(null)
              setPeriod(e.target.value)
            }}
          >
            {PERIODS.map((value) => (
              <option key={value} value={value}>
                {t(`orders.periods.${value}`)}
              </option>
            ))}
          </select>
        </label>
        {period === 'date' && (
          <label className="orders-period">
            <span className="visually-hidden">{t('orders.pickDate')}</span>
            <input
              type="date"
              value={day}
              max={todayInput()}
              onChange={(e) => {
                setOrders(null)
                setDay(e.target.value)
              }}
            />
          </label>
        )}
        <span className="muted">{t('orders.autoRefresh')}</span>
      </div>

      {error && <p className="form-error" role="alert">{error}</p>}
      {!orders && !error && <p className="muted">{t('app.loading')}</p>}
      {orders?.length > 0 && (
        <p className="muted orders-summary">
          {t('orders.count', { count: orders.length })}
          {/* The waiter view mixes businesses (and currencies), so no total there */}
          {currency && (
            <>
              {' · '}
              {t('orders.periodTotal')}:{' '}
              <strong>
                {formatPrice(
                  orders.filter((o) => o.status !== 'cancelled').reduce((sum, o) => sum + o.total, 0),
                  currency
                )}
              </strong>
            </>
          )}
        </p>
      )}
      {orders?.length === 0 && (
        <p className="muted">{t(period === 'today' ? 'orders.emptyToday' : 'orders.empty')}</p>
      )}
      <ul className="order-grid">
        {orders?.map((order) => (
          <OrderCard key={order._id} order={order} currency={currency} onStatus={updateStatus} />
        ))}
      </ul>
    </div>
  )
}
