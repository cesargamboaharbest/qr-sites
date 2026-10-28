// Order queries shared by the owner dashboard, the waiter view and the public
// menu. `businessIds` is one id or a list (waiters see all of an owner's
// businesses); `scope` narrows it further, e.g. to one location's tables.
import mongoose from 'mongoose'
import Business from './models/Business.js'
import Order, { ACTIVE_STATUSES, ORDER_STATUSES } from './models/Order.js'
import { HttpError } from './errors.js'
import { recordPurchases } from './purchases.js'

const MAX_QUANTITY = 99

const inBusinesses = (businessIds) => ({ business: { $in: [].concat(businessIds) } })

const MAX_ORDERS = 500

function parseDate(value) {
  if (typeof value !== 'string' || !value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) throw new HttpError(400, 'VALIDATION')
  return date
}

// `query` is the request's query string: `status=active` and an optional
// `from`/`to` date range (ISO dates; the page sends the bounds of the user's
// local day, e.g. "today")
export function listOrders(businessIds, query = {}, scope = {}) {
  const filter = { ...inBusinesses(businessIds), ...scope }
  if (query.status === 'active') filter.status = { $in: ACTIVE_STATUSES }
  const from = parseDate(query.from)
  const to = parseDate(query.to)
  if (from || to) filter.createdAt = { ...(from && { $gte: from }), ...(to && { $lt: to }) }
  return Order.find(filter).sort({ createdAt: -1 }).limit(MAX_ORDERS)
}

export async function updateOrderStatus(businessIds, orderId, status, scope = {}) {
  if (!ORDER_STATUSES.includes(status)) throw new HttpError(400, 'INVALID_STATUS')
  if (!mongoose.isValidObjectId(orderId)) throw new HttpError(404, 'NOT_FOUND')
  const filter = { _id: orderId, ...inBusinesses(businessIds), ...scope }
  // Only matches when the status actually changes, so two clicks on "Cancelar"
  // can't take the order out of the purchase totals twice
  const before = await Order.findOneAndUpdate({ ...filter, status: { $ne: status } }, { status })
  if (!before) {
    const order = await Order.findOne(filter)
    if (!order) throw new HttpError(404, 'NOT_FOUND')
    return order
  }
  if (status === 'cancelled') await recordPurchases(before, -1)
  else if (before.status === 'cancelled') await recordPurchases(before, 1)
  before.status = status
  return before
}

// Places an order for a table, from the customer's cart or a waiter. Callers
// check who may order where: customers only in menus with a cart, waiters
// also in menus without one (`table` is then just { name } typed by them).
// `body` is { items: [{ productId, quantity }], notes }.
export async function createOrder(business, table, body, { waiter } = {}) {
  const requested = Array.isArray(body?.items) ? body.items : []
  if (requested.length === 0) throw new HttpError(400, 'EMPTY_ORDER')

  // Prices always come from the database, never from the client
  const items = requested.map(({ productId, quantity }) => {
    const qty = Number(quantity)
    if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QUANTITY) throw new HttpError(400, 'VALIDATION')
    const product = mongoose.isValidObjectId(productId) && business.products.id(productId)
    if (!product || !product.available) throw new HttpError(409, 'PRODUCT_UNAVAILABLE')
    return { product: product._id, name: product.name, price: product.price, quantity: qty }
  })
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const { orderSeq } = await Business.findByIdAndUpdate(
    business._id,
    { $inc: { orderSeq: 1 } },
    { returnDocument: 'after', projection: { orderSeq: 1 } }
  )

  const order = await Order.create({
    business: business._id,
    number: orderSeq,
    table: { id: table._id, name: table.name, location: table.location ?? '' },
    waiter,
    items,
    notes: String(body?.notes ?? '').slice(0, 300),
    total,
  })
  // The order is already saved: don't make anyone resend it if only the stats
  // fail (`npm run rebuild-purchases` fixes them)
  await recordPurchases(order).catch((err) => console.error('recordPurchases failed', order._id, err))
  return order
}
