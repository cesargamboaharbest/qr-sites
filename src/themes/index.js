// Styles available for menus without a cart. To add one: create the component,
// register it here, add it to MENU_THEMES in server/src/models/Business.js and
// add its label under "themes" in src/i18n/es.json. The first one is the default.
import KuraTheme from './KuraTheme.jsx'

export const MENU_THEMES = {
  kura: KuraTheme,
}

export const DEFAULT_THEME = Object.keys(MENU_THEMES)[0]
