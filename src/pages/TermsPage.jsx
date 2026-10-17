import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { t } from '../i18n/index.js'
import { TERMS, TERMS_UPDATED } from '../data/terms.js'
import DashiLogo from '../components/DashiLogo.jsx'
import SiteFooter from '../components/SiteFooter.jsx'

// Public /terminos-y-condiciones page, linked from the footer and the sign-up form
export default function TermsPage() {
  const navigate = useNavigate()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Back to wherever the visitor came from; straight to the login if they
  // opened the page directly (or in a new tab from the sign-up form)
  function goBack(e) {
    if (window.history.state?.idx > 0) {
      e.preventDefault()
      navigate(-1)
    }
  }

  return (
    <div className="terms">
      <header className="terms-header">
        <Link to="/login">
          <DashiLogo className="terms-logo" />
        </Link>
      </header>
      <main className="terms-card">
        <h1>{t('terms.title')}</h1>
        <p className="terms-updated">{t('terms.updated', { date: TERMS_UPDATED })}</p>
        {TERMS.map((section) => (
          <section key={section.title}>
            <h2>{section.title}</h2>
            {section.paragraphs?.map((text, i) => (
              <p key={i}>{text}</p>
            ))}
            {section.bullets && (
              <ul>
                {section.bullets.map((text, i) => (
                  <li key={i}>{text}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
        <Link to="/login" className="terms-back" onClick={goBack}>
          ← {t('terms.back')}
        </Link>
      </main>
      <SiteFooter />
    </div>
  )
}
