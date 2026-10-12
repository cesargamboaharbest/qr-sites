// "Boutique" read-only menu: black and white fashion-store look with a pale
// pink promo band, bold spaced logo, dark serif hero, uppercase titles and
// bordered chips. The cart version is `.pm--boutique` in pages/PublicMenu.css.
import { t } from '../i18n/index.js'
import { formatPrice } from '../utils/format.js'
import { groupByCategory, splitSeasonal } from '../utils/products.js'
import { useSectionNav } from './useSectionNav.js'
import './BoutiqueTheme.css'

// "Producto de temporada": black editorial cards with serif titles above the sections
function SeasonalBlock({ products, currency }) {
  if (products.length === 0) return null
  return (
    <section className="bq-seasonal" aria-labelledby="bq-seasonal-title">
      <h2 id="bq-seasonal-title" className="bq-title">
        {t('menu.seasonal', { count: products.length })}
      </h2>
      <ul className="bq-seasonal-list">
        {products.map((p) => (
          <li key={p._id} className={p.available ? 'bq-seasonal-card' : 'bq-seasonal-card is-sold-out'}>
            <p className="bq-seasonal-kicker">{t('menu.seasonalKicker')}</p>
            <h3 className="bq-seasonal-name">{p.name}</h3>
            {p.description && <p className="bq-seasonal-desc">{p.description}</p>}
            <p className="bq-seasonal-price">{formatPrice(p.price, currency)}</p>
            {!p.available && <p className="bq-sold-out">{t('menu.soldOut')}</p>}
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function BoutiqueTheme({ business }) {
  const { seasonal, regular } = splitSeasonal(business.products)
  const sections = groupByCategory(regular, t('products.uncategorized'), business.categoryOrder)
  const { rootRef, active, goToSection } = useSectionNav(sections, '.bq-section')

  return (
    <div className="bq" ref={rootRef}>
      {business.description && <p className="bq-band">{business.description}</p>}

      <header className="bq-header">
        <span className="bq-logo">{business.name}</span>
      </header>

      <div className="bq-hero">
        <p className="bq-kicker">{t('menu.ourMenu')}</p>
        <h1 className="bq-hero-title">{business.name}</h1>
      </div>

      {sections.length > 1 && (
        <nav className="bq-chips" aria-label={t('menu.categoriesLabel')}>
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

      <SeasonalBlock products={seasonal} currency={business.currency} />

      <main className={business.twoColumns ? 'bq-main is-two-col' : 'bq-main'}>
        {business.products.length === 0 && <p className="bq-empty">{t('menu.emptyMenu')}</p>}
        {sections.map((s) => (
          <section key={s.id} id={s.id} className="bq-section" aria-labelledby={`${s.id}-title`}>
            <h2 id={`${s.id}-title`} className="bq-title">
              {s.category}
            </h2>
            <ul className="bq-grid">
              {s.items.map((p) => (
                <li key={p._id} className={p.available ? 'bq-card' : 'bq-card is-sold-out'}>
                  <h3 className="bq-name">{p.name}</h3>
                  {p.description && <p className="bq-desc">{p.description}</p>}
                  <p className="bq-price">{formatPrice(p.price, business.currency)}</p>
                  {!p.available && <p className="bq-sold-out">{t('menu.soldOut')}</p>}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>
    </div>
  )
}
