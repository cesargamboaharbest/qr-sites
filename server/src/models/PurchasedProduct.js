import mongoose from 'mongoose'

// Running purchase totals per product of a menu with a cart, for the
// "Más vendidos" tab. Updated when an order is placed, and reverted while the
// order is cancelled (see purchases.js). Rebuild from the orders with
// `npm run rebuild-purchases`.
const purchasedProductSchema = new mongoose.Schema(
  {
    business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, required: true },
    // Name at the last purchase, so products deleted from the menu still show
    name: { type: String, required: true },
    // Units sold, orders that included the product, and money they brought in
    quantity: { type: Number, default: 0 },
    orders: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    lastPurchasedAt: { type: Date },
  },
  { timestamps: true }
)

purchasedProductSchema.index({ business: 1, product: 1 }, { unique: true })
purchasedProductSchema.index({ business: 1, quantity: -1 })

export default mongoose.model('PurchasedProduct', purchasedProductSchema, 'purchased-products')
