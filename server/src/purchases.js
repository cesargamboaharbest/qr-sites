// Keeps the purchased-products totals in step with the orders
import Order from './models/Order.js'
import PurchasedProduct from './models/PurchasedProduct.js'

// Adds an order's items to the totals (`sign` 1), or takes them out again
// (`sign` -1) when the order is cancelled
export async function recordPurchases(order, sign = 1) {
  // The same product can't appear twice in an order, but merge just in case
  const byProduct = new Map()
  for (const item of order.items) {
    const key = String(item.product)
    const line = byProduct.get(key) ?? { product: item.product, name: item.name, quantity: 0, revenue: 0 }
    line.quantity += item.quantity
    line.revenue += item.quantity * item.price
    byProduct.set(key, line)
  }

  await PurchasedProduct.bulkWrite(
    [...byProduct.values()].map((line) => ({
      updateOne: {
        filter: { business: order.business, product: line.product },
        update: {
          $inc: { quantity: sign * line.quantity, revenue: sign * line.revenue, orders: sign },
          ...(sign > 0
            ? { $set: { name: line.name }, $max: { lastPurchasedAt: order.createdAt ?? new Date() } }
            : { $setOnInsert: { name: line.name } }),
        },
        upsert: true,
      },
    }))
  )
}

// Recomputes a business's totals from its orders that weren't cancelled
export async function rebuildPurchases(businessId) {
  const totals = await Order.aggregate([
    { $match: { business: businessId, status: { $ne: 'cancelled' } } },
    { $sort: { createdAt: 1 } },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        name: { $last: '$items.name' },
        quantity: { $sum: '$items.quantity' },
        orders: { $sum: 1 },
        revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
        lastPurchasedAt: { $max: '$createdAt' },
      },
    },
  ])
  await PurchasedProduct.deleteMany({ business: businessId })
  if (totals.length) {
    await PurchasedProduct.insertMany(
      totals.map(({ _id, ...rest }) => ({ business: businessId, product: _id, ...rest }))
    )
  }
  return totals.length
}
