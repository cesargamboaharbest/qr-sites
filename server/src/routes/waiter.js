// Endpoints for a logged-in waiter ("mesero"): orders across all the
// businesses of the owner who created them
import { Router } from 'express'
import Business from '../models/Business.js'
import User from '../models/User.js'
import { ownerHasPro } from '../plan.js'
import { HttpError } from '../errors.js'
import { requireAuth } from '../middleware/auth.js'
import { listOrders, updateOrderStatus } from '../orders.js'

const router = Router()

// Checked against the database on every request so a waiter the owner
// deleted loses access right away, not when the token expires
router.use(requireAuth, async (req, res, next) => {
  const user = await User.findById(req.userId)
  if (!user) throw new HttpError(401, 'UNAUTHORIZED')
  if (user.role !== 'waiter' || !user.owner) throw new HttpError(403, 'FORBIDDEN')
  // Waiters are a Pro feature: they stop working if the owner loses Pro
  if (!(await ownerHasPro(user.owner))) throw new HttpError(403, 'PRO_REQUIRED')
  req.businesses = await Business.find({ owner: user.owner }, { name: 1, currency: 1 })
  next()
})

router.get('/orders', async (req, res) => {
  const byId = new Map(req.businesses.map((b) => [String(b._id), b]))
  const orders = await listOrders([...byId.keys()], req.query.status)
  // Each card shows which business the order belongs to, in its currency
  res.json({
    orders: orders.map((order) => {
      const business = byId.get(String(order.business))
      return { ...order.toObject(), businessName: business?.name, currency: business?.currency }
    }),
  })
})

router.patch('/orders/:orderId', async (req, res) => {
  const ids = req.businesses.map((b) => b._id)
  const order = await updateOrderStatus(ids, req.params.orderId, req.body?.status)
  res.json({ order })
})

export default router
