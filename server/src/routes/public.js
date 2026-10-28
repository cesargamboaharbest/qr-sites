// Endpoints used by customers who scan a table's QR code. No login required.
import { Router } from 'express'
import mongoose from 'mongoose'
import Business from '../models/Business.js'
import User from '../models/User.js'
import { THEMES } from '../themes.js'
import { HttpError } from '../errors.js'
import { createOrder } from '../orders.js'

const router = Router()

async function loadPublished(slug) {
  const business = await Business.findOne({ slug: String(slug).toLowerCase(), published: true })
  if (!business) throw new HttpError(404, 'NOT_FOUND')
  return business
}

function findTable(business, tableId) {
  if (!mongoose.isValidObjectId(tableId)) return null
  return business.tables.id(tableId)
}

router.get('/:slug', async (req, res) => {
  const business = await loadPublished(req.params.slug)
  const table = req.query.table ? findTable(business, req.query.table) : null
  // The theme is chosen by the owner for all their sites
  const owner = await User.findById(business.owner, { theme: 1 })
  res.json({
    theme: owner?.theme ?? THEMES[0],
    business: {
      name: business.name,
      slug: business.slug,
      description: business.description,
      currency: business.currency,
      ordering: business.ordering,
      twoColumns: business.twoColumns,
      categoryOrder: business.categoryOrder,
      // Sold-out products are included so the menu can show them grayed out
      products: business.products.map(({ _id, name, description, category, price, available, seasonal, imageUrl }) => ({
        _id,
        name,
        description,
        category,
        price,
        available,
        seasonal: !business.ordering && seasonal,
        imageUrl,
      })),
    },
    table: table && { id: table._id, name: table.name, location: table.location },
  })
})

// Counts a scan of a table's QR code. The page calls it once per browser
// session, so reloads and placing orders don't inflate the count.
router.post('/:slug/tables/:tableId/scans', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.tableId)) throw new HttpError(404, 'NOT_FOUND')
  const { matchedCount } = await Business.updateOne(
    { slug: String(req.params.slug).toLowerCase(), published: true, 'tables._id': req.params.tableId },
    { $inc: { 'tables.$.scans': 1 } }
  )
  if (!matchedCount) throw new HttpError(404, 'NOT_FOUND')
  res.status(204).end()
})

// Same for the single QR code of a menu without a cart
router.post('/:slug/scans', async (req, res) => {
  const { matchedCount } = await Business.updateOne(
    { slug: String(req.params.slug).toLowerCase(), published: true, ordering: false },
    { $inc: { menuScans: 1 } }
  )
  if (!matchedCount) throw new HttpError(404, 'NOT_FOUND')
  res.status(204).end()
})

router.post('/:slug/orders', async (req, res) => {
  const business = await loadPublished(req.params.slug)
  if (!business.ordering) throw new HttpError(400, 'ORDERING_DISABLED')
  const table = findTable(business, req.body?.tableId)
  if (!table) throw new HttpError(400, 'TABLE_NOT_FOUND')
  const order = await createOrder(business, table, req.body)
  res.status(201).json({ order: { number: order.number, total: order.total } })
})

export default router
