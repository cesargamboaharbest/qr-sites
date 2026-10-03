import { Router } from 'express'
import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import { HttpError } from '../errors.js'
import { requireAuth, signToken } from '../middleware/auth.js'

const USERNAME_PATTERN = /^[a-z0-9._-]{3,40}$/
const MIN_PASSWORD_LENGTH = 6

const router = Router()

function readCredentials(body) {
  const username = String(body?.username ?? '').trim().toLowerCase()
  const password = String(body?.password ?? '')
  return { username, password }
}

router.post('/register', async (req, res) => {
  const { username, password } = readCredentials(req.body)
  if (!USERNAME_PATTERN.test(username)) throw new HttpError(400, 'INVALID_USERNAME')
  if (password.length < MIN_PASSWORD_LENGTH) throw new HttpError(400, 'WEAK_PASSWORD')
  if (await User.exists({ username })) throw new HttpError(409, 'USERNAME_TAKEN')

  const user = await User.create({ username, passwordHash: await bcrypt.hash(password, 10) })
  res.status(201).json({ token: signToken(user), user: user.toPublic() })
})

router.post('/login', async (req, res) => {
  const { username, password } = readCredentials(req.body)
  const user = await User.findOne({ username })
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new HttpError(401, 'INVALID_CREDENTIALS')
  }
  res.json({ token: signToken(user), user: user.toPublic() })
})

router.get('/me', requireAuth, async (req, res) => {
  const user = await User.findById(req.userId)
  if (!user) throw new HttpError(401, 'UNAUTHORIZED')
  res.json({ user: user.toPublic() })
})

export default router
