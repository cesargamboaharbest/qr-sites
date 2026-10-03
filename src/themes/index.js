// Site themes. An owner picks one in the top navigation and it applies to all
// their public pages:
//  - Menu: the read-only menu (businesses without a cart, no product pictures)
//  - the cart page (PublicMenuPage) gets the class `pm--<key>`; its styles
//    live in pages/PublicMenu.css
// To add one: create the Menu component, register it here, add the key to
// server/src/themes.js, add `.pm--<key>` styles and its name/description
// under "themes" in src/i18n/es.json. The first one is the default.
import { t } from '../i18n/index.js'
import KuraTheme from './KuraTheme.jsx'
import TeaTheme from './TeaTheme.jsx'
import BoutiqueTheme from './BoutiqueTheme.jsx'

export const THEMES = {
  kura: { Menu: KuraTheme },
  tea: { Menu: TeaTheme },
  boutique: { Menu: BoutiqueTheme },
}

export const DEFAULT_THEME = Object.keys(THEMES)[0]

export function getTheme(key) {
  const resolved = THEMES[key] ? key : DEFAULT_THEME
  return { key: resolved, ...THEMES[resolved] }
}

// "Kura: cintas y dos columnas", for theme dropdowns
export function themeLabel(key) {
  return t('themes.option', { name: t(`themes.${key}.name`), description: t(`themes.${key}.description`) })
}
