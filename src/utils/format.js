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
