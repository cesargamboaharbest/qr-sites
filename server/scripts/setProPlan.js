// Turns the Pro plan on or off for an owner account (there's no billing yet).
// Pro unlocks menus with a shopping cart and waiters ("meseros").
// Usage: npm run set-pro -- <username> [on|off]     (default: on)
// Uses the same database as the server (server/config.js or MONGODB_URI).
import mongoose from 'mongoose'
import User from '../src/models/User.js'
import { connectDb } from '../src/db.js'

const [username, state = 'on'] = process.argv.slice(2)
if (!username || !['on', 'off'].includes(state)) {
  console.error('Usage: npm run set-pro -- <username> [on|off]')
  process.exit(1)
}

await connectDb()
const user = await User.findOneAndUpdate(
  { username: username.toLowerCase(), role: 'owner' },
  { proPlan: state === 'on' },
  { returnDocument: 'after' }
)
console.log(user ? `${user.username}: proPlan = ${user.proPlan}` : `No owner with username "${username}"`)
await mongoose.disconnect()
process.exit(user ? 0 : 1)
