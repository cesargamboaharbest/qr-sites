// Username/password rules shared by sign-up and waiter creation
import bcrypt from 'bcryptjs'
import User from './models/User.js'
import { HttpError } from './errors.js'

const USERNAME_PATTERN = /^[a-z0-9._-]{3,40}$/
const MIN_PASSWORD_LENGTH = 6

export function readCredentials(body) {
  const username = String(body?.username ?? '').trim().toLowerCase()
  const password = String(body?.password ?? '')
  return { username, password }
}

// Validates and creates a user; `fields` adds role/business for waiters
export async function createUser(body, fields = {}) {
  const { username, password } = readCredentials(body)
  if (!USERNAME_PATTERN.test(username)) throw new HttpError(400, 'INVALID_USERNAME')
  if (password.length < MIN_PASSWORD_LENGTH) throw new HttpError(400, 'WEAK_PASSWORD')
  if (await User.exists({ username })) throw new HttpError(409, 'USERNAME_TAKEN')
  return User.create({ ...fields, username, passwordHash: await bcrypt.hash(password, 10) })
}
