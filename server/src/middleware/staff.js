// Access for waiters ("meseros"). Checked against the database on every
// request so a waiter the owner deleted or changed loses access right away,
// not when the token expires.
import User from '../models/User.js'
import { HttpError } from '../errors.js'
import { ownerHasPro } from '../plan.js'

// Basic plan (no Pro): an owner can have this many waiters, and they only
// work with menus without a cart
export const BASIC_WAITER_LIMIT = 2

// Loads the waiter making the request. Sets `req.waiter`, and
// `req.waiterPro` (whether their owner has Pro).
export async function loadWaiter(req) {
  const user = await User.findById(req.userId)
  if (!user) throw new HttpError(401, 'UNAUTHORIZED')
  if (user.role !== 'waiter' || !user.owner) throw new HttpError(403, 'FORBIDDEN')
  const pro = await ownerHasPro(user.owner)
  // An owner who lost Pro keeps only their first waiters
  if (!pro) {
    const first = await User.find({ role: 'waiter', owner: user.owner }, { _id: 1 })
      .sort({ createdAt: 1, _id: 1 })
      .limit(BASIC_WAITER_LIMIT)
    if (!first.some((w) => w._id.equals(user._id))) throw new HttpError(403, 'PRO_REQUIRED')
  }
  req.waiter = user
  req.waiterPro = pro
  return user
}

// Mongo filter for the businesses a waiter works for: all of the owner's, or
// only the one their location belongs to. Menus with a cart are a Pro
// feature, so without Pro only menus without one.
export function waiterBusinesses(waiter, pro) {
  const filter = { owner: waiter.owner }
  if (waiter.location) filter._id = waiter.location.business
  if (!pro) filter.ordering = false
  return filter
}

// Extra order filter for waiters limited to one location's tables
export function waiterOrderScope(waiter) {
  return waiter.location ? { 'table.location': waiter.location.name } : {}
}

// Menu management routes: owners manage their own businesses, admin waiters
// those of their owner (within their location's business). Sets
// `req.ownerId`, and `req.waiter` for waiters.
export async function ownerOrAdmin(req, res, next) {
  if (req.role === 'owner') {
    req.ownerId = req.userId
    return next()
  }
  const waiter = await loadWaiter(req)
  if (!waiter.isAdmin) throw new HttpError(403, 'FORBIDDEN')
  req.ownerId = waiter.owner
  next()
}
