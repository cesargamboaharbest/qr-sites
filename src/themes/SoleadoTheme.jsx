// "Soleado" read-only menu: bright yellow page with charcoal corner shapes, a
// charcoal stripe behind three round food photos, coloured pill headers for
// each section and bold uppercase dishes with the price on the right.
// The cart version is `.pm--soleado` in pages/PublicMenu.css.
import { t } from '../i18n/index.js'
import { formatPrice } from '../utils/format.js'
import { groupByCategory, splitSeasonal } from '../utils/products.js'
import { useSectionNav } from './useSectionNav.js'
import './SoleadoTheme.css'

// Theme photos: the three circles under the header and the strip at the end.
// Empty = a placeholder circle. `logo` replaces the name in the header.
const FOOD = 'https://cocoviquez.com/comida/'
const PHOTOS = {
  logo: 'https://cocoviquez.com/logo/logo.webp',
  hero: [
    `${FOOD}WhatsApp%20Image%202026-04-05%20at%2022.08.07.jpeg`,
    `${FOOD}WhatsApp%20Image%202026-04-05%20at%2022.08.05.jpeg`,
    `${FOOD}WhatsApp%20Image%202026-04-05%20at%2022.08.05%20(3).jpeg`,
  ],
  footer: [
    `${FOOD}WhatsApp%20Image%202026-04-05%20at%2022.08.12.jpeg`,
    `${FOOD}WhatsApp%20Image%202026-04-05%20at%2022.08.10.jpeg`,
    `${FOOD}WhatsApp%20Image%202026-04-05%20at%2022.08.10%20(2).jpeg`,
  ],
}

function Photo({ src, className }) {
  if (src) return <img src={src} alt="" className={`sol-photo ${className}`} loading="lazy" />
  return (
    <span className={`sol-photo is-placeholder ${className}`} aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 8h3l1.5-2h7L17 8h3v11H4z" />
        <circle cx="12" cy="13" r="3.5" />
      </svg>
    </span>
  )
}

// "Producto de temporada": charcoal cards with a yellow price above the sections
function SeasonalBlock({ products, currency, renderAction }) {
  if (products.length === 0) return null
  return (
    <section className="sol-seasonal" aria-labelledby="sol-seasonal-title">
      <h2 id="sol-seasonal-title" className="sol-title">
        <span>{t('menu.seasonal', { count: products.length })}</span>
      </h2>
      <ul className="sol-seasonal-list">
        {products.map((p) => (
          <li key={p._id} className={p.available ? 'sol-seasonal-card' : 'sol-seasonal-card is-sold-out'}>
            <p className="sol-seasonal-kicker">{t('menu.seasonalKicker')}</p>
            <h3 className="sol-seasonal-name">{p.name}</h3>
            {p.description && <p className="sol-seasonal-desc">{p.description}</p>}
            <p className="sol-seasonal-price">{formatPrice(p.price, currency)}</p>
            {!p.available && <p className="sol-sold-out">{t('menu.soldOut')}</p>}
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
export default function SoleadoTheme({ business, renderAction, footer }) {
  const { seasonal, regular } = splitSeasonal(business.products)
  const sections = groupByCategory(regular, t('products.uncategorized'), business.categoryOrder)
  const { rootRef, active, goToSection } = useSectionNav(sections, '.sol-section')

  return (
    <div className="sol" ref={rootRef}>
      <header className="sol-hero">
        <p className="sol-kicker">{t('menu.ourMenu')}</p>
        {PHOTOS.logo ? (
          <h1 className="sol-logo">
            <img src={PHOTOS.logo} alt={business.name} />
          </h1>
        ) : (
          <h1 className="sol-name">{business.name}</h1>
        )}
        {business.description && <p className="sol-band">{business.description}</p>}
      </header>

      <div className="sol-photos">
        {PHOTOS.hero.map((src, i) => (
          <Photo key={i} src={src} className={i === 1 ? 'is-main' : undefined} />
        ))}
      </div>

      {sections.length > 1 && (
        <nav className="sol-nav" aria-label={t('menu.categoriesLabel')}>
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

      <main className={business.twoColumns ? 'sol-main is-two-col' : 'sol-main'}>
        {business.products.length === 0 && <p className="sol-empty">{t('menu.emptyMenu')}</p>}
        {sections.map((s) => (
          <section key={s.id} id={s.id} className="sol-section" aria-labelledby={`${s.id}-title`}>
            <h2 id={`${s.id}-title`} className="sol-title">
              <span>{s.category}</span>
            </h2>
            <ul className="sol-list">
              {s.items.map((p) => (
                <li key={p._id} className={p.available ? 'sol-item' : 'sol-item is-sold-out'}>
                  <div className="sol-item-body">
                    <h3 className="sol-item-name">{p.name}</h3>
                    {p.description && <p className="sol-item-desc">{p.description}</p>}
                    {!p.available && <p className="sol-sold-out">{t('menu.soldOut')}</p>}
                  </div>
                  <p className="sol-price">{formatPrice(p.price, business.currency)}</p>
                  {renderAction?.(p)}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>

      <div className="sol-footer-photos">
        {PHOTOS.footer.map((src, i) => (
          <Photo key={i} src={src} />
        ))}
      </div>
      {footer}
    </div>
  )
}
