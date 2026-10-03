// Username/password rules shared by sign-up and waiter creation.
// Usernames are email addresses (stored lowercase).
import bcrypt from 'bcryptjs'
import User from './models/User.js'
import { HttpError } from './errors.js'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const MAX_EMAIL_LENGTH = 254
const MIN_PASSWORD_LENGTH = 6

export function readCredentials(body) {
  const username = String(body?.username ?? '').trim().toLowerCase()
  const password = String(body?.password ?? '')
  return { username, password }
}

export function isValidEmail(email) {
  return email.length <= MAX_EMAIL_LENGTH && EMAIL_PATTERN.test(email)
}

// Validates and creates a user; `fields` adds role/owner for waiters
export async function createUser(body, fields = {}) {
  const { username, password } = readCredentials(body)
  if (!username) throw new HttpError(400, 'EMAIL_REQUIRED')
  if (!isValidEmail(username)) throw new HttpError(400, 'INVALID_EMAIL')
  if (password.length < MIN_PASSWORD_LENGTH) throw new HttpError(400, 'WEAK_PASSWORD')
  if (await User.exists({ username })) throw new HttpError(409, 'USERNAME_TAKEN')
  return User.create({ ...fields, username, passwordHash: await bcrypt.hash(password, 10) })
}
