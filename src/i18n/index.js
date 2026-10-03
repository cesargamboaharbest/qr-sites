// All user-facing text lives in the JSON dictionaries in this folder.
// To add a language: create e.g. en.json with the same keys and register it below.
import es from './es.json'

const dictionaries = { es }
const locale = 'es'
const dictionary = dictionaries[locale]

function lookup(key) {
  return key.split('.').reduce((node, part) => node?.[part], dictionary)
}

// t('menu.sentBody', { n: 4, total: '₡7 400' })
// Entries shaped { one, other } are picked by `vars.count`.
export function t(key, vars) {
  let value = lookup(key)
  if (value && typeof value === 'object' && vars?.count != null) {
    value = vars.count === 1 ? value.one : value.other
  }
  if (typeof value !== 'string') return key
  if (!vars) return value
  return value.replace(/\{(\w+)\}/g, (match, name) => (vars[name] != null ? String(vars[name]) : match))
}

// Turns an API error code into a translated message
export function errorMessage(code) {
  const message = lookup(`errors.${code}`)
  return typeof message === 'string' ? message : dictionary.errors.GENERIC
}

export const numberLocale = dictionary.locale
