import mongoose, { Schema, Model } from 'mongoose'
import { ICompareShare } from '@/types'

const CompareShareSchema = new Schema<ICompareShare>(
  {
    shareId: { type: String, required: true, unique: true },
    categoryId: { type: String, required: true },
    productIds: [{ type: String, required: true }],
    title: { type: String },
    createdBy: { type: String },
    viewCount: { type: Number, default: 0 },
    expiresAt: { type: Date },
  },
  {
    timestamps: true,
  }
)

// 索引
CompareShareSchema.index({ shareId: 1 })
CompareShareSchema.index({ createdBy: 1 })
CompareShareSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

const CompareShare: Model<ICompareShare> =
  mongoose.models.CompareShare || mongoose.model<ICompareShare>('CompareShare', CompareShareSchema)

export default CompareShare
