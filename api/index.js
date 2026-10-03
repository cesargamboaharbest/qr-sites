// Vercel Function: every /api/* request is rewritten here (see vercel.json)
// and handled by the same Express app used in local development.
import app from '../server/src/app.js'
import { connectDb } from '../server/src/db.js'

export default async function handler(req, res) {
  try {
    await connectDb()
  } catch (err) {
    console.error('MongoDB connection failed:', err.message)
    return res.status(503).json({ error: 'DB_UNAVAILABLE' })
  }
  return app(req, res)
}
