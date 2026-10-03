import dns from 'node:dns'
import mongoose from 'mongoose'
import app from './app.js'
import config from './config.js'

if (config.dnsServers.length) dns.setServers(config.dnsServers)

await mongoose.connect(config.mongodbUri)
console.log(`Connected to MongoDB (${mongoose.connection.name})`)

app.listen(config.port, () => {
  console.log(`API listening on http://localhost:${config.port}`)
})
