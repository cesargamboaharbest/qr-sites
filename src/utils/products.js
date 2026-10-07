// Shown for products (in menus with a cart) that have no photo yet
export const PLACEHOLDER_IMAGE = '/generic-product.png'

// Groups products by category. Categories follow `order` (Business.categoryOrder,
// by name); the rest keep the order in which they first appear, after those.
// Products without a category go last, under `fallbackLabel`.
export function groupByCategory(products, fallbackLabel, order = []) {
  const groups = new Map()
  for (const product of products) {
    const key = product.category || ''
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(product)
  }
  const rank = (key) => {
    if (key === '') return Infinity
    const index = order.indexOf(key)
    return index === -1 ? order.length : index
  }
  // Array sort is stable, so unlisted categories keep their first-appearance order
  return [...groups.entries()]
    .sort(([a], [b]) => rank(a) - rank(b))
    .map(([category, items], index) => ({ id: `cat-${index}`, key: category, category: category || fallbackLabel, items }))
}
