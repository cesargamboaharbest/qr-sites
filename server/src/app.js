import express from 'express'
import cors from 'cors'
import config from './config.js'
import authRoutes from './routes/auth.js'
import businessRoutes from './routes/businesses.js'
import publicRoutes from './routes/public.js'
import waiterRoutes from './routes/waiter.js'
import waitersRoutes from './routes/waiters.js'
import { HttpError, errorHandler } from './errors.js'

const app = express()

app.use(cors({ origin: config.corsOrigin }))
app.use(express.json({ limit: '100kb' }))

app.get('/api/health', (req, res) => res.json({ ok: true }))
app.use('/api/auth', authRoutes)
app.use('/api/businesses', businessRoutes)
app.use('/api/public', publicRoutes)
app.use('/api/waiters', waitersRoutes)
app.use('/api/waiter', waiterRoutes)

app.use('/api', () => {
  throw new HttpError(404, 'NOT_FOUND')
})
app.use(errorHandler)

export default app
