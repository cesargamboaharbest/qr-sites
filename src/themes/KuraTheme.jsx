// "Kura" style for menus without a cart: photo header, ribbon section titles,
// dotted price leaders and two columns on wide screens. Same look as the
// original hand-built Kura menu (pages/KuraMenu.jsx), driven by API data.
import { t } from '../i18n/index.js'
import { formatPrice } from '../utils/format.js'
import { groupByCategory } from '../utils/products.js'
import { useSectionNav } from './useSectionNav.js'
import heroUrl from '../assets/kura-hero.png'
import '../pages/KuraMenu.css'

function MenuItem({ product, currency }) {
  return (
    <li className="kura-item">
      <div className="kura-item-line">
        <span className="kura-item-name">{product.name}</span>
        <span className="kura-leader" aria-hidden="true" />
        <span className="kura-price">{formatPrice(product.price, currency)}</span>
      </div>
      {product.description && <p className="kura-item-desc">{product.description}</p>}
    </li>
  )
}

export default function KuraTheme({ business }) {
  const sections = groupByCategory(business.products, t('products.uncategorized'))
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

      <main className="kura-sheet">
        {sections.length === 0 && <p className="kura-note">{t('menu.emptyMenu')}</p>}
        {sections.map((s) => (
          <section key={s.id} id={s.id} className="kura-section" aria-labelledby={`${s.id}-title`}>
            <h2 id={`${s.id}-title`} className="kura-ribbon">
              <span>{s.category}</span>
            </h2>
            <ul className="kura-items">
              {s.items.map((p) => (
                <MenuItem key={p._id} product={p} currency={business.currency} />
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
