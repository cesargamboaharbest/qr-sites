import mongoose from 'mongoose'

export const MENU_THEMES = ['kura']

export const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,48}[a-z0-9])?$/

// Slugs live at the root of the site (/<slug>), so they can't shadow app routes.
export const RESERVED_SLUGS = new Set([
  'api',
  'assets',
  'dashboard',
  'login',
  'register',
  'negocios',
  'mesa',
  'admin',
  'favicon.png',
])

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, trim: true, maxlength: 500, default: '' },
  category: { type: String, trim: true, maxlength: 60, default: '' },
  price: { type: Number, required: true, min: 0 },
  available: { type: Boolean, default: true },
})

const tableSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 40 },
})

const businessSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    slug: { type: String, required: true, unique: true, lowercase: true, match: SLUG_PATTERN },
    description: { type: String, trim: true, maxlength: 300, default: '' },
    currency: { type: String, enum: ['CRC', 'USD'], default: 'CRC' },
    // false = "menú sin carrito": a read-only QR menu, no tables or orders
    ordering: { type: Boolean, default: true },
    // Visual style of the read-only menu
    theme: { type: String, enum: MENU_THEMES, default: MENU_THEMES[0] },
    published: { type: Boolean, default: false },
    products: [productSchema],
    tables: [tableSchema],
    // Incremented atomically to give each order a short, human-friendly number
    orderSeq: { type: Number, default: 0 },
  },
  { timestamps: true }
)

businessSchema.methods.toOwnerJSON = function () {
  const { orderSeq, __v, ...rest } = this.toObject()
  return { ...rest, id: this._id }
}

export function slugify(text) {
  return String(text)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50)
    .replace(/-+$/, '')
}

export default mongoose.model('Business', businessSchema)
