// Pro plan: an owner-level flag (User.proPlan) that unlocks creating menus
// with a shopping cart and using waiters ("meseros").
import User from './models/User.js'

export async function ownerHasPro(ownerId) {
  return Boolean(await User.exists({ _id: ownerId, role: 'owner', proPlan: true }))
}
