import { numberLocale } from '../i18n/index.js'

const formatters = {}

export function formatPrice(amount, currency = 'CRC') {
  formatters[currency] ??= new Intl.NumberFormat(numberLocale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
  return formatters[currency].format(amount)
}

export function formatTime(date) {
  return new Date(date).toLocaleTimeString(numberLocale, { hour: 'numeric', minute: '2-digit' })
}

// "Mesa 4 · Escazú": the table plus its restaurant location, when it has one
export function tableLabel(table) {
  return table.location ? `${table.name} · ${table.location}` : table.name
}

// Distinct table locations, in the spelling first used (mirrors the server)
export function tableLocations(tables) {
  const byKey = new Map()
  for (const { location } of tables) {
    if (location && !byKey.has(location.toLowerCase())) byKey.set(location.toLowerCase(), location)
  }
  return [...byKey.values()]
}

export function slugify(text) {
  return String(text)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50)
}

export function publicMenuUrl(slug, tableId) {
  const base = `${window.location.origin}/${slug}`
  return tableId ? `${base}/mesa/${tableId}` : base
}
