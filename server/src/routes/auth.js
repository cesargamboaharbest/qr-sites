import { Router } from 'express'
import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import { HttpError } from '../errors.js'
import { createUser, readCredentials } from '../credentials.js'
import { ownerOnly, requireAuth, signToken } from '../middleware/auth.js'
import { THEMES } from '../themes.js'

const router = Router()

// Waiters get their owner's theme so their screen matches the owner's dashboard
async function publicUser(user) {
  const data = user.toPublic()
  if (user.role === 'waiter' && user.owner) {
    const owner = await User.findById(user.owner, { theme: 1 })
    data.theme = owner?.theme ?? THEMES[0]
  }
  return data
}

// Public sign-up always creates an owner; waiters are created by owners
router.post('/register', async (req, res) => {
  const user = await createUser(req.body)
  res.status(201).json({ token: signToken(user), user: await publicUser(user) })
})

router.post('/login', async (req, res) => {
  const { username, password } = readCredentials(req.body)
  const user = await User.findOne({ username })
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new HttpError(401, 'INVALID_CREDENTIALS')
  }
  res.json({ token: signToken(user), user: await publicUser(user) })
})

router.get('/me', requireAuth, async (req, res) => {
  const user = await User.findById(req.userId)
  if (!user) throw new HttpError(401, 'UNAUTHORIZED')
  res.json({ user: await publicUser(user) })
})

// Account settings. For now: the theme used by all of an owner's sites.
router.patch('/me', requireAuth, ownerOnly, async (req, res) => {
  const user = await User.findById(req.userId)
  if (!user) throw new HttpError(401, 'UNAUTHORIZED')
  if (req.body?.theme !== undefined) {
    if (!THEMES.includes(req.body.theme)) throw new HttpError(400, 'VALIDATION')
    user.theme = req.body.theme
  }
  await user.save()
  res.json({ user: await publicUser(user) })
})

export default router
