import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '../api/client.js'
import { errorMessage, t } from '../i18n/index.js'
import { getTheme } from '../themes/index.js'
import { formatPrice } from '../utils/format.js'
import '../pages/PublicMenu.css'

const MAX_QUANTITY = 99

// The controls reuse the cart page's classes (qty-add, qty, pm-cartbar,
// pm-dialog, pm-cart…), so each theme styles them as customers see them
function Stepper({ product, quantity, onChange }) {
  return (
    <span className="qty" role="group" aria-label={t('menu.quantityLabel', { name: product.name })}>
      <button type="button" onClick={() => onChange(product._id, -1)} aria-label={t('menu.removeLabel', { name: product.name })}>
        −
      </button>
      <output aria-live="polite">{quantity}</output>
      <button type="button" onClick={() => onChange(product._id, 1)} aria-label={t('menu.addLabel', { name: product.name })}>
        +
      </button>
    </span>
  )
}

// A waiter takes an order in a menu without a cart, usually on their phone:
// the same menu customers see (owner's theme, always one column), with
// "Agregar" on each product. These menus have no tables, so the waiter types
// the table name or number (pinned at the top). A bar at the bottom opens the
// order to review and send it.
export default function MenuOnlyOrder({ menu, onPlaced }) {
  const [data, setData] = useState(null)
  // { [productId]: quantity }
  const [cart, setCart] = useState({})
  const [tableName, setTableName] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const sheetRef = useRef(null)

  const load = useCallback(
    () =>
      api(`/public/${encodeURIComponent(menu.slug)}`)
        .then(setData)
        .catch((err) => setError(errorMessage(err.code))),
    [menu.slug]
  )

  useEffect(() => {
    load()
  }, [load])

  if (!data) {
    return error ? <p className="form-error" role="alert">{error}</p> : <p className="muted">{t('app.loading')}</p>
  }

  // Two columns are the owner's choice for customers; on a waiter's phone
  // one column is easier to tap through
  const business = { ...data.business, twoColumns: false }
  const theme = getTheme(data.theme)
  // A product can sell out while the waiter has it in the order
  const lines = business.products
    .filter((p) => p.available && cart[p._id])
    .map((p) => ({ product: p, quantity: cart[p._id] }))
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0)
  const total = lines.reduce((sum, line) => sum + line.quantity * line.product.price, 0)
  const price = (amount) => formatPrice(amount, business.currency)

  const change = (id, delta) =>
    setCart((current) => {
      const quantity = Math.max(0, Math.min(MAX_QUANTITY, (current[id] ?? 0) + delta))
      const { [id]: _removed, ...rest } = current
      return quantity ? { ...rest, [id]: quantity } : rest
    })

  function renderAction(product) {
    if (!product.available) return null
    const qty = cart[product._id] ?? 0
    return (
      <div className="pm-card-action mo-action">
        {qty === 0 ? (
          <button
            type="button"
            className="qty-add"
            onClick={() => change(product._id, 1)}
            aria-label={t('menu.addLabel', { name: product.name })}
          >
            {t('menu.add')}
          </button>
        ) : (
          <Stepper product={product} quantity={qty} onChange={change} />
        )}
      </div>
    )
  }

  async function submit(e) {
    e.preventDefault()
    setError('')
    if (!tableName.trim()) return setError(t('errors.TABLE_NAME_REQUIRED'))
    if (lines.length === 0) return setError(t('errors.EMPTY_ORDER'))
    setPending(true)
    try {
      const { order } = await api('/waiter/orders', {
        method: 'POST',
        body: {
          businessId: menu.id,
          tableName: tableName.trim(),
          notes: notes.trim(),
          items: lines.map((line) => ({ productId: line.product._id, quantity: line.quantity })),
        },
      })
      sheetRef.current?.close()
      setCart({})
      setNotes('')
      setTableName('')
      onPlaced({ ...order, table: { name: tableName.trim() }, currency: business.currency })
    } catch (err) {
      setError(errorMessage(err.code))
      // Refresh the menu so sold-out products drop out of the order
      if (err.code === 'PRODUCT_UNAVAILABLE') load()
    } finally {
      setPending(false)
    }
  }

  return (
    <div className={`menu-scope pm pm--${theme.key} mo`}>
      <label className="mo-table">
        <span>{t('waiter.tableName')}</span>
        <input
          value={tableName}
          onChange={(e) => setTableName(e.target.value)}
          placeholder={t('waiter.tableNamePlaceholder')}
          maxLength={40}
          enterKeyHint="done"
        />
      </label>

      <div className="mo-menu">
        <theme.Menu business={business} renderAction={renderAction} />
      </div>

      {itemCount > 0 && (
        <div className="pm-cartbar">
          <button
            type="button"
            className="pm-cartbar-btn"
            onClick={() => {
              setError('')
              sheetRef.current?.showModal()
            }}
          >
            <span>
              {t('menu.viewOrder')} · {t('menu.itemCount', { count: itemCount })}
            </span>
            <strong>{price(total)}</strong>
          </button>
        </div>
      )}

      <dialog ref={sheetRef} className="pm-dialog mo-sheet" aria-labelledby="mo-sheet-title">
        <form onSubmit={submit}>
          <header className="pm-dialog-head">
            <h2 id="mo-sheet-title">{t('menu.yourOrder')}</h2>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => sheetRef.current?.close()}>
              {t('menu.close')}
            </button>
          </header>

          <label className="field">
            <span>{t('waiter.tableName')}</span>
            <input
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              placeholder={t('waiter.tableNamePlaceholder')}
              maxLength={40}
            />
          </label>

          {lines.length === 0 ? (
            <p className="muted">{t('menu.emptyCart')}</p>
          ) : (
            <ul className="pm-cart">
              {lines.map(({ product, quantity }) => (
                <li key={product._id}>
                  <span className="pm-cart-name">{product.name}</span>
                  <Stepper product={product} quantity={quantity} onChange={change} />
                  <span className="pm-cart-price">{price(product.price * quantity)}</span>
                </li>
              ))}
            </ul>
          )}

          <label className="field">
            <span>{t('menu.notes')}</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('menu.notesPlaceholder')}
              maxLength={300}
              rows={2}
            />
          </label>

          <p className="pm-total">
            <span>{t('menu.total')}</span>
            <strong>{price(total)}</strong>
          </p>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="btn btn-primary btn-block" disabled={pending || lines.length === 0}>
            {t(pending ? 'menu.sending' : 'waiter.send')}
          </button>
        </form>
      </dialog>
    </div>
  )
}
