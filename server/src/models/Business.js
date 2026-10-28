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
  // false = "Platillo agotado": still listed on the menu, grayed out and not orderable
  available: { type: Boolean, default: true },
  // "Producto de temporada": highlighted at the top of menus without a cart
  seasonal: { type: Boolean, default: false },
  // Photo in Firebase Storage; only used by menus with a cart
  imageUrl: { type: String, default: '', match: IMAGE_URL_PATTERN },
})

const tableSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 40 },
  // Restaurant location ("sede") for businesses with several; empty = none.
  // A business's locations are the distinct values of its tables.
  location: { type: String, trim: true, maxlength: 60, default: '' },
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
    // false = "menú sin carrito": a read-only QR menu with no tables; only
    // waiters place orders there, typing the table name
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
    // Menus without a cart: how many times the menu QR was opened (once per
    // browser session). Menus with a cart count scans per table instead.
    menuScans: { type: Number, default: 0, min: 0 },
    products: [productSchema],
    tables: [tableSchema],
    // Table location the "Pedidos" tab opens filtered by; empty = all
    ordersLocation: { type: String, trim: true, maxlength: 60, default: '' },
    // Incremented atomically to give each order a short, human-friendly number
    orderSeq: { type: Number, default: 0 },
  },
  { timestamps: true }
)

businessSchema.methods.toOwnerJSON = function () {
  const { orderSeq, __v, ...rest } = this.toObject()
  return { ...rest, id: this._id }
}

// Distinct table locations, in the spelling first used
export function tableLocations(tables) {
  const byKey = new Map()
  for (const { location } of tables) {
    if (location && !byKey.has(location.toLowerCase())) byKey.set(location.toLowerCase(), location)
  }
  return [...byKey.values()]
}

// Reuses an existing location's spelling when only the case differs, so
// "Escazú" and "escazú" don't become two locations
export function matchLocation(tables, value) {
  const location = String(value ?? '').trim().slice(0, 60)
  return tableLocations(tables).find((l) => l.toLowerCase() === location.toLowerCase()) ?? location
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
