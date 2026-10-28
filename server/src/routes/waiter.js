// Endpoints for a logged-in waiter ("mesero"): orders across the businesses of
// the owner who created them (or only their location's tables), and taking
// orders for a table
import { Router } from 'express'
import mongoose from 'mongoose'
import Business from '../models/Business.js'
import { HttpError } from '../errors.js'
import { requireAuth } from '../middleware/auth.js'
import { loadWaiter, waiterBusinesses, waiterOrderScope } from '../middleware/staff.js'
import { createOrder, listOrders, updateOrderStatus } from '../orders.js'

const MAX_TABLE_NAME = 40

const router = Router()

router.use(requireAuth, async (req, res, next) => {
  await loadWaiter(req)
  next()
})

const businessesOf = (req) => waiterBusinesses(req.waiter, req.waiterPro)

// The tables a waiter can take orders for
function waiterTables(waiter, business) {
  const location = waiter.location?.name
  return business.tables.filter((table) => !location || table.location === location)
}

router.get('/orders', async (req, res) => {
  const businesses = await Business.find(businessesOf(req), { name: 1, currency: 1 })
  const byId = new Map(businesses.map((b) => [String(b._id), b]))
  const orders = await listOrders([...byId.keys()], req.query, waiterOrderScope(req.waiter))
  // Each card shows which business the order belongs to, in its currency
  res.json({
    orders: orders.map((order) => {
      const business = byId.get(String(order.business))
      return { ...order.toObject(), businessName: business?.name, currency: business?.currency }
    }),
  })
})

router.patch('/orders/:orderId', async (req, res) => {
  const businesses = await Business.find(businessesOf(req), { _id: 1 })
  const order = await updateOrderStatus(
    businesses.map((b) => b._id),
    req.params.orderId,
    req.body?.status,
    waiterOrderScope(req.waiter)
  )
  res.json({ order })
})

// Menus a waiter can take orders from:
//  - with a cart: those with tables in the waiter's location, with the
//    products that can be ordered
//  - without a cart: published ones. The page loads the menu itself from the
//    public endpoint (by slug) to show it with the owner's theme, and the
//    waiter types the table name.
router.get('/menus', async (req, res) => {
  const businesses = await Business.find({
    ...businessesOf(req),
    $or: [{ ordering: true }, { ordering: false, published: true }],
  }).sort({ name: 1 })
  res.json({
    menus: businesses
      .map((business) =>
        business.ordering
          ? {
              id: business._id,
              name: business.name,
              ordering: true,
              currency: business.currency,
              categoryOrder: business.categoryOrder,
              tables: waiterTables(req.waiter, business).map(({ _id, name, location }) => ({ id: _id, name, location })),
              products: business.products
                .filter((product) => product.available)
                .map(({ _id, name, category, price }) => ({ id: _id, name, category, price })),
            }
          : { id: business._id, name: business.name, ordering: false, slug: business.slug, currency: business.currency }
      )
      .filter((menu) => !menu.ordering || menu.tables.length > 0),
  })
})

// Body: { businessId, items, notes } plus `tableId` (menus with a cart) or
// `tableName` (menus without one)
router.post('/orders', async (req, res) => {
  const { businessId, tableId } = req.body ?? {}
  if (!mongoose.isValidObjectId(businessId)) throw new HttpError(404, 'NOT_FOUND')
  // A waiter with a location is limited to its business
  const filter = businessesOf(req)
  if (filter._id && String(filter._id) !== String(businessId)) throw new HttpError(404, 'NOT_FOUND')
  const business = await Business.findOne({ ...filter, _id: businessId })
  if (!business || (!business.ordering && !business.published)) throw new HttpError(404, 'NOT_FOUND')

  let table
  if (business.ordering) {
    table = waiterTables(req.waiter, business).find((t) => String(t._id) === String(tableId))
    if (!table) throw new HttpError(400, 'TABLE_NOT_FOUND')
  } else {
    const name = String(req.body?.tableName ?? '').trim().slice(0, MAX_TABLE_NAME)
    if (!name) throw new HttpError(400, 'TABLE_NAME_REQUIRED')
    table = { name }
  }
  const order = await createOrder(business, table, req.body, { waiter: req.waiter._id })
  res.status(201).json({ order: { number: order.number, total: order.total } })
})

export default router
