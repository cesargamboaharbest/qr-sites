// "Tienda de té" read-only menu: warm cream shop, brown announcement band,
// spaced-out logo, light oversized product titles ending in a period.
// The cart version of this theme is `.pm--tea` in pages/PublicMenu.css.
import { t } from '../i18n/index.js'
import { formatPrice } from '../utils/format.js'
import { groupByCategory, splitSeasonal } from '../utils/products.js'
import { useSectionNav, withPeriod } from './useSectionNav.js'
import './TeaTheme.css'

// "Producto de temporada": wide caramel cards with oversized titles above the sections
function SeasonalBlock({ products, currency, renderAction }) {
  if (products.length === 0) return null
  return (
    <section className="tt-seasonal" aria-labelledby="tt-seasonal-title">
      <h2 id="tt-seasonal-title" className="tt-seasonal-title">
        {t('menu.seasonal', { count: products.length })}
      </h2>
      <ul className="tt-seasonal-list">
        {products.map((p) => (
          <li key={p._id} className={p.available ? 'tt-seasonal-card' : 'tt-seasonal-card is-sold-out'}>
            <p className="tt-seasonal-kicker">{t('menu.seasonalKicker')}</p>
            <h3 className="tt-seasonal-name">{withPeriod(p.name)}</h3>
            {p.description && <p className="tt-seasonal-desc">{p.description}</p>}
            <p className="tt-seasonal-price">{formatPrice(p.price, currency)}</p>
            {!p.available && <p className="tt-sold-out">{t('menu.soldOut')}</p>}
            {renderAction?.(p)}
          </li>
        ))}
      </ul>
    </section>
  )
}

// `renderAction(product)` adds a control to each product (the waiter's
// "Agregar" when taking an order); the public menu has none
export default function TeaTheme({ business, renderAction, footer }) {
  const { seasonal, regular } = splitSeasonal(business.products)
  const sections = groupByCategory(regular, t('products.uncategorized'), business.categoryOrder)
  const { rootRef, active, goToSection } = useSectionNav(sections, '.tt-section')

  return (
    <div className="tt" ref={rootRef}>
      {business.description && <p className="tt-band">{business.description}</p>}

      <header className="tt-header">
        <h1 className="tt-logo">{business.name}</h1>
      </header>

      {sections.length > 1 && (
        <nav className="tt-nav" aria-label={t('menu.categoriesLabel')}>
          <ul>
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  onClick={(e) => goToSection(e, s.id)}
                  className={active === s.id ? 'is-active' : undefined}
                  aria-current={active === s.id ? 'true' : undefined}
                >
                  {s.category}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <SeasonalBlock products={seasonal} currency={business.currency} renderAction={renderAction} />

      <main className={business.twoColumns ? 'tt-main is-two-col' : 'tt-main'}>
        {business.products.length === 0 && <p className="tt-empty">{t('menu.emptyMenu')}</p>}
        {sections.map((s) => (
          <section key={s.id} id={s.id} className="tt-section" aria-labelledby={`${s.id}-title`}>
            <h2 id={`${s.id}-title`} className="tt-title">
              {s.category}
            </h2>
            <ul className="tt-grid">
              {s.items.map((p) => (
                <li key={p._id} className={p.available ? 'tt-card' : 'tt-card is-sold-out'}>
                  <h3 className="tt-name">{withPeriod(p.name)}</h3>
                  {p.description && <p className="tt-desc">{p.description}</p>}
                  <p className="tt-price">{formatPrice(p.price, business.currency)}</p>
                  {!p.available && <p className="tt-sold-out">{t('menu.soldOut')}</p>}
                  {renderAction?.(p)}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>
      {footer}
    </div>
  )
}
