import { Link } from 'react-router-dom'
import { t } from '../i18n/index.js'
import { COMPANY } from '../data/terms.js'

// Legal + social links at the bottom of the admin, waiter, login and terms pages
export default function SiteFooter({ className = '' }) {
  return (
    <footer className={`site-footer ${className}`} aria-label={t('footer.label')}>
      <span>{t('footer.rights', { year: new Date().getFullYear() })}</span>
      <nav className="site-footer-links">
        <Link to="/terminos-y-condiciones">{t('footer.terms')}</Link>
        <a href={COMPANY.instagramUrl} target="_blank" rel="noopener noreferrer">
          <InstagramIcon /> {t('footer.instagram')}
        </a>
      </nav>
    </footer>
  )
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}
