import mongoose from 'mongoose'
import { THEMES } from '../themes.js'

export const ROLES = ['owner', 'waiter']

// A waiter's restaurant location: one table location of one business
const locationSchema = new mongoose.Schema(
  {
    business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
    name: { type: String, required: true, trim: true, maxlength: 60 },
  },
  { _id: false }
)

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    // Owners sign up themselves; waiters ("meseros") are created by an owner
    // and see the orders of that owner's businesses (or of one location)
    role: { type: String, enum: ROLES, default: 'owner' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    // Waiters only: limits them to the tables of one location. Unset = all
    // the locations of all the owner's businesses.
    location: { type: locationSchema, default: undefined },
    // Waiters only: can also edit the menus (products, tables, QR codes…) of
    // the businesses they can see. Creating or deleting businesses, managing
    // waiters and the theme stay with the owner.
    isAdmin: { type: Boolean, default: false },
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
  else Object.assign(user, { isAdmin: this.isAdmin, location: this.location ?? null })
  return user
}

export default mongoose.model('User', userSchema)
