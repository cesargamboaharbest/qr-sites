import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
)

userSchema.methods.toPublic = function () {
  return { id: this._id, username: this.username }
}

export default mongoose.model('User', userSchema)
