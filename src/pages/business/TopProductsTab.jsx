import { useCallback, useEffect, useState } from 'react'
import { Navigate, useOutletContext } from 'react-router-dom'
import { api } from '../../api/client.js'
import { errorMessage, t } from '../../i18n/index.js'
import { formatPrice } from '../../utils/format.js'

// "Más vendidos" (menus with a cart): products ranked by units sold, from the
// purchased-products totals. Cancelled orders don't count.
export default function TopProductsTab() {
  const { business } = useOutletContext()
  const [products, setProducts] = useState(null)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      const data = await api(`/businesses/${business.id}/purchased-products`)
      setProducts(data.products)
      setError('')
    } catch (err) {
      setError(errorMessage(err.code))
    }
  }, [business.id])

  useEffect(() => {
    if (business.published && business.ordering) load()
  }, [business.published, business.ordering, load])

  if (!business.published || !business.ordering) return <Navigate to=".." relative="path" replace />

  const onMenu = new Set(business.products.map((p) => String(p._id)))
  const price = (amount) => formatPrice(amount, business.currency)
  const units = products?.reduce((sum, p) => sum + p.quantity, 0) ?? 0
  const revenue = products?.reduce((sum, p) => sum + p.revenue, 0) ?? 0

  return (
    <section className="card stack">
      <div className="top-head">
        <div>
          <h2>{t('topProducts.title')}</h2>
          <p className="muted">{t('topProducts.hint')}</p>
        </div>
        <button type="button" className="btn btn-ghost btn-sm" onClick={load}>
          {t('topProducts.refresh')}
        </button>
      </div>

      {error && <p className="form-error" role="alert">{error}</p>}
      {!products && !error && <p className="muted">{t('app.loading')}</p>}
      {products?.length === 0 && <p className="muted">{t('topProducts.empty')}</p>}

      {products?.length > 0 && (
        <>
          <dl className="top-summary">
            <div>
              <dt>{t('topProducts.totalUnits')}</dt>
              <dd>{units}</dd>
            </div>
            <div>
              <dt>{t('topProducts.totalRevenue')}</dt>
              <dd>{price(revenue)}</dd>
            </div>
          </dl>

          <ol className="top-list">
            {products.map((p, index) => (
              <li key={p._id} className="top-row">
                <span className={`top-rank ${index < 3 ? 'is-podium' : ''}`}>{index + 1}</span>
                <div className="top-name">
                  <strong>{p.name}</strong>
                  {!onMenu.has(String(p.product)) && <span className="badge">{t('topProducts.removed')}</span>}
                  <span className="muted">{t('topProducts.orders', { count: p.orders })}</span>
                </div>
                <div className="top-figures">
                  <strong>{t('topProducts.units', { count: p.quantity })}</strong>
                  <span className="muted">{price(p.revenue)}</span>
                </div>
              </li>
            ))}
          </ol>
        </>
      )}
    </section>
  )
}
