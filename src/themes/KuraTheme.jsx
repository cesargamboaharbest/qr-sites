// "Kura" style for menus without a cart: photo header, ribbon section titles,
// dotted price leaders and two columns on wide screens. Same look as the
// original hand-built Kura menu (pages/KuraMenu.jsx), driven by API data.
import { t } from '../i18n/index.js'
import { formatPrice } from '../utils/format.js'
import { groupByCategory, splitSeasonal } from '../utils/products.js'
import { useSectionNav } from './useSectionNav.js'
import heroUrl from '../assets/kura-hero.png'
import '../pages/KuraMenu.css'

function MenuItem({ product, currency, renderAction }) {
  return (
    <li className={product.available ? 'kura-item' : 'kura-item is-sold-out'}>
      <div className="kura-item-line">
        <span className="kura-item-name">{product.name}</span>
        <span className="kura-leader" aria-hidden="true" />
        <span className="kura-price">{formatPrice(product.price, currency)}</span>
      </div>
      {product.description && <p className="kura-item-desc">{product.description}</p>}
      {!product.available && <p className="kura-sold-out">{t('menu.soldOut')}</p>}
      {renderAction?.(product)}
    </li>
  )
}

// "Producto de temporada": big cards on a leaf-green panel above the sections
function SeasonalBlock({ products, currency, renderAction }) {
  if (products.length === 0) return null
  return (
    <section className="kura-seasonal" aria-labelledby="kura-seasonal-title">
      <h2 id="kura-seasonal-title" className="kura-seasonal-title">
        {t('menu.seasonal', { count: products.length })}
      </h2>
      <ul className="kura-seasonal-list">
        {products.map((p) => (
          <li key={p._id} className={p.available ? 'kura-seasonal-card' : 'kura-seasonal-card is-sold-out'}>
            <span className="kura-seasonal-kicker">★ {t('menu.seasonalKicker')}</span>
            <h3 className="kura-seasonal-name">{p.name}</h3>
            {p.description && <p className="kura-seasonal-desc">{p.description}</p>}
            <p className="kura-seasonal-price">{formatPrice(p.price, currency)}</p>
            {!p.available && <p className="kura-sold-out">{t('menu.soldOut')}</p>}
            {renderAction?.(p)}
          </li>
        ))}
      </ul>
    </section>
  )
}

// `renderAction(product)` adds a control to each product (the waiter's
// "Agregar" when taking an order); the public menu has none
export default function KuraTheme({ business, renderAction }) {
  const { seasonal, regular } = splitSeasonal(business.products)
  const sections = groupByCategory(regular, t('products.uncategorized'), business.categoryOrder)
  const { rootRef, active, goToSection } = useSectionNav(sections, '.kura-section')

  return (
    <div className="kura" ref={rootRef}>
      <header
        className="kura-header"
        style={{ backgroundImage: `url(${heroUrl})` }}
        role="img"
        aria-label={business.name}
      />
      <h1 className="visually-hidden">{business.name}</h1>

      {sections.length > 1 && (
        <nav className="kura-tabs" aria-label={t('menu.categoriesLabel')}>
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

      <main className={business.twoColumns ? 'kura-sheet is-two-col' : 'kura-sheet'}>
        {business.products.length === 0 && <p className="kura-note">{t('menu.emptyMenu')}</p>}
        {sections.map((s) => (
          <section key={s.id} id={s.id} className="kura-section" aria-labelledby={`${s.id}-title`}>
            <h2 id={`${s.id}-title`} className="kura-ribbon">
              <span>{s.category}</span>
            </h2>
            <ul className="kura-items">
              {s.items.map((p) => (
                <MenuItem key={p._id} product={p} currency={business.currency} renderAction={renderAction} />
              ))}
            </ul>
          </section>
        ))}
      </main>

      {business.description && (
        <footer className="kura-footer">
          <p>{business.description}</p>
        </footer>
      )}
    </div>
  )
}
