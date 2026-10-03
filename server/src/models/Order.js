import mongoose from 'mongoose'

export const ORDER_STATUSES = ['pending', 'preparing', 'served', 'cancelled']
export const ACTIVE_STATUSES = ['pending', 'preparing']

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, required: true },
    // Name and price are copied so old orders survive menu edits
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
)

const orderSchema = new mongoose.Schema(
  {
    business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
    number: { type: Number, required: true },
    table: {
      id: { type: mongoose.Schema.Types.ObjectId, required: true },
      name: { type: String, required: true },
    },
    items: { type: [orderItemSchema], validate: (v) => v.length > 0 },
    notes: { type: String, trim: true, maxlength: 300, default: '' },
    total: { type: Number, required: true },
    status: { type: String, enum: ORDER_STATUSES, default: 'pending' },
  },
  { timestamps: true }
)

orderSchema.index({ business: 1, createdAt: -1 })

export default mongoose.model('Order', orderSchema)
