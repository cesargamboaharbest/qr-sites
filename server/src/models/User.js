import mongoose from 'mongoose'
import { THEMES } from '../themes.js'

export const ROLES = ['owner', 'waiter']

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    // Owners sign up themselves; waiters ("meseros") are created by an owner
    // and see the orders of all of that owner's businesses
    role: { type: String, enum: ROLES, default: 'owner' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    // Owners only: the style of all their public pages
    theme: { type: String, enum: THEMES, default: THEMES[0] },
    // Owners only: paid plan. Unlocks menus with a shopping cart and waiters.
    // Never set through the API: use `npm run set-pro -- <username>`.
    proPlan: { type: Boolean, default: false },
  },
  { timestamps: true }
)

userSchema.methods.toPublic = function () {
  const user = { id: this._id, username: this.username, role: this.role }
  if (this.role === 'owner') Object.assign(user, { theme: this.theme, proPlan: this.proPlan })
  return user
}

export default mongoose.model('User', userSchema)
