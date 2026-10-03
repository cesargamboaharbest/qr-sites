import dns from 'node:dns'
import mongoose from 'mongoose'
import config from './config.js'

if (config.dnsServers.length) dns.setServers(config.dnsServers)

let connecting = null

// Connects once and reuses the connection. On Vercel, function instances are
// reused across requests, so this avoids reconnecting on every call.
export function connectDb() {
  connecting ??= mongoose
    .connect(config.mongodbUri, { serverSelectionTimeoutMS: 8000 })
    .catch((err) => {
      connecting = null // allow a retry on the next request
      throw err
    })
  return connecting
}
