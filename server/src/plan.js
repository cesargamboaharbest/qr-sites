// Pro plan: an owner-level flag (User.proPlan) that unlocks creating menus
// with a shopping cart and any number of waiters ("meseros"). Without it an
// owner gets a couple of waiters for menus without a cart (middleware/staff.js).
import User from './models/User.js'

export async function ownerHasPro(ownerId) {
  return Boolean(await User.exists({ _id: ownerId, role: 'owner', proPlan: true }))
}
