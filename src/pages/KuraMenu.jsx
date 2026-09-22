import { useEffect, useState } from 'react'
import { menu, restaurant } from '../data/kuraMenu.js'
import './KuraMenu.css'
import heroUrl from '../assets/kura-hero.png'

const formatPrice = (n) => '₡' + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')

function Price({ item }) {
  if (item.sizes) {
    return (
      <span className="kura-sizes">
        {item.sizes.map((s) => (
          <span key={s.label} className="kura-size">
            <small>{s.label}</small> {formatPrice(s.price)}
          </span>
        ))}
      </span>
    )
  }
  if (item.price == null) {
    return <span className="kura-price kura-price--ask">Consultar</span>
  }
  return <span className="kura-price">{formatPrice(item.price)}</span>
}

function MenuItem({ item }) {
  return (
    <li className="kura-item">
      <div className="kura-item-line">
        <span className="kura-item-name">
          {item.name}
          {item.detail && <span className="kura-item-detail">{item.detail}</span>}
        </span>
        <span className="kura-leader" aria-hidden="true" />
        <Price item={item} />
      </div>
      {item.description && <p className="kura-item-desc">{item.description}</p>}
    </li>
  )
}

function Section({ section }) {
  return (
    <section id={section.id} className="kura-section" aria-labelledby={`${section.id}-title`}>
      <h2 id={`${section.id}-title`} className="kura-ribbon">
        <span>{section.title}</span>
      </h2>
      {section.note && <p className="kura-note">{section.note}</p>}
      <ul className="kura-items">
        {section.items.map((item) => (
          <MenuItem key={item.name} item={item} />
        ))}
      </ul>
      {section.sides && (
        <div className="kura-sides">
          <p>{section.sides.label}</p>
          <ul>
            {section.sides.options.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

export default function KuraMenu() {
  const [active, setActive] = useState(menu[0].id)

  // Highlight the tab for the section currently in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length) setActive(visible[0].target.id)
      },
      { rootMargin: '-30% 0px -60% 0px' }
    )
    menu.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <div className="kura">
      <header
        className="kura-header"
        style={{ backgroundImage: `url(${heroUrl})` }}
        role="img"
        aria-label={`${restaurant.name} ${restaurant.tagline}`}
      />
      <h1 className="visually-hidden">Menú de {restaurant.name} {restaurant.tagline}</h1>

      <nav className="kura-tabs" aria-label="Categorías del menú">
        <ul>
          {menu.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className={active === s.id ? 'is-active' : undefined}
                aria-current={active === s.id ? 'true' : undefined}
              >
                {s.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <main className="kura-sheet">
        {menu.map((s) => (
          <Section key={s.id} section={s} />
        ))}
      </main>

      <footer className="kura-footer">
        <p>
          Reservaciones e información adicional:{' '}
          <a href={`tel:+506${restaurant.phone}`}>
            {restaurant.phone.replace(/(\d{4})(\d{4})/, '$1 $2')}
          </a>
        </p>
      </footer>
    </div>
  )
}
