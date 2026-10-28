import { useEffect, useState } from 'react'
import { api } from '../api/client.js'
import { errorMessage, t } from '../i18n/index.js'
import { formatPrice, tableLocations } from '../utils/format.js'
import { groupByCategory } from '../utils/products.js'
import MenuOnlyOrder from './MenuOnlyOrder.jsx'

const MAX_QUANTITY = 99

// A waiter takes an order for a table: pick the table (grouped by location),
// add products and send it. Prices are set by the server, like customer orders.
// Menus without a cart are handed to MenuOnlyOrder instead.
export default function WaiterOrderForm({ onPlaced }) {
  const [menus, setMenus] = useState(null)
  const [businessId, setBusinessId] = useState('')
  const [tableId, setTableId] = useState('')
  // { [productId]: quantity }
  const [cart, setCart] = useState({})
  const [notes, setNotes] = useState('')
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  useEffect(() => {
    api('/waiter/menus')
      .then((data) => {
        setMenus(data.menus)
        if (data.menus.length === 1) setBusinessId(String(data.menus[0].id))
      })
      .catch((err) => setError(errorMessage(err.code)))
  }, [])

  const menu = menus?.find((m) => String(m.id) === businessId)
  const items = Object.entries(cart).filter(([, qty]) => qty > 0)
  const total = menu
    ? items.reduce((sum, [id, qty]) => sum + (menu.products.find((p) => p.id === id)?.price ?? 0) * qty, 0)
    : 0
  const query = search.trim().toLowerCase()
  const products = menu?.products?.filter((p) => !query || p.name.toLowerCase().includes(query)) ?? []

  function pickBusiness(id) {
    setBusinessId(id)
    setTableId('')
    setCart({})
    setSearch('')
  }

  const setQuantity = (id, qty) =>
    setCart((current) => ({ ...current, [id]: Math.max(0, Math.min(MAX_QUANTITY, qty)) }))

  async function submit(e) {
    e.preventDefault()
    setError('')
    if (!tableId) return setError(t('waiter.pickTable'))
    if (items.length === 0) return setError(t('errors.EMPTY_ORDER'))
    setPending(true)
    try {
      const { order } = await api('/waiter/orders', {
        method: 'POST',
        body: {
          businessId,
          tableId,
          notes: notes.trim(),
          items: items.map(([productId, quantity]) => ({ productId, quantity })),
        },
      })
      const table = menu.tables.find((tb) => String(tb.id) === tableId)
      setCart({})
      setNotes('')
      onPlaced({ ...order, table, currency: menu.currency })
    } catch (err) {
      setError(errorMessage(err.code))
    } finally {
      setPending(false)
    }
  }

  if (!menus) {
    return error ? <p className="form-error" role="alert">{error}</p> : <p className="muted">{t('app.loading')}</p>
  }
  if (menus.length === 0) return <p className="muted">{t('waiter.noTables')}</p>

  const businessPicker = menus.length > 1 && (
    <label className="field">
      <span>{t('waiter.business')}</span>
      <select value={businessId} onChange={(e) => pickBusiness(e.target.value)}>
        <option value="">{t('waiter.pickBusiness')}</option>
        {menus.map((m) => (
          <option key={m.id} value={String(m.id)}>
            {m.name}
          </option>
        ))}
      </select>
    </label>
  )

  // Menus without a cart: the themed menu with "Agregar" and a typed table
  if (menu && !menu.ordering) {
    return (
      <div className="stack">
        {businessPicker && <div className="inline-form">{businessPicker}</div>}
        <MenuOnlyOrder key={menu.id} menu={menu} onPlaced={onPlaced} />
      </div>
    )
  }

  const locations = menu ? tableLocations(menu.tables) : []
  const tableOption = (table) => (
    <option key={table.id} value={String(table.id)}>
      {table.name}
    </option>
  )

  return (
    <form className="stack waiter-order" onSubmit={submit}>
      <div className="inline-form">
        {businessPicker}
        {menu && (
          <label className="field">
            <span>{t('waiter.table')}</span>
            <select value={tableId} onChange={(e) => setTableId(e.target.value)}>
              <option value="">{t('waiter.pickTable')}</option>
              {menu.tables.filter((table) => !table.location).map(tableOption)}
              {locations.map((location) => (
                <optgroup key={location} label={location}>
                  {menu.tables.filter((table) => table.location === location).map(tableOption)}
                </optgroup>
              ))}
            </select>
          </label>
        )}
      </div>

      {menu && (
        <>
          <label className="field">
            <span>{t('waiter.search')}</span>
            <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} />
          </label>
          {products.length === 0 && <p className="muted">{t('waiter.noProducts')}</p>}
          {groupByCategory(products, t('products.uncategorized'), menu.categoryOrder).map((group) => (
            <section key={group.id}>
              <h3 className="waiter-order-category">{group.category}</h3>
              <ul className="product-list">
                {group.items.map((product) => {
                  const qty = cart[product.id] ?? 0
                  return (
                    <li key={product.id} className={`product-row ${qty ? 'is-picked' : ''}`}>
                      <div className="product-info">
                        <strong>{product.name}</strong>
                        <span className="muted">{formatPrice(product.price, menu.currency)}</span>
                      </div>
                      <div className="qty-stepper">
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => setQuantity(product.id, qty - 1)}
                          disabled={!qty}
                          aria-label={t('menu.removeLabel', { name: product.name })}
                        >
                          −
                        </button>
                        <span aria-label={t('menu.quantityLabel', { name: product.name })}>{qty}</span>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => setQuantity(product.id, qty + 1)}
                          aria-label={t('menu.addLabel', { name: product.name })}
                        >
                          +
                        </button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
          <label className="field">
            <span>{t('menu.notes')}</span>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('menu.notesPlaceholder')}
              maxLength={300}
            />
          </label>
          <div className="waiter-order-footer">
            <span>
              {t('menu.total')}: <strong>{formatPrice(total, menu.currency)}</strong>
            </span>
            <button className="btn btn-primary" disabled={pending}>
              {t(pending ? 'menu.sending' : 'waiter.send')}
            </button>
          </div>
        </>
      )}
      {error && <p className="form-error" role="alert">{error}</p>}
    </form>
  )
}
