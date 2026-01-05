import mongoose, { Schema, Model } from 'mongoose'
import { ICategory } from '@/types'

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    nameEn: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    icon: { type: String, required: true },
    description: { type: String },
    descriptionEn: { type: String },
    image: { type: String },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    productCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
)

// 索引
CategorySchema.index({ slug: 1 })
CategorySchema.index({ order: 1 })
CategorySchema.index({ isActive: 1 })

const Category: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema)

export default Category
