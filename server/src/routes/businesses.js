import { Router } from 'express'
import mongoose from 'mongoose'
import Business, {
  IMAGE_URL_PATTERN,
  RESERVED_SLUGS,
  SLUG_PATTERN,
  matchLocation,
  slugify,
  tableLocations,
} from '../models/Business.js'
import Order from '../models/Order.js'
import PurchasedProduct from '../models/PurchasedProduct.js'
import { HttpError } from '../errors.js'
import { ownerOnly, requireAuth } from '../middleware/auth.js'
import { ownerOrAdmin, waiterBusinesses, waiterOrderScope } from '../middleware/staff.js'
import { listOrders, updateOrderStatus } from '../orders.js'
import { ownerHasPro } from '../plan.js'

// Owners, and waiters with admin permission ("y demás": everything except
// creating or deleting businesses)
const router = Router()
router.use(requireAuth, ownerOrAdmin)

// The businesses the current user can manage
const managedBusinesses = (req) =>
  req.waiter ? waiterBusinesses(req.waiter, req.waiterPro) : { owner: req.ownerId }
const orderScope = (req) => (req.waiter ? waiterOrderScope(req.waiter) : {})

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

const MAX_CATEGORIES = 100

function parseCategoryOrder(value) {
  if (!Array.isArray(value) || value.length > MAX_CATEGORIES) throw new HttpError(400, 'VALIDATION')
  const names = value.map((name) => String(name).trim().slice(0, 60)).filter(Boolean)
  return [...new Set(names)]
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
  if (!mongoose.isValidObjectId(req.params.id)) throw new HttpError(404, 'NOT_FOUND')
  const filter = managedBusinesses(req)
  if (filter._id && String(filter._id) !== req.params.id) throw new HttpError(404, 'NOT_FOUND')
  const business = await Business.findOne({ ...filter, _id: req.params.id })
  if (!business) throw new HttpError(404, 'NOT_FOUND')
  return business
}

function findTable(business, tableId) {
  const table = business.tables.id(tableId)
  if (!table) throw new HttpError(404, 'NOT_FOUND')
  return table
}

function findProduct(business, productId) {
  const product = business.products.id(productId)
  if (!product) throw new HttpError(404, 'NOT_FOUND')
  return product
}

// ---------- Businesses ----------

router.get('/', async (req, res) => {
  const businesses = await Business.find(managedBusinesses(req)).sort({ createdAt: -1 })
  res.json({ businesses: businesses.map((b) => b.toOwnerJSON()) })
})

router.post('/', ownerOnly, async (req, res) => {
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
  const fields = pick(req.body, ['name', 'description', 'currency', 'published', 'twoColumns'])
  if (req.body?.slug !== undefined) {
    fields.slug = slugify(req.body.slug)
    validateSlug(fields.slug)
  }
  // "Crear" publishes the menu; an empty menu isn't worth a public URL
  if (fields.published === true && business.products.length === 0) {
    throw new HttpError(400, 'NO_PRODUCTS')
  }
  if (fields.twoColumns !== undefined) fields.twoColumns = Boolean(fields.twoColumns)
  if (req.body?.categoryOrder !== undefined) fields.categoryOrder = parseCategoryOrder(req.body.categoryOrder)
  if (req.body?.ordersLocation !== undefined) {
    fields.ordersLocation = matchLocation(business.tables, req.body.ordersLocation)
    if (fields.ordersLocation && !tableLocations(business.tables).includes(fields.ordersLocation)) {
      throw new HttpError(400, 'LOCATION_NOT_FOUND')
    }
  }
  business.set(fields)
  await saveBusiness(business)
  res.json({ business: business.toOwnerJSON() })
})

// Deleting is irreversible: the owner must type the business name (checked in
// the dashboard's confirmation dialog and again here)
router.delete('/:id', ownerOnly, async (req, res) => {
  const business = await loadOwned(req)
  if (String(req.body?.confirmName ?? '').trim() !== business.name) {
    throw new HttpError(400, 'CONFIRM_NAME_MISMATCH')
  }
  await Order.deleteMany({ business: business._id })
  await PurchasedProduct.deleteMany({ business: business._id })
  await business.deleteOne()
  res.status(204).end()
})

// ---------- Products ----------

// Product photos are only for menus with a cart, seasonal products only for
// menus without one
function productFields(business, body) {
  const keys = ['name', 'description', 'category', 'available']
  keys.push(business.ordering ? 'imageUrl' : 'seasonal')
  const fields = pick(body, keys)
  if (fields.available !== undefined) fields.available = Boolean(fields.available)
  if (fields.seasonal !== undefined) fields.seasonal = Boolean(fields.seasonal)
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
  business.tables.push({
    ...pick(req.body, ['name']),
    location: matchLocation(business.tables, req.body?.location),
  })
  await business.save()
  res.status(201).json({ business: business.toOwnerJSON() })
})

// Renaming or moving a table to another location keeps its QR code (the QR
// points at the table id). Past orders keep the location they were placed in.
router.patch('/:id/tables/:tableId', async (req, res) => {
  const business = await loadOwned(req)
  const table = findTable(business, req.params.tableId)
  const fields = pick(req.body, ['name'])
  if (req.body?.location !== undefined) {
    const others = business.tables.filter((t) => !t._id.equals(table._id))
    fields.location = matchLocation(others, req.body.location)
  }
  table.set(fields)
  await business.save()
  res.json({ business: business.toOwnerJSON() })
})

router.delete('/:id/tables/:tableId', async (req, res) => {
  const business = await loadOwned(req)
  findTable(business, req.params.tableId).deleteOne()
  await business.save()
  res.json({ business: business.toOwnerJSON() })
})

// ---------- Most purchased products ("Más vendidos") ----------

router.get('/:id/purchased-products', async (req, res) => {
  const business = await loadOwned(req)
  const products = await PurchasedProduct.find(
    { business: business._id, quantity: { $gt: 0 } },
    { product: 1, name: 1, quantity: 1, orders: 1, revenue: 1, lastPurchasedAt: 1 }
  )
    .sort({ quantity: -1, revenue: -1 })
    .limit(100)
  res.json({ products })
})

// ---------- Orders ----------

router.get('/:id/orders', async (req, res) => {
  const business = await loadOwned(req)
  // ?location=<name> filters by table location; an empty value means tables
  // without one (orders from before locations existed included). A waiter's
  // own location scope always wins.
  const filter = {}
  if (typeof req.query.location === 'string') {
    filter['table.location'] = req.query.location || { $in: ['', null] }
  }
  res.json({ orders: await listOrders(business._id, req.query, { ...filter, ...orderScope(req) }) })
})

router.patch('/:id/orders/:orderId', async (req, res) => {
  const business = await loadOwned(req)
  const order = await updateOrderStatus(business._id, req.params.orderId, req.body?.status, orderScope(req))
  res.json({ order })
})
export default router
