import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('请设置 MONGODB_URI 环境变量')
  process.exit(1)
}

// 品类数据 - 参考图中的品类
const categories = [
  {
    name: 'Humanoid',
    nameEn: 'Humanoid',
    slug: 'humanoid',
    icon: '🤖',
    description: '人形机器人 - 双足直立行走的类人机器人',
    descriptionEn: 'Bipedal robots with human-like appearance',
    order: 1,
    isActive: true,
    productCount: 0,
  },
  {
    name: 'Wheeled',
    nameEn: 'Wheeled',
    slug: 'wheeled',
    icon: '🚗',
    description: '轮式机器人',
    descriptionEn: 'Wheeled robots',
    order: 2,
    isActive: true,
    productCount: 0,
  },
  {
    name: 'Dog',
    nameEn: 'Dog',
    slug: 'dog',
    icon: '🐕',
    description: '四足机器狗',
    descriptionEn: 'Quadruped robot dogs',
    order: 3,
    isActive: true,
    productCount: 0,
  },
  {
    name: 'Vacuum',
    nameEn: 'Vacuum',
    slug: 'vacuum',
    icon: '🧹',
    description: '扫地机器人',
    descriptionEn: 'Vacuum robots',
    order: 4,
    isActive: true,
    productCount: 0,
  },
  {
    name: 'Pool Cleaner',
    nameEn: 'Pool Cleaner',
    slug: 'pool-cleaner',
    icon: '🏊',
    description: '泳池清洁机器人',
    descriptionEn: 'Pool cleaning robots',
    order: 5,
    isActive: true,
    productCount: 0,
  },
  {
    name: 'Lawn Mower',
    nameEn: 'Lawn Mower',
    slug: 'lawn-mower',
    icon: '🌱',
    description: '割草机器人',
    descriptionEn: 'Lawn mowing robots',
    order: 6,
    isActive: true,
    productCount: 0,
  },
  {
    name: 'Companion',
    nameEn: 'Companion',
    slug: 'companion',
    icon: '🤝',
    description: '陪伴机器人',
    descriptionEn: 'Companion robots',
    order: 7,
    isActive: true,
    productCount: 0,
  },
  {
    name: 'Industry',
    nameEn: 'Industry',
    slug: 'industry',
    icon: '🏭',
    description: '工业机器人',
    descriptionEn: 'Industrial robots',
    order: 8,
    isActive: true,
    productCount: 0,
  },
  {
    name: 'Drone',
    nameEn: 'Drone',
    slug: 'drone',
    icon: '🚁',
    description: '无人机',
    descriptionEn: 'Drones',
    order: 9,
    isActive: true,
    productCount: 0,
  },
  {
    name: 'Others',
    nameEn: 'Others',
    slug: 'others',
    icon: '📦',
    description: '其他机器人',
    descriptionEn: 'Other robots',
    order: 10,
    isActive: true,
    productCount: 0,
  },
]

// 人形机器人模板 - 参考图中的参数组
const humanoidTemplate = {
  name: 'Humanoid Robot Template',
  nameEn: 'Humanoid Robot Template',
  groups: [
    {
      name: 'Overview',
      nameEn: 'Overview',
      key: 'overview',
      order: 1,
      fields: [
        { name: 'Height', nameEn: 'Height', key: 'height', type: 'number', unit: 'meters', unitEn: 'meters', required: false, compareRule: 'none', order: 1 },
        { name: 'Weight', nameEn: 'Weight', key: 'weight', type: 'number', unit: 'pounds', unitEn: 'pounds', required: false, compareRule: 'lower_better', order: 2 },
        { name: 'Horizontal reach', nameEn: 'Horizontal reach', key: 'horizontal_reach', type: 'number', unit: 'meters', unitEn: 'meters', required: false, compareRule: 'higher_better', order: 3 },
        { name: 'Vertical reach', nameEn: 'Vertical reach', key: 'vertical_reach', type: 'number', unit: 'meters', unitEn: 'meters', required: false, compareRule: 'higher_better', order: 4 },
      ],
    },
    {
      name: 'Degrees of Freedom',
      nameEn: 'Degrees of Freedom',
      key: 'dof',
      order: 2,
      fields: [
        { name: 'Arms', nameEn: 'Arms', key: 'arms_dof', type: 'text', required: false, compareRule: 'none', order: 1 },
        { name: 'Hands', nameEn: 'Hands', key: 'hands_dof', type: 'text', required: false, compareRule: 'none', order: 2 },
        { name: 'Torso', nameEn: 'Torso', key: 'torso_dof', type: 'number', required: false, compareRule: 'higher_better', order: 3 },
        { name: 'Lower Body', nameEn: 'Lower Body', key: 'lower_body_dof', type: 'number', required: false, compareRule: 'higher_better', order: 4 },
      ],
    },
    {
      name: 'Speed',
      nameEn: 'Speed',
      key: 'speed',
      order: 3,
      fields: [
        { name: 'Navigation Max', nameEn: 'Navigation Max', key: 'navigation_max', type: 'number', unit: 'meter/s', unitEn: 'meter/s', required: false, compareRule: 'higher_better', order: 1 },
      ],
    },
    {
      name: 'Battery',
      nameEn: 'Battery',
      key: 'battery',
      order: 4,
      fields: [
        { name: 'Runtime', nameEn: 'Runtime', key: 'runtime', type: 'number', unit: 'hours', unitEn: 'hours', required: false, compareRule: 'higher_better', order: 1 },
        { name: 'Charge time', nameEn: 'Charge time', key: 'charge_time', type: 'number', unit: 'hour', unitEn: 'hour', required: false, compareRule: 'lower_better', order: 2 },
      ],
    },
    {
      name: 'Ingress Protection',
      nameEn: 'Ingress Protection',
      key: 'ip',
      order: 5,
      fields: [
        { name: 'Hand', nameEn: 'Hand', key: 'hand_ip', type: 'text', required: false, compareRule: 'none', order: 1 },
        { name: 'Lower Arm', nameEn: 'Lower Arm', key: 'lower_arm_ip', type: 'text', required: false, compareRule: 'none', order: 2 },
      ],
    },
  ],
}

// 四足机器狗模板
const dogTemplate = {
  name: 'Robot Dog Template',
  nameEn: 'Robot Dog Template',
  groups: [
    {
      name: 'Overview',
      nameEn: 'Overview',
      key: 'overview',
      order: 1,
      fields: [
        { name: 'Length', nameEn: 'Length', key: 'length', type: 'number', unit: 'mm', unitEn: 'mm', required: false, compareRule: 'none', order: 1 },
        { name: 'Width', nameEn: 'Width', key: 'width', type: 'number', unit: 'mm', unitEn: 'mm', required: false, compareRule: 'none', order: 2 },
        { name: 'Height', nameEn: 'Height', key: 'height', type: 'number', unit: 'mm', unitEn: 'mm', required: false, compareRule: 'none', order: 3 },
        { name: 'Weight', nameEn: 'Weight', key: 'weight', type: 'number', unit: 'kg', unitEn: 'kg', required: false, compareRule: 'lower_better', order: 4 },
      ],
    },
    {
      name: 'Performance',
      nameEn: 'Performance',
      key: 'performance',
      order: 2,
      fields: [
        { name: 'Max Speed', nameEn: 'Max Speed', key: 'max_speed', type: 'number', unit: 'm/s', unitEn: 'm/s', required: false, compareRule: 'higher_better', order: 1 },
        { name: 'Max Payload', nameEn: 'Max Payload', key: 'max_payload', type: 'number', unit: 'kg', unitEn: 'kg', required: false, compareRule: 'higher_better', order: 2 },
        { name: 'Runtime', nameEn: 'Runtime', key: 'runtime', type: 'number', unit: 'min', unitEn: 'min', required: false, compareRule: 'higher_better', order: 3 },
      ],
    },
  ],
}

// Schema 定义
const CategorySchema = new mongoose.Schema({
  name: String,
  nameEn: String,
  slug: { type: String, unique: true },
  icon: String,
  description: String,
  descriptionEn: String,
  image: String,
  order: Number,
  isActive: Boolean,
  productCount: Number,
}, { timestamps: true })

const TemplateFieldSchema = new mongoose.Schema({
  name: String,
  nameEn: String,
  key: String,
  type: String,
  unit: String,
  unitEn: String,
  options: [String],
  required: Boolean,
  compareRule: String,
  order: Number,
  description: String,
  descriptionEn: String,
})

const TemplateGroupSchema = new mongoose.Schema({
  name: String,
  nameEn: String,
  key: String,
  order: Number,
  fields: [TemplateFieldSchema],
})

const TemplateSchema = new mongoose.Schema({
  categoryId: String,
  name: String,
  nameEn: String,
  groups: [TemplateGroupSchema],
}, { timestamps: true })

// 示例产品数据
const sampleProducts = [
  // Sunday Robotics Memo
  {
    name: 'Memo',
    nameEn: 'Memo',
    brand: 'Sunday Robotics',
    model: 'Memo',
    slug: 'sunday-robotics-memo',
    status: 'published',
    params: [
      { fieldKey: 'height', value: '1.7' },
      { fieldKey: 'weight', value: '170' },
      { fieldKey: 'horizontal_reach', value: '0.8' },
      { fieldKey: 'vertical_reach', value: '2.1' },
      { fieldKey: 'arms_dof', value: '2 x 7' },
      { fieldKey: 'hands_dof', value: '2 x4' },
      { fieldKey: 'torso_dof', value: '1' },
      { fieldKey: 'lower_body_dof', value: '4' },
      { fieldKey: 'navigation_max', value: '1' },
      { fieldKey: 'runtime', value: '4' },
      { fieldKey: 'charge_time', value: '1' },
      { fieldKey: 'hand_ip', value: 'IP67' },
      { fieldKey: 'lower_arm_ip', value: 'IP66' },
    ],
  },
  // 1X Robotics Neo
  {
    name: 'Neo',
    nameEn: 'Neo',
    brand: '1X Robotics',
    model: 'Neo',
    slug: '1x-robotics-neo',
    status: 'published',
    params: [
      { fieldKey: 'height', value: '1.7' },
      { fieldKey: 'weight', value: '170' },
      { fieldKey: 'horizontal_reach', value: '0.8' },
      { fieldKey: 'vertical_reach', value: '2.1' },
      { fieldKey: 'arms_dof', value: '2 x 7' },
      { fieldKey: 'hands_dof', value: '2 x4' },
      { fieldKey: 'torso_dof', value: '1' },
      { fieldKey: 'lower_body_dof', value: '4' },
      { fieldKey: 'navigation_max', value: '1' },
      { fieldKey: 'runtime', value: '4' },
      { fieldKey: 'charge_time', value: '1' },
      { fieldKey: 'hand_ip', value: 'IP67' },
      { fieldKey: 'lower_arm_ip', value: 'IP66' },
    ],
  },
  // Tesla Optimus
  {
    name: 'Optimus',
    nameEn: 'Optimus',
    brand: 'Tesla',
    model: 'Optimus',
    slug: 'tesla-optimus',
    status: 'published',
    params: [
      { fieldKey: 'height', value: '1.7' },
      { fieldKey: 'weight', value: '170' },
      { fieldKey: 'horizontal_reach', value: '0.8' },
      { fieldKey: 'vertical_reach', value: '2.1' },
      { fieldKey: 'arms_dof', value: '2 x 7' },
      { fieldKey: 'hands_dof', value: '2 x4' },
      { fieldKey: 'torso_dof', value: '1' },
      { fieldKey: 'lower_body_dof', value: '4' },
      { fieldKey: 'navigation_max', value: '1' },
      { fieldKey: 'runtime', value: '4' },
      { fieldKey: 'charge_time', value: '1' },
      { fieldKey: 'hand_ip', value: 'IP67' },
      { fieldKey: 'lower_arm_ip', value: 'IP66' },
    ],
  },
  // Unitree G1
  {
    name: 'G1',
    nameEn: 'G1',
    brand: 'Unitree',
    model: 'G1',
    slug: 'unitree-g1',
    status: 'published',
    params: [
      { fieldKey: 'height', value: '1.7' },
      { fieldKey: 'weight', value: '170' },
      { fieldKey: 'horizontal_reach', value: '0.8' },
      { fieldKey: 'vertical_reach', value: '2.1' },
      { fieldKey: 'arms_dof', value: '2 x 7' },
      { fieldKey: 'hands_dof', value: '2 x4' },
      { fieldKey: 'torso_dof', value: '1' },
      { fieldKey: 'lower_body_dof', value: '4' },
      { fieldKey: 'navigation_max', value: '1' },
      { fieldKey: 'runtime', value: '4' },
      { fieldKey: 'charge_time', value: '1' },
      { fieldKey: 'hand_ip', value: 'IP67' },
      { fieldKey: 'lower_arm_ip', value: 'IP66' },
    ],
  },
  // Xpeng Iron
  {
    name: 'Iron',
    nameEn: 'Iron',
    brand: 'Xpeng',
    model: 'Iron',
    slug: 'xpeng-iron',
    status: 'published',
    params: [
      { fieldKey: 'height', value: '1.7' },
      { fieldKey: 'weight', value: '170' },
      { fieldKey: 'horizontal_reach', value: '0.8' },
      { fieldKey: 'vertical_reach', value: '2.1' },
      { fieldKey: 'arms_dof', value: '2 x 7' },
      { fieldKey: 'hands_dof', value: '2 x4' },
      { fieldKey: 'torso_dof', value: '1' },
      { fieldKey: 'lower_body_dof', value: '4' },
      { fieldKey: 'navigation_max', value: '1' },
      { fieldKey: 'runtime', value: '4' },
      { fieldKey: 'charge_time', value: '1' },
      { fieldKey: 'hand_ip', value: 'IP67' },
      { fieldKey: 'lower_arm_ip', value: 'IP66' },
    ],
  },
]

// Product Schema
const ProductImageSchema = new mongoose.Schema({
  url: String,
  caption: String,
  captionEn: String,
  type: { type: String, enum: ['main', 'detail', 'gallery'] },
  order: Number,
})

const ProductParamSchema = new mongoose.Schema({
  fieldKey: String,
  value: mongoose.Schema.Types.Mixed,
})

const ProductSchema = new mongoose.Schema({
  categoryId: String,
  name: String,
  nameEn: String,
  brand: String,
  model: String,
  slug: { type: String, unique: true },
  mainImage: String,
  images: [ProductImageSchema],
  params: [ProductParamSchema],
  status: { type: String, enum: ['draft', 'pending', 'published', 'archived'], default: 'draft' },
  sourceUrl: String,
  price: Number,
  priceUnit: String,
  releaseDate: Date,
  viewCount: { type: Number, default: 0 },
  compareCount: { type: Number, default: 0 },
  createdBy: String,
}, { timestamps: true })

async function seed() {
  try {
    console.log('连接数据库...')
    await mongoose.connect(MONGODB_URI!)
    console.log('数据库连接成功')

    // 获取或创建模型
    const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema)
    const Template = mongoose.models.Template || mongoose.model('Template', TemplateSchema)
    const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema)

    // 清空现有数据
    console.log('清空现有数据...')
    await Category.deleteMany({})
    await Template.deleteMany({})
    await Product.deleteMany({})

    // 插入品类
    console.log('插入品类数据...')
    const insertedCategories = await Category.insertMany(categories)
    console.log(`成功插入 ${insertedCategories.length} 个品类`)

    // 创建品类 ID 映射
    const categoryMap: Record<string, string> = {}
    for (const cat of insertedCategories) {
      categoryMap[cat.slug] = cat._id.toString()
    }

    // 插入模板
    console.log('插入模板数据...')
    const templates = [
      { ...humanoidTemplate, categoryId: categoryMap['humanoid'] },
      { ...dogTemplate, categoryId: categoryMap['dog'] },
    ]

    const insertedTemplates = await Template.insertMany(templates)
    console.log(`成功插入 ${insertedTemplates.length} 个模板`)

    // 插入示例产品
    console.log('插入示例产品数据...')
    const productsWithCategory = sampleProducts.map(p => ({
      ...p,
      categoryId: categoryMap['humanoid'],
    }))
    const insertedProducts = await Product.insertMany(productsWithCategory)
    console.log(`成功插入 ${insertedProducts.length} 个产品`)

    // 更新品类的产品数量
    await Category.updateOne(
      { slug: 'humanoid' },
      { $set: { productCount: insertedProducts.length } }
    )

    console.log('\n种子数据初始化完成！')
    console.log('品类:')
    for (const cat of insertedCategories) {
      console.log(`  - ${cat.name} (${cat.slug})`)
    }
    console.log('\n产品:')
    for (const prod of insertedProducts) {
      console.log(`  - ${prod.brand} ${prod.model}`)
    }
  } catch (error) {
    console.error('种子数据初始化失败:', error)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    process.exit(0)
  }
}

seed()
