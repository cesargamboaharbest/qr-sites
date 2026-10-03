import jwt from 'jsonwebtoken'
import config from '../config.js'
import { HttpError } from '../errors.js'

export function signToken(user) {
  return jwt.sign({ sub: String(user._id), role: user.role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  })
}

export function requireAuth(req, res, next) {
  const [scheme, token] = (req.headers.authorization ?? '').split(' ')
  if (scheme !== 'Bearer' || !token) throw new HttpError(401, 'UNAUTHORIZED')
  try {
    const payload = jwt.verify(token, config.jwtSecret)
    req.userId = payload.sub
    // Tokens issued before roles existed belong to owners
    req.role = payload.role ?? 'owner'
  } catch {
    throw new HttpError(401, 'UNAUTHORIZED')
  }
  next()
}

// Use after requireAuth on routes that manage businesses
export function ownerOnly(req, res, next) {
  if (req.role !== 'owner') throw new HttpError(403, 'FORBIDDEN')
  next()
}
