// Order queries shared by the owner dashboard and the waiter view.
// `businessIds` is one id or a list (waiters see all of an owner's businesses).
import Order, { ACTIVE_STATUSES, ORDER_STATUSES } from './models/Order.js'
import { HttpError } from './errors.js'

const inBusinesses = (businessIds) => ({ business: { $in: [].concat(businessIds) } })

export function listOrders(businessIds, status) {
  const filter = inBusinesses(businessIds)
  if (status === 'active') filter.status = { $in: ACTIVE_STATUSES }
  return Order.find(filter).sort({ createdAt: -1 }).limit(200)
}

export async function updateOrderStatus(businessIds, orderId, status) {
  if (!ORDER_STATUSES.includes(status)) throw new HttpError(400, 'INVALID_STATUS')
  const order = await Order.findOneAndUpdate(
    { _id: orderId, ...inBusinesses(businessIds) },
    { status },
    { returnDocument: 'after' }
  )
  if (!order) throw new HttpError(404, 'NOT_FOUND')
  return order
}
