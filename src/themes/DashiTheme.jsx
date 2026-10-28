// "Dashi" read-only menu: the Dashi brand look. Dark rounded header with a
// steaming bowl, orange accents, black pill tabs and playful product cards
// whose colourful tiles show the dish's initial (they wiggle on hover).
// The cart version of this theme is `.pm--dashi` in pages/PublicMenu.css.
import { t } from '../i18n/index.js'
import { formatPrice } from '../utils/format.js'
import { groupByCategory, splitSeasonal } from '../utils/products.js'
import { DashiBowl } from '../components/DashiLogo.jsx'
import { useSectionNav } from './useSectionNav.js'
import './DashiTheme.css'

// First letter (or emoji) of the name, for the product tile
const initial = (name) => [...name.trim()][0]?.toUpperCase() ?? ''

// "Producto de temporada": big orange cards with steam above the sections
function SeasonalBlock({ products, currency, renderAction }) {
  if (products.length === 0) return null
  return (
    <section className="dsh-seasonal" aria-labelledby="dsh-seasonal-title">
      <h2 id="dsh-seasonal-title" className="dsh-title">
        {t('menu.seasonal', { count: products.length })}
      </h2>
      <ul className="dsh-seasonal-list">
        {products.map((p) => (
          <li key={p._id} className={p.available ? 'dsh-seasonal-card' : 'dsh-seasonal-card is-sold-out'}>
            <DashiBowl className="dsh-seasonal-bowl" />
            <p className="dsh-seasonal-kicker">{t('menu.seasonalKicker')}</p>
            <h3 className="dsh-seasonal-name">{p.name}</h3>
            {p.description && <p className="dsh-seasonal-desc">{p.description}</p>}
            <p className="dsh-seasonal-price">{formatPrice(p.price, currency)}</p>
            {!p.available && <p className="dsh-sold-out">{t('menu.soldOut')}</p>}
            {renderAction?.(p)}
          </li>
        ))}
      </ul>
    </section>
  )
}

// `renderAction(product)` adds a control to each product (the waiter's
// "Agregar" when taking an order); the public menu has none. `footer` goes
// last inside the page (the public menu's Dashi credit)
export default function DashiTheme({ business, renderAction, footer }) {
  const { seasonal, regular } = splitSeasonal(business.products)
  const sections = groupByCategory(regular, t('products.uncategorized'), business.categoryOrder)
  const { rootRef, active, goToSection } = useSectionNav(sections, '.dsh-section')

  return (
    <div className="dsh" ref={rootRef}>
      <header className="dsh-hero">
        <div className="dsh-hero-text">
          <p className="dsh-kicker">{t('menu.ourMenu')}</p>
          <h1 className="dsh-name">{business.name}</h1>
          {business.description && <p className="dsh-band">{business.description}</p>}
        </div>
        <DashiBowl className="dsh-hero-bowl" />
      </header>

      {sections.length > 1 && (
        <nav className="dsh-nav" aria-label={t('menu.categoriesLabel')}>
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

      <main className={business.twoColumns ? 'dsh-main is-two-col' : 'dsh-main'}>
        {business.products.length === 0 && <p className="dsh-empty">{t('menu.emptyMenu')}</p>}
        {sections.map((s) => (
          <section key={s.id} id={s.id} className="dsh-section" aria-labelledby={`${s.id}-title`}>
            <h2 id={`${s.id}-title`} className="dsh-title">
              {s.category}
              <span className="dsh-count" aria-hidden="true">
                {s.items.length}
              </span>
            </h2>
            <ul className="dsh-grid">
              {s.items.map((p, i) => (
                <li
                  key={p._id}
                  className={p.available ? 'dsh-card' : 'dsh-card is-sold-out'}
                  style={{ '--i': i }}
                >
                  <span className="dsh-tile" aria-hidden="true">
                    {initial(p.name)}
                  </span>
                  <div className="dsh-card-body">
                    <h3 className="dsh-card-name">{p.name}</h3>
                    {p.description && <p className="dsh-card-desc">{p.description}</p>}
                    {!p.available && <p className="dsh-sold-out">{t('menu.soldOut')}</p>}
                  </div>
                  <p className="dsh-price">{formatPrice(p.price, business.currency)}</p>
                  {renderAction?.(p)}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>

      <footer className="dsh-footer" aria-hidden="true">
        <DashiBowl />
      </footer>
      {footer}
    </div>
  )
}
