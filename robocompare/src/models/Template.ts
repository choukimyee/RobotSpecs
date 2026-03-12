import mongoose, { Schema, Model } from 'mongoose'
import { ITemplate, ITemplateGroup, ITemplateField } from '@/types'

const TemplateFieldSchema = new Schema<ITemplateField>(
  {
    name: { type: String, required: true },
    nameEn: { type: String, required: true },
    key: { type: String, required: true },
    type: {
      type: String,
      enum: ['text', 'number', 'date', 'select', 'multiselect', 'image', 'url', 'textarea'],
      default: 'text',
    },
    unit: { type: String },
    unitEn: { type: String },
    options: [{ type: String }],
    required: { type: Boolean, default: false },
    compareRule: {
      type: String,
      enum: ['higher_better', 'lower_better', 'none'],
      default: 'none',
    },
    order: { type: Number, default: 0 },
    description: { type: String },
    descriptionEn: { type: String },
  },
  { _id: true }
)

const TemplateGroupSchema = new Schema<ITemplateGroup>(
  {
    name: { type: String, required: true },
    nameEn: { type: String, required: true },
    key: { type: String, required: true },
    order: { type: Number, default: 0 },
    fields: [TemplateFieldSchema],
  },
  { _id: true }
)

const TemplateSchema = new Schema<ITemplate>(
  {
    categoryId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    nameEn: { type: String, required: true },
    groups: [TemplateGroupSchema],
  },
  {
    timestamps: true,
  }
)

// 索引
TemplateSchema.index({ categoryId: 1 })

const Template: Model<ITemplate> =
  mongoose.models.Template || mongoose.model<ITemplate>('Template', TemplateSchema)

export default Template
