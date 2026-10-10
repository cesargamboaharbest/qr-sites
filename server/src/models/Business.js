import mongoose from 'mongoose'

// Empty, or a download URL from the project's Firebase Storage bucket
export const IMAGE_URL_PATTERN =
  /^$|^https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/qr-sites-bc4aa\.firebasestorage\.app\/o\/products%2F[^\s]{1,900}$/

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
  // Photo in Firebase Storage; only used by menus with a cart
  imageUrl: { type: String, default: '', match: IMAGE_URL_PATTERN },
})

const tableSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 40 },
  // How many times the table's QR menu was opened (once per browser session)
  scans: { type: Number, default: 0, min: 0 },
})

const businessSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    slug: { type: String, required: true, unique: true, lowercase: true, match: SLUG_PATTERN },
    description: { type: String, trim: true, maxlength: 300, default: '' },
    currency: { type: String, enum: ['CRC', 'USD'], default: 'CRC' },
    // false = "menú sin carrito": a read-only QR menu, no tables or orders
    // (the visual theme is an owner setting, see User.theme)
    // Creating one with a cart requires the owner's Pro plan (User.proPlan)
    ordering: { type: Boolean, default: true },
    // Menus without a cart: lay the categories out in two columns (also on
    // phones) so long menus need less scrolling
    twoColumns: { type: Boolean, default: false },
    // Order of the categories (sections) on the menu, by name. Categories not
    // listed keep the order in which they first appear, after the listed ones
    categoryOrder: { type: [String], default: [] },
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
