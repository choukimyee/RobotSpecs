// ==================== 基础类型 ====================

export type UserRole = 'guest' | 'user' | 'editor' | 'admin' | 'superadmin'

export type ProductStatus = 'draft' | 'pending' | 'published' | 'archived'

export type FieldType = 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'image' | 'url' | 'textarea'

export type CompareRule = 'higher_better' | 'lower_better' | 'none'

// ==================== 品类相关 ====================

export interface ICategory {
  _id: string
  name: string
  nameEn: string
  slug: string
  icon: string
  description?: string
  descriptionEn?: string
  image?: string
  order: number
  isActive: boolean
  productCount: number
  createdAt: Date
  updatedAt: Date
}

export interface ICategoryInput {
  name: string
  nameEn: string
  slug: string
  icon: string
  description?: string
  descriptionEn?: string
  image?: string
  order?: number
  isActive?: boolean
}

// ==================== 模板相关 ====================

export interface ITemplateField {
  _id: string
  name: string
  nameEn: string
  key: string
  type: FieldType
  unit?: string
  unitEn?: string
  options?: string[] // for select/multiselect
  required: boolean
  compareRule: CompareRule
  order: number
  description?: string
  descriptionEn?: string
}

export interface ITemplateGroup {
  _id: string
  name: string
  nameEn: string
  key: string
  order: number
  fields: ITemplateField[]
}

export interface ITemplate {
  _id: string
  categoryId: string
  name: string
  nameEn: string
  groups: ITemplateGroup[]
  createdAt: Date
  updatedAt: Date
}

export interface ITemplateFieldInput {
  name: string
  nameEn: string
  key: string
  type: FieldType
  unit?: string
  unitEn?: string
  options?: string[]
  required?: boolean
  compareRule?: CompareRule
  order?: number
  description?: string
  descriptionEn?: string
}

export interface ITemplateGroupInput {
  name: string
  nameEn: string
  key: string
  order?: number
  fields: ITemplateFieldInput[]
}

// ==================== 产品相关 ====================

export interface IProductImage {
  _id: string
  url: string
  caption?: string
  captionEn?: string
  type: 'main' | 'detail' | 'gallery'
  order: number
}

export interface IProductParam {
  fieldKey: string
  value: string | number | string[] | null
}

export interface IProduct {
  _id: string
  categoryId: string
  name: string
  nameEn?: string
  brand: string
  model: string
  slug: string
  mainImage?: string
  images: IProductImage[]
  params: IProductParam[]
  status: ProductStatus
  sourceUrl?: string
  price?: number
  priceUnit?: string
  releaseDate?: Date
  viewCount: number
  compareCount: number
  createdBy?: string
  createdAt: Date
  updatedAt: Date
}

export interface IProductInput {
  categoryId: string
  name: string
  nameEn?: string
  brand: string
  model: string
  slug?: string
  mainImage?: string
  images?: Omit<IProductImage, '_id'>[]
  params?: IProductParam[]
  status?: ProductStatus
  sourceUrl?: string
  price?: number
  priceUnit?: string
  releaseDate?: Date
}

// ==================== 用户相关 ====================

export interface IUser {
  _id: string
  email: string
  name: string
  avatar?: string
  role: UserRole
  password?: string
  provider?: string
  providerId?: string
  isActive: boolean
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}

export interface IUserInput {
  email: string
  name: string
  password?: string
  avatar?: string
  role?: UserRole
  provider?: string
  providerId?: string
}

// ==================== 对比分享相关 ====================

export interface ICompareShare {
  _id: string
  shareId: string
  categoryId: string
  productIds: string[]
  title?: string
  createdBy?: string
  viewCount: number
  expiresAt?: Date
  createdAt: Date
}

export interface ICompareHistory {
  _id: string
  userId: string
  categoryId: string
  productIds: string[]
  createdAt: Date
}

export interface IFavorite {
  _id: string
  userId: string
  productId: string
  createdAt: Date
}

// ==================== API 响应类型 ====================

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// ==================== 前端状态类型 ====================

export interface CompareState {
  categoryId: string | null
  productIds: string[]
  maxProducts: number
}

export interface FilterState {
  brands: string[]
  priceRange: [number, number] | null
  sortBy: 'newest' | 'price_asc' | 'price_desc' | 'popular'
}
