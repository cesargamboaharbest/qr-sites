import { t } from '../i18n/index.js'
import './MenuCredit.css'

// Small "made with Dashi" link at the very bottom of every public menu. It
// takes the theme's text colour and stays faint so it doesn't compete with
// the business's own content.
export default function MenuCredit() {
  return (
    <p className="menu-credit">
      <a href="https://dashi.cr" target="_blank" rel="noopener">
        {t('menu.credit')}
      </a>
    </p>
  )
}
