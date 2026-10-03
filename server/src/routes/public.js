// Endpoints used by customers who scan a table's QR code. No login required.
import { Router } from 'express'
import mongoose from 'mongoose'
import Business from '../models/Business.js'
import Order from '../models/Order.js'
import { HttpError } from '../errors.js'

const MAX_QUANTITY = 99

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
  res.json({
    business: {
      name: business.name,
      slug: business.slug,
      description: business.description,
      currency: business.currency,
      ordering: business.ordering,
      theme: business.theme,
      products: business.products
        .filter((p) => p.available)
        .map(({ _id, name, description, category, price }) => ({ _id, name, description, category, price })),
    },
    table: table && { id: table._id, name: table.name },
  })
})

router.post('/:slug/orders', async (req, res) => {
  const business = await loadPublished(req.params.slug)
  if (!business.ordering) throw new HttpError(400, 'ORDERING_DISABLED')
  const table = findTable(business, req.body?.tableId)
  if (!table) throw new HttpError(400, 'TABLE_NOT_FOUND')

  const requested = Array.isArray(req.body?.items) ? req.body.items : []
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
    table: { id: table._id, name: table.name },
    items,
    notes: String(req.body?.notes ?? '').slice(0, 300),
    total,
  })
  res.status(201).json({ order: { number: order.number, total: order.total } })
})

export default router
