import mongoose, { Schema, Model } from 'mongoose'
import bcrypt from 'bcryptjs'
import { IUser } from '@/types'

interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>
}

type UserModel = Model<IUser, object, IUserMethods>

const UserSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    avatar: { type: String },
    role: {
      type: String,
      enum: ['guest', 'user', 'editor', 'admin', 'superadmin'],
      default: 'user',
    },
    password: { type: String, select: false },
    provider: { type: String },
    providerId: { type: String },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
  },
  {
    timestamps: true,
  }
)

// 密码哈希中间件
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next()
  }
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

// 密码比较方法
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false
  return bcrypt.compare(candidatePassword, this.password)
}

// 索引
UserSchema.index({ email: 1 })
UserSchema.index({ role: 1 })

const User: UserModel = mongoose.models.User || mongoose.model<IUser, UserModel>('User', UserSchema)

export default User
