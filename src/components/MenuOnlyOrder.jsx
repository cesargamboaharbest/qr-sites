import { useCallback, useEffect, useState } from 'react'
import { api } from '../api/client.js'
import { errorMessage, t } from '../i18n/index.js'
import { getTheme } from '../themes/index.js'
import { formatPrice } from '../utils/format.js'

const MAX_QUANTITY = 99

// A waiter takes an order in a menu without a cart: the same menu customers
// see (owner's theme), with "Agregar" on each product. These menus have no
// tables, so the waiter types the table name or number.
export default function MenuOnlyOrder({ menu, onPlaced }) {
  const [data, setData] = useState(null)
  // { [productId]: quantity }
  const [cart, setCart] = useState({})
  const [tableName, setTableName] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

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

  const { business } = data
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
      <div className="mo-action">
        {qty === 0 ? (
          <button
            type="button"
            className="mo-add"
            onClick={() => change(product._id, 1)}
            aria-label={t('menu.addLabel', { name: product.name })}
          >
            + {t('menu.add')}
          </button>
        ) : (
          <span className="mo-qty" role="group" aria-label={t('menu.quantityLabel', { name: product.name })}>
            <button type="button" onClick={() => change(product._id, -1)} aria-label={t('menu.removeLabel', { name: product.name })}>
              −
            </button>
            <output aria-live="polite">{qty}</output>
            <button type="button" onClick={() => change(product._id, 1)} aria-label={t('menu.addLabel', { name: product.name })}>
              +
            </button>
          </span>
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
    <div className="mo">
      <div className="mo-menu">
        <theme.Menu business={business} renderAction={renderAction} />
      </div>

      <form className="mo-bar" onSubmit={submit}>
        {lines.length > 0 && (
          <ul className="mo-lines">
            {lines.map(({ product, quantity }) => (
              <li key={product._id}>
                <span>
                  {quantity}× {product.name}
                </span>
                <span className="muted">{price(product.price * quantity)}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="inline-form">
          <label className="field">
            <span>{t('waiter.tableName')}</span>
            <input
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              placeholder={t('waiter.tableNamePlaceholder')}
              maxLength={40}
              required
            />
          </label>
          <label className="field">
            <span>{t('menu.notes')}</span>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('menu.notesPlaceholder')}
              maxLength={300}
            />
          </label>
        </div>
        <div className="waiter-order-footer">
          <span>
            {t('menu.itemCount', { count: itemCount })} · {t('menu.total')}: <strong>{price(total)}</strong>
          </span>
          <button className="btn btn-primary" disabled={pending}>
            {t(pending ? 'menu.sending' : 'waiter.send')}
          </button>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
      </form>
    </div>
  )
}
