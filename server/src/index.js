// Local development server. On Vercel the same app runs from api/index.js.
import mongoose from 'mongoose'
import app from './app.js'
import config from './config.js'
import { connectDb } from './db.js'

await connectDb()
console.log(`Connected to MongoDB (${mongoose.connection.name})`)

app.listen(config.port, () => {
  console.log(`API listening on http://localhost:${config.port}`)
})
