import mongoose, { Schema, Model } from 'mongoose'
import { IFavorite } from '@/types'

const FavoriteSchema = new Schema<IFavorite>(
  {
    userId: { type: String, required: true },
    productId: { type: String, required: true },
  },
  {
    timestamps: true,
  }
)

// 复合索引确保唯一性
FavoriteSchema.index({ userId: 1, productId: 1 }, { unique: true })
FavoriteSchema.index({ userId: 1 })

const Favorite: Model<IFavorite> =
  mongoose.models.Favorite || mongoose.model<IFavorite>('Favorite', FavoriteSchema)

export default Favorite
