// Rebuilds the purchased-products totals ("Más vendidos" tab) from the orders
// that weren't cancelled. Run it once to count orders placed before the tab
// existed, or whenever the totals look off. Safe to run again.
// Usage: npm run rebuild-purchases
// Uses the same database as the server (server/config.js or MONGODB_URI).
import mongoose from 'mongoose'
import Business from '../src/models/Business.js'
import { connectDb } from '../src/db.js'
import { rebuildPurchases } from '../src/purchases.js'

await connectDb()
const businesses = await Business.find({ ordering: true }, { name: 1 })
for (const business of businesses) {
  const count = await rebuildPurchases(business._id)
  console.log(`${business.name}: ${count} products`)
}
await mongoose.disconnect()
