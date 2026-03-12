import mongoose, { Schema, Model } from 'mongoose'
import { IProduct, IProductImage, IProductParam } from '@/types'

const ProductImageSchema = new Schema<IProductImage>(
  {
    url: { type: String, required: true },
    caption: { type: String },
    captionEn: { type: String },
    type: {
      type: String,
      enum: ['main', 'detail', 'gallery'],
      default: 'gallery',
    },
    order: { type: Number, default: 0 },
  },
  { _id: true }
)

const ProductParamSchema = new Schema<IProductParam>(
  {
    fieldKey: { type: String, required: true },
    value: { type: Schema.Types.Mixed },
  },
  { _id: false }
)

const ProductSchema = new Schema<IProduct>(
  {
    categoryId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    nameEn: { type: String },
    brand: { type: String, required: true, index: true },
    model: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    mainImage: { type: String },
    images: [ProductImageSchema],
    params: [ProductParamSchema],
    status: {
      type: String,
      enum: ['draft', 'pending', 'published', 'archived'],
      default: 'draft',
    },
    sourceUrl: { type: String },
    price: { type: Number },
    priceUnit: { type: String, default: 'CNY' },
    releaseDate: { type: Date },
    viewCount: { type: Number, default: 0 },
    compareCount: { type: Number, default: 0 },
    createdBy: { type: String },
  },
  {
    timestamps: true,
  }
)

// 索引
ProductSchema.index({ categoryId: 1, status: 1 })
ProductSchema.index({ slug: 1 })
ProductSchema.index({ brand: 1 })
ProductSchema.index({ status: 1 })
ProductSchema.index({ createdAt: -1 })
ProductSchema.index({ viewCount: -1 })

// 文本索引用于搜索
ProductSchema.index({ name: 'text', nameEn: 'text', brand: 'text', model: 'text' })

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema)

export default Product
