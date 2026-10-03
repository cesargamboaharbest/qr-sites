import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../api/client.js'
import { errorMessage, t } from '../i18n/index.js'
import { formatPrice } from '../utils/format.js'
import { PLACEHOLDER_IMAGE, groupByCategory } from '../utils/products.js'
import KuraMenu from './KuraMenu.jsx'
import { getTheme } from '../themes/index.js'
import { useSectionNav, withPeriod } from '../themes/useSectionNav.js'
import heroUrl from '../assets/kura-hero.png'
import './PublicMenu.css'

// Cart is { [productId]: quantity }, remembered per table so a reload keeps it
function useCart(storageKey) {
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey)) ?? {}
    } catch {
      return {}
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(cart))
    } catch {
      // Storage unavailable: the cart just isn't remembered
    }
  }, [storageKey, cart])

  const change = useCallback((productId, delta) => {
    setCart((current) => {
      const quantity = Math.min(99, Math.max(0, (current[productId] ?? 0) + delta))
      const { [productId]: _removed, ...rest } = current
      return quantity ? { ...rest, [productId]: quantity } : rest
    })
  }, [])

  return [cart, change, setCart]
}

function QuantityControl({ product, quantity, onChange }) {
  if (!quantity) {
    return (
      <button
        type="button"
        className="qty-add"
        onClick={() => onChange(product._id, 1)}
        aria-label={t('menu.addLabel', { name: product.name })}
      >
        {t('menu.add')}
      </button>
    )
  }
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

// Menu with a shopping cart. The layout is shared by all themes; each theme
// styles it through the `pm--<theme>` class (see PublicMenu.css).
function CartMenu({ data, themeKey, tableId, reload }) {
  const { business, table } = data
  const [cart, changeQuantity, setCart] = useCart(`qr-sites:cart:${business.slug}:${tableId ?? ''}`)
  const [notes, setNotes] = useState('')
  const [sendError, setSendError] = useState('')
  const [sending, setSending] = useState(false)
  const [sentOrder, setSentOrder] = useState(null)
  const dialogRef = useRef(null)
  const groups = groupByCategory(business.products, t('products.uncategorized'))
  const { rootRef, active, goToSection } = useSectionNav(groups, '.pm-section')

  const canOrder = Boolean(table)
  const cartLines = business.products
    .filter((p) => cart[p._id])
    .map((p) => ({ product: p, quantity: cart[p._id] }))
  const itemCount = cartLines.reduce((sum, line) => sum + line.quantity, 0)
  const total = cartLines.reduce((sum, line) => sum + line.quantity * line.product.price, 0)
  const price = (amount) => formatPrice(amount, business.currency)
  const productName = (name) => (themeKey === 'tea' ? withPeriod(name) : name)

  async function sendOrder(e) {
    e.preventDefault()
    setSendError('')
    setSending(true)
    try {
      const { order } = await api(`/public/${business.slug}/orders`, {
        method: 'POST',
        body: {
          tableId: table.id,
          notes,
          items: cartLines.map((line) => ({ productId: line.product._id, quantity: line.quantity })),
        },
      })
      setCart({})
      setNotes('')
      setSentOrder(order)
      dialogRef.current?.close()
    } catch (err) {
      setSendError(errorMessage(err.code))
      // Refresh the menu so sold-out products drop out of the cart
      if (err.code === 'PRODUCT_UNAVAILABLE') reload()
    } finally {
      setSending(false)
    }
  }

  return (
    <div className={`pm pm--${themeKey}`} ref={rootRef} style={{ '--pm-hero-img': `url(${heroUrl})` }}>
      {business.description && <p className="pm-band">{business.description}</p>}
      <header className="pm-hero">
        <p className="pm-kicker">{t('menu.ourMenu')}</p>
        <h1 className="pm-name">{business.name}</h1>
      </header>

      {tableId && !table && <p className="pm-banner pm-banner--warn">{t('menu.tableNotFound')}</p>}
      {!tableId && <p className="pm-banner">{t('menu.noTable')}</p>}
      {table && <p className="pm-banner">{t('menu.orderingAt', { table: table.name })}</p>}

      {groups.length > 1 && (
        <nav className="pm-tabs" aria-label={t('menu.categoriesLabel')}>
          <ul>
            {groups.map((g) => (
              <li key={g.id}>
                <a
                  href={`#${g.id}`}
                  onClick={(e) => goToSection(e, g.id)}
                  className={active === g.id ? 'is-active' : undefined}
                  aria-current={active === g.id ? 'true' : undefined}
                >
                  {g.category}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <main className="pm-sheet">
        {sentOrder && (
          <section className="pm-sent" role="status">
            <h2>{t('menu.sentTitle')}</h2>
            <p>{t('menu.sentBody', { n: sentOrder.number, total: price(sentOrder.total) })}</p>
            <button type="button" className="btn btn-primary" onClick={() => setSentOrder(null)}>
              {t('menu.orderMore')}
            </button>
          </section>
        )}

        {business.products.length === 0 && <p className="pm-empty">{t('menu.emptyMenu')}</p>}

        {groups.map((group) => (
          <section key={group.id} id={group.id} className="pm-section" aria-labelledby={`${group.id}-title`}>
            <h2 id={`${group.id}-title`} className="pm-category">
              <span>{group.category}</span>
            </h2>
            <ul className="pm-grid">
              {group.items.map((product) => (
                <li key={product._id} className="pm-card">
                  <img
                    className="pm-card-img"
                    src={product.imageUrl || PLACEHOLDER_IMAGE}
                    alt=""
                    loading="lazy"
                    width="600"
                    height="600"
                  />
                  <div className="pm-card-body">
                    <h3 className="pm-card-name">{productName(product.name)}</h3>
                    {product.description && <p className="pm-card-desc">{product.description}</p>}
                    <span className="pm-card-price">{price(product.price)}</span>
                  </div>
                  {canOrder && (
                    <div className="pm-card-action">
                      <QuantityControl product={product} quantity={cart[product._id]} onChange={changeQuantity} />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>

      {canOrder && itemCount > 0 && (
        <div className="pm-cartbar">
          <button type="button" className="pm-cartbar-btn" onClick={() => dialogRef.current?.showModal()}>
            <span>
              {t('menu.viewOrder')} · {t('menu.itemCount', { count: itemCount })}
            </span>
            <strong>{price(total)}</strong>
          </button>
        </div>
      )}

      <dialog ref={dialogRef} className="pm-dialog" aria-labelledby="pm-dialog-title">
        <form onSubmit={sendOrder}>
          <header className="pm-dialog-head">
            <h2 id="pm-dialog-title">{t('menu.yourOrder')}</h2>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => dialogRef.current?.close()}>
              {t('menu.close')}
            </button>
          </header>
          {table && <p className="muted">{table.name}</p>}

          {cartLines.length === 0 ? (
            <p className="muted">{t('menu.emptyCart')}</p>
          ) : (
            <ul className="pm-cart">
              {cartLines.map(({ product, quantity }) => (
                <li key={product._id}>
                  <span className="pm-cart-name">{product.name}</span>
                  <QuantityControl product={product} quantity={quantity} onChange={changeQuantity} />
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
          {sendError && <p className="form-error" role="alert">{sendError}</p>}
          <button className="btn btn-primary btn-block" disabled={sending || cartLines.length === 0}>
            {t(sending ? 'menu.sending' : 'menu.send')}
          </button>
        </form>
      </dialog>
    </div>
  )
}

export default function PublicMenuPage() {
  const { slug, tableId } = useParams()
  const [data, setData] = useState(null)
  const [loadError, setLoadError] = useState(null)

  const load = useCallback(async () => {
    try {
      const query = tableId ? `?table=${encodeURIComponent(tableId)}` : ''
      setData(await api(`/public/${encodeURIComponent(slug)}${query}`))
      setLoadError(null)
    } catch (err) {
      setLoadError(err.code)
    }
  }, [slug, tableId])

  useEffect(() => {
    load()
  }, [load])

  // The original hand-built Kura menu stays available at /kura until a
  // "kura" business is published here, and whenever the API can't be reached,
  // so the printed Kura QR codes keep working.
  if (loadError && slug.toLowerCase() === 'kura') return <KuraMenu />

  if (!data) {
    return (
      <main className="pm-status">
        {loadError ? (
          <>
            <p>{loadError === 'NOT_FOUND' ? t('menu.notFound') : errorMessage(loadError)}</p>
            {loadError !== 'NOT_FOUND' && (
              <button type="button" className="btn btn-primary" onClick={load}>
                {t('app.retry')}
              </button>
            )}
          </>
        ) : (
          <p>{t('app.loading')}</p>
        )}
      </main>
    )
  }

  // The owner's theme styles both kinds of page
  const theme = getTheme(data.theme)
  if (!data.business.ordering) return <theme.Menu business={data.business} />
  return <CartMenu data={data} themeKey={theme.key} tableId={tableId} reload={load} />
}
