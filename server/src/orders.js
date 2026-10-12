// Order queries shared by the owner dashboard and the waiter view.
// `businessIds` is one id or a list (waiters see all of an owner's businesses).
import Order, { ACTIVE_STATUSES, ORDER_STATUSES } from './models/Order.js'
import { HttpError } from './errors.js'
import { recordPurchases } from './purchases.js'

const inBusinesses = (businessIds) => ({ business: { $in: [].concat(businessIds) } })

export function listOrders(businessIds, status) {
  const filter = inBusinesses(businessIds)
  if (status === 'active') filter.status = { $in: ACTIVE_STATUSES }
  return Order.find(filter).sort({ createdAt: -1 }).limit(200)
}

export async function updateOrderStatus(businessIds, orderId, status) {
  if (!ORDER_STATUSES.includes(status)) throw new HttpError(400, 'INVALID_STATUS')
  const filter = { _id: orderId, ...inBusinesses(businessIds) }
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
