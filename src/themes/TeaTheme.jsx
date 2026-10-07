// "Tienda de té" read-only menu: warm cream shop, brown announcement band,
// spaced-out logo, light oversized product titles ending in a period.
// The cart version of this theme is `.pm--tea` in pages/PublicMenu.css.
import { t } from '../i18n/index.js'
import { formatPrice } from '../utils/format.js'
import { groupByCategory } from '../utils/products.js'
import { useSectionNav, withPeriod } from './useSectionNav.js'
import './TeaTheme.css'

export default function TeaTheme({ business }) {
  const sections = groupByCategory(business.products, t('products.uncategorized'), business.categoryOrder)
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

      <main className={business.twoColumns ? 'tt-main is-two-col' : 'tt-main'}>
        {sections.length === 0 && <p className="tt-empty">{t('menu.emptyMenu')}</p>}
        {sections.map((s) => (
          <section key={s.id} id={s.id} className="tt-section" aria-labelledby={`${s.id}-title`}>
            <h2 id={`${s.id}-title`} className="tt-title">
              {s.category}
            </h2>
            <ul className="tt-grid">
              {s.items.map((p) => (
                <li key={p._id} className="tt-card">
                  <h3 className="tt-name">{withPeriod(p.name)}</h3>
                  {p.description && <p className="tt-desc">{p.description}</p>}
                  <p className="tt-price">{formatPrice(p.price, business.currency)}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>
    </div>
  )
}
