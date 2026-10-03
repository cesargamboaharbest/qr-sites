// Shown for products (in menus with a cart) that have no photo yet
export const PLACEHOLDER_IMAGE = '/generic-product.png'

// Groups products by category, keeping the order in which categories first appear.
// Products without a category go last, under `fallbackLabel`.
export function groupByCategory(products, fallbackLabel) {
  const groups = new Map()
  for (const product of products) {
    const key = product.category || ''
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(product)
  }
  return [...groups.entries()]
    .sort(([a], [b]) => (a === '') - (b === ''))
    .map(([category, items], index) => ({ id: `cat-${index}`, category: category || fallbackLabel, items }))
}
