import jwt from 'jsonwebtoken'
import config from '../config.js'
import { HttpError } from '../errors.js'

export function signToken(user) {
  return jwt.sign({ sub: String(user._id) }, config.jwtSecret, { expiresIn: config.jwtExpiresIn })
}

export function requireAuth(req, res, next) {
  const [scheme, token] = (req.headers.authorization ?? '').split(' ')
  if (scheme !== 'Bearer' || !token) throw new HttpError(401, 'UNAUTHORIZED')
  try {
    req.userId = jwt.verify(token, config.jwtSecret).sub
  } catch {
    throw new HttpError(401, 'UNAUTHORIZED')
  }
  next()
}
