// Owner manages their waiters ("meseros"): which location they work at and
// whether they can also edit the menus (admin). With Pro there's no limit;
// on the Basic plan, BASIC_WAITER_LIMIT waiters for menus without a cart.
import { Router } from 'express'
import mongoose from 'mongoose'
import Business, { tableLocations } from '../models/Business.js'
import User from '../models/User.js'
import { HttpError } from '../errors.js'
import { createUser } from '../credentials.js'
import { ownerOnly, requireAuth } from '../middleware/auth.js'
import { BASIC_WAITER_LIMIT } from '../middleware/staff.js'
import { ownerHasPro } from '../plan.js'

const router = Router()
router.use(requireAuth, ownerOnly)

const toJSON = (waiter) => ({ ...waiter.toPublic(), createdAt: waiter.createdAt })

// Every table location of the owner's businesses, for the waiter form
async function ownerLocations(ownerId) {
  const businesses = await Business.find({ owner: ownerId }, { name: 1, 'tables.location': 1 }).sort({ name: 1 })
  return businesses.flatMap((business) =>
    tableLocations(business.tables).map((name) => ({ business: business._id, businessName: business.name, name }))
  )
}

// `value` is null/empty for "todas las ubicaciones", or { business, name }
// naming one of the owner's table locations
async function parseLocation(ownerId, value) {
  if (!value) return undefined
  const { business, name } = value
  if (!mongoose.isValidObjectId(business)) throw new HttpError(400, 'LOCATION_NOT_FOUND')
  const found = (await ownerLocations(ownerId)).find(
    (l) => String(l.business) === String(business) && l.name.toLowerCase() === String(name ?? '').trim().toLowerCase()
  )
  if (!found) throw new HttpError(400, 'LOCATION_NOT_FOUND')
  return { business: found.business, name: found.name }
}

// `limit` is how many waiters the owner can have (null = no limit, with Pro)
router.get('/', async (req, res) => {
  const [waiters, locations, pro] = await Promise.all([
    User.find({ role: 'waiter', owner: req.userId }).sort({ createdAt: 1, _id: 1 }),
    ownerLocations(req.userId),
    ownerHasPro(req.userId),
  ])
  res.json({ waiters: waiters.map(toJSON), locations, limit: pro ? null : BASIC_WAITER_LIMIT })
})

router.post('/', async (req, res) => {
  // Basic plan: a few waiters, for taking orders in menus without a cart
  if (!(await ownerHasPro(req.userId))) {
    const count = await User.countDocuments({ role: 'waiter', owner: req.userId })
    if (count >= BASIC_WAITER_LIMIT) throw new HttpError(403, 'WAITER_LIMIT')
  }
  const location = await parseLocation(req.userId, req.body?.location)
  const waiter = await createUser(req.body, {
    role: 'waiter',
    owner: req.userId,
    location,
    isAdmin: Boolean(req.body?.isAdmin),
  })
  res.status(201).json({ waiter: toJSON(waiter) })
})

router.patch('/:waiterId', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.waiterId)) throw new HttpError(404, 'NOT_FOUND')
  const waiter = await User.findOne({ _id: req.params.waiterId, role: 'waiter', owner: req.userId })
  if (!waiter) throw new HttpError(404, 'NOT_FOUND')
  if (req.body?.isAdmin !== undefined) waiter.isAdmin = Boolean(req.body.isAdmin)
  if (req.body?.location !== undefined) waiter.location = await parseLocation(req.userId, req.body.location)
  await waiter.save()
  res.json({ waiter: toJSON(waiter) })
})

router.delete('/:waiterId', async (req, res) => {
  const { deletedCount } = await User.deleteOne({ _id: req.params.waiterId, role: 'waiter', owner: req.userId })
  if (!deletedCount) throw new HttpError(404, 'NOT_FOUND')
  res.status(204).end()
})

export default router
