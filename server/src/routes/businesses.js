import { Router } from 'express'
import Business, { IMAGE_URL_PATTERN, RESERVED_SLUGS, SLUG_PATTERN, slugify } from '../models/Business.js'
import Order from '../models/Order.js'
import { HttpError } from '../errors.js'
import { ownerOnly, requireAuth } from '../middleware/auth.js'
import { listOrders, updateOrderStatus } from '../orders.js'
import { ownerHasPro } from '../plan.js'

const router = Router()
router.use(requireAuth, ownerOnly)

function pick(source, keys) {
  const out = {}
  for (const key of keys) {
    if (source?.[key] !== undefined) out[key] = source[key]
  }
  return out
}

function validateSlug(slug) {
  if (!SLUG_PATTERN.test(slug)) throw new HttpError(400, 'INVALID_SLUG')
  if (RESERVED_SLUGS.has(slug)) throw new HttpError(400, 'SLUG_RESERVED')
}

function parsePrice(value) {
  const price = Number(value)
  if (value === '' || value == null || !Number.isFinite(price) || price < 0) {
    throw new HttpError(400, 'INVALID_PRICE')
  }
  return price
}

async function saveBusiness(business) {
  try {
    return await business.save()
  } catch (err) {
    if (err.code === 11000) throw new HttpError(409, 'SLUG_TAKEN')
    throw err
  }
}

async function loadOwned(req) {
  const business = await Business.findOne({ _id: req.params.id, owner: req.userId })
  if (!business) throw new HttpError(404, 'NOT_FOUND')
  return business
}

function findProduct(business, productId) {
  const product = business.products.id(productId)
  if (!product) throw new HttpError(404, 'NOT_FOUND')
  return product
}

// ---------- Businesses ----------

router.get('/', async (req, res) => {
  const businesses = await Business.find({ owner: req.userId }).sort({ createdAt: -1 })
  res.json({ businesses: businesses.map((b) => b.toOwnerJSON()) })
})

router.post('/', async (req, res) => {
  const fields = pick(req.body, ['name', 'description', 'currency', 'ordering'])
  const slug = slugify(req.body?.slug || fields.name || '')
  validateSlug(slug)
  // Menus with a shopping cart are a Pro feature; without Pro the default is
  // a menu without a cart
  const pro = await ownerHasPro(req.userId)
  fields.ordering = fields.ordering === undefined ? pro : Boolean(fields.ordering)
  if (fields.ordering && !pro) throw new HttpError(403, 'PRO_REQUIRED')
  const business = new Business({ ...fields, slug, owner: req.userId })
  await saveBusiness(business)
  res.status(201).json({ business: business.toOwnerJSON() })
})

router.get('/:id', async (req, res) => {
  const business = await loadOwned(req)
  res.json({ business: business.toOwnerJSON() })
})

router.patch('/:id', async (req, res) => {
  const business = await loadOwned(req)
  const fields = pick(req.body, ['name', 'description', 'currency', 'published'])
  if (req.body?.slug !== undefined) {
    fields.slug = slugify(req.body.slug)
    validateSlug(fields.slug)
  }
  // "Crear" publishes the menu; an empty menu isn't worth a public URL
  if (fields.published === true && business.products.length === 0) {
    throw new HttpError(400, 'NO_PRODUCTS')
  }
  business.set(fields)
  await saveBusiness(business)
  res.json({ business: business.toOwnerJSON() })
})

router.delete('/:id', async (req, res) => {
  const business = await loadOwned(req)
  await Order.deleteMany({ business: business._id })
  await business.deleteOne()
  res.status(204).end()
})

// ---------- Products ----------

// Product photos are only for menus with a cart
function productFields(business, body) {
  const keys = ['name', 'description', 'category', 'available']
  if (business.ordering) keys.push('imageUrl')
  const fields = pick(body, keys)
  if (fields.imageUrl !== undefined && !IMAGE_URL_PATTERN.test(String(fields.imageUrl))) {
    throw new HttpError(400, 'INVALID_IMAGE_URL')
  }
  return fields
}

router.post('/:id/products', async (req, res) => {
  const business = await loadOwned(req)
  const fields = productFields(business, req.body)
  business.products.push({ ...fields, price: parsePrice(req.body?.price) })
  await business.save()
  res.status(201).json({ business: business.toOwnerJSON() })
})

router.patch('/:id/products/:productId', async (req, res) => {
  const business = await loadOwned(req)
  const product = findProduct(business, req.params.productId)
  const fields = productFields(business, req.body)
  if (req.body?.price !== undefined) fields.price = parsePrice(req.body.price)
  product.set(fields)
  await business.save()
  res.json({ business: business.toOwnerJSON() })
})

router.delete('/:id/products/:productId', async (req, res) => {
  const business = await loadOwned(req)
  findProduct(business, req.params.productId).deleteOne()
  await business.save()
  res.json({ business: business.toOwnerJSON() })
})

// ---------- Tables ----------

router.post('/:id/tables', async (req, res) => {
  const business = await loadOwned(req)
  business.tables.push(pick(req.body, ['name']))
  await business.save()
  res.status(201).json({ business: business.toOwnerJSON() })
})

router.delete('/:id/tables/:tableId', async (req, res) => {
  const business = await loadOwned(req)
  const table = business.tables.id(req.params.tableId)
  if (!table) throw new HttpError(404, 'NOT_FOUND')
  table.deleteOne()
  await business.save()
  res.json({ business: business.toOwnerJSON() })
})

// ---------- Orders ----------

router.get('/:id/orders', async (req, res) => {
  const business = await loadOwned(req)
  res.json({ orders: await listOrders(business._id, req.query.status) })
})

router.patch('/:id/orders/:orderId', async (req, res) => {
  const business = await loadOwned(req)
  const order = await updateOrderStatus(business._id, req.params.orderId, req.body?.status)
  res.json({ order })
})
export default router
