import { useState } from 'react'
import { Link, Navigate, useOutletContext } from 'react-router-dom'
import { isOwner, useAuth } from '../../auth/AuthContext.jsx'
import { errorMessage, t } from '../../i18n/index.js'
import { tableLocations } from '../../utils/format.js'
import OrdersBoard from '../../components/OrdersBoard.jsx'

// <select> values besides location names
const ALL = '*'
const NO_LOCATION = ''

export default function OrdersTab() {
  const { business, mutate } = useOutletContext()
  const { user } = useAuth()
  const locations = tableLocations(business.tables)
  const hasUnlocated = business.tables.some((table) => !table.location)
  // Opens on the business's default location, if it still exists
  const savedDefault = locations.includes(business.ordersLocation) ? business.ordersLocation : ALL
  const [location, setLocation] = useState(savedDefault)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  if (!business.published) return <Navigate to=".." relative="path" replace />

  // Locations come from tables, which menus without a cart don't have.
  // Waiters with a location only ever see theirs, so they get no filter.
  const showFilter = business.ordering && !user.location
  const noLocations = locations.length === 0
  const isDefault = location === savedDefault

  async function makeDefault() {
    setError('')
    setSaving(true)
    try {
      await mutate('', 'PATCH', { ordersLocation: location === ALL ? '' : location })
    } catch (err) {
      setError(errorMessage(err.code))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="stack">
      {!business.ordering && (
        <p className="muted">
          {t('orders.menuOnlyHint')} {isOwner(user) && <Link to="/meseros">{t('nav.waiters')}</Link>}
        </p>
      )}
      {showFilter && (
        <div className="orders-location">
          <label className="field">
            <span>{t('orders.location')}</span>
            <select value={location} onChange={(e) => setLocation(e.target.value)} disabled={noLocations}>
              <option value={ALL}>{t('orders.allLocations')}</option>
              {locations.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
              {hasUnlocated && !noLocations && <option value={NO_LOCATION}>{t('tables.noLocation')}</option>}
            </select>
          </label>
          {noLocations ? (
            <p className="muted orders-location-hint">
              {t('orders.noLocationsHint')} <Link to="../mesas">{t('business.tabs.tables')}</Link>
            </p>
          ) : isDefault ? (
            <span className="badge badge-ok">{t('orders.defaultLocation')}</span>
          ) : (
            location !== NO_LOCATION && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={makeDefault} disabled={saving}>
                {t(saving ? 'orders.savingDefault' : 'orders.makeDefault')}
              </button>
            )
          )}
          {error && <p className="form-error" role="alert">{error}</p>}
        </div>
      )}
      <OrdersBoard
        key={location}
        path={`/businesses/${business.id}/orders`}
        currency={business.currency}
        location={showFilter && location !== ALL ? location : undefined}
      />
    </div>
  )
}
