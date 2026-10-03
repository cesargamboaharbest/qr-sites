// Owner manages their waiters ("meseros"); waiters see all the owner's orders
import { Router } from 'express'
import User from '../models/User.js'
import { HttpError } from '../errors.js'
import { createUser } from '../credentials.js'
import { ownerOnly, requireAuth } from '../middleware/auth.js'
import { ownerHasPro } from '../plan.js'

const router = Router()
router.use(requireAuth, ownerOnly)

const toJSON = (waiter) => ({ ...waiter.toPublic(), createdAt: waiter.createdAt })

router.get('/', async (req, res) => {
  const waiters = await User.find({ role: 'waiter', owner: req.userId }).sort({ createdAt: 1 })
  res.json({ waiters: waiters.map(toJSON) })
})

router.post('/', async (req, res) => {
  if (!(await ownerHasPro(req.userId))) throw new HttpError(403, 'PRO_REQUIRED')
  const waiter = await createUser(req.body, { role: 'waiter', owner: req.userId })
  res.status(201).json({ waiter: toJSON(waiter) })
})

router.delete('/:waiterId', async (req, res) => {
  const { deletedCount } = await User.deleteOne({ _id: req.params.waiterId, role: 'waiter', owner: req.userId })
  if (!deletedCount) throw new HttpError(404, 'NOT_FOUND')
  res.status(204).end()
})

export default router
