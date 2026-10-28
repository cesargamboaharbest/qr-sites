// Access for waiters ("meseros"). Checked against the database on every
// request so a waiter the owner deleted or changed loses access right away,
// not when the token expires.
import User from '../models/User.js'
import { HttpError } from '../errors.js'
import { ownerHasPro } from '../plan.js'

export async function loadWaiter(req) {
  const user = await User.findById(req.userId)
  if (!user) throw new HttpError(401, 'UNAUTHORIZED')
  if (user.role !== 'waiter' || !user.owner) throw new HttpError(403, 'FORBIDDEN')
  // Waiters are a Pro feature: they stop working if the owner loses Pro
  if (!(await ownerHasPro(user.owner))) throw new HttpError(403, 'PRO_REQUIRED')
  return user
}

// Mongo filter for the businesses a waiter works for: all of the owner's, or
// only the one their location belongs to
export function waiterBusinesses(waiter) {
  const filter = { owner: waiter.owner }
  if (waiter.location) filter._id = waiter.location.business
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
  req.waiter = waiter
  req.ownerId = waiter.owner
  next()
}
