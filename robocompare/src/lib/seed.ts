import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('请设置 MONGODB_URI 环境变量')
  process.exit(1)
}

// 品类数据
const categories = [
  {
    name: '人形机器人',
    nameEn: 'Humanoid Robot',
    slug: 'humanoid',
    icon: '🤖',
    description: '双足直立行走的类人机器人，具有类似人类的外形和运动能力',
    descriptionEn: 'Bipedal robots with human-like appearance and movement capabilities',
    order: 1,
    isActive: true,
    productCount: 0,
  },
  {
    name: '四足机器狗',
    nameEn: 'Quadruped Robot',
    slug: 'quadruped',
    icon: '🐕',
    description: '四足行走的仿生机器人，具有优秀的地形适应能力',
    descriptionEn: 'Four-legged robots with excellent terrain adaptability',
    order: 2,
    isActive: true,
    productCount: 0,
  },
  {
    name: '灵巧手',
    nameEn: 'Dexterous Hand',
    slug: 'dexterous-hand',
    icon: '✋',
    description: '高自由度仿人机械手，用于精细操作和抓取任务',
    descriptionEn: 'High-DOF robotic hands for fine manipulation and grasping tasks',
    order: 3,
    isActive: true,
    productCount: 0,
  },
]

// 人形机器人模板
const humanoidTemplate = {
  name: '人形机器人参数模板',
  nameEn: 'Humanoid Robot Template',
  groups: [
    {
      name: '基本信息',
      nameEn: 'Basic Information',
      key: 'basic',
      order: 1,
      fields: [
        { name: '产品状态', nameEn: 'Product Status', key: 'product_status', type: 'select', options: ['在售', '停产', '预售', '概念'], required: false, compareRule: 'none', order: 1 },
        { name: '发布日期', nameEn: 'Release Date', key: 'release_date', type: 'date', required: false, compareRule: 'none', order: 2 },
        { name: '官方售价', nameEn: 'Official Price', key: 'price', type: 'number', unit: '元', unitEn: 'CNY', required: false, compareRule: 'lower_better', order: 3 },
        { name: '官网链接', nameEn: 'Official Website', key: 'website', type: 'url', required: false, compareRule: 'none', order: 4 },
      ],
    },
    {
      name: '物理规格',
      nameEn: 'Physical Specifications',
      key: 'physical',
      order: 2,
      fields: [
        { name: '身高', nameEn: 'Height', key: 'height', type: 'number', unit: 'mm', unitEn: 'mm', required: false, compareRule: 'none', order: 1 },
        { name: '体重', nameEn: 'Weight', key: 'weight', type: 'number', unit: 'kg', unitEn: 'kg', required: false, compareRule: 'lower_better', order: 2 },
        { name: '臂展', nameEn: 'Arm Span', key: 'arm_span', type: 'number', unit: 'mm', unitEn: 'mm', required: false, compareRule: 'none', order: 3 },
        { name: '全身自由度', nameEn: 'Total DOF', key: 'total_dof', type: 'number', unit: '个', unitEn: 'DOF', required: false, compareRule: 'higher_better', order: 4 },
        { name: '头部自由度', nameEn: 'Head DOF', key: 'head_dof', type: 'number', unit: '个', unitEn: 'DOF', required: false, compareRule: 'higher_better', order: 5 },
        { name: '单臂自由度', nameEn: 'Arm DOF', key: 'arm_dof', type: 'number', unit: '个', unitEn: 'DOF', required: false, compareRule: 'higher_better', order: 6 },
        { name: '单手自由度', nameEn: 'Hand DOF', key: 'hand_dof', type: 'number', unit: '个', unitEn: 'DOF', required: false, compareRule: 'higher_better', order: 7 },
        { name: '腰部自由度', nameEn: 'Waist DOF', key: 'waist_dof', type: 'number', unit: '个', unitEn: 'DOF', required: false, compareRule: 'higher_better', order: 8 },
        { name: '单腿自由度', nameEn: 'Leg DOF', key: 'leg_dof', type: 'number', unit: '个', unitEn: 'DOF', required: false, compareRule: 'higher_better', order: 9 },
        { name: '防护等级', nameEn: 'IP Rating', key: 'ip_rating', type: 'text', required: false, compareRule: 'none', order: 10 },
      ],
    },
    {
      name: '性能参数',
      nameEn: 'Performance',
      key: 'performance',
      order: 3,
      fields: [
        { name: '最大负载', nameEn: 'Max Payload', key: 'max_payload', type: 'number', unit: 'kg', unitEn: 'kg', required: false, compareRule: 'higher_better', order: 1 },
        { name: '单臂负载', nameEn: 'Arm Payload', key: 'arm_payload', type: 'number', unit: 'kg', unitEn: 'kg', required: false, compareRule: 'higher_better', order: 2 },
        { name: '行走速度', nameEn: 'Walking Speed', key: 'walking_speed', type: 'number', unit: 'm/s', unitEn: 'm/s', required: false, compareRule: 'higher_better', order: 3 },
        { name: '奔跑速度', nameEn: 'Running Speed', key: 'running_speed', type: 'number', unit: 'm/s', unitEn: 'm/s', required: false, compareRule: 'higher_better', order: 4 },
        { name: '电池容量', nameEn: 'Battery Capacity', key: 'battery_capacity', type: 'number', unit: 'Wh', unitEn: 'Wh', required: false, compareRule: 'higher_better', order: 5 },
        { name: '续航时间', nameEn: 'Battery Life', key: 'battery_life', type: 'number', unit: '分钟', unitEn: 'min', required: false, compareRule: 'higher_better', order: 6 },
        { name: '充电时间', nameEn: 'Charging Time', key: 'charging_time', type: 'number', unit: '分钟', unitEn: 'min', required: false, compareRule: 'lower_better', order: 7 },
      ],
    },
    {
      name: '智能功能',
      nameEn: 'Intelligence',
      key: 'intelligence',
      order: 4,
      fields: [
        { name: '传感器类型', nameEn: 'Sensors', key: 'sensors', type: 'textarea', required: false, compareRule: 'none', order: 1 },
        { name: '视觉系统', nameEn: 'Vision System', key: 'vision_system', type: 'textarea', required: false, compareRule: 'none', order: 2 },
        { name: '语音交互', nameEn: 'Voice Interaction', key: 'voice_interaction', type: 'text', required: false, compareRule: 'none', order: 3 },
        { name: 'AI芯片', nameEn: 'AI Chip', key: 'ai_chip', type: 'text', required: false, compareRule: 'none', order: 4 },
        { name: '操作系统', nameEn: 'Operating System', key: 'operating_system', type: 'text', required: false, compareRule: 'none', order: 5 },
      ],
    },
  ],
}

// 四足机器狗模板
const quadrupedTemplate = {
  name: '四足机器狗参数模板',
  nameEn: 'Quadruped Robot Template',
  groups: [
    {
      name: '基本信息',
      nameEn: 'Basic Information',
      key: 'basic',
      order: 1,
      fields: [
        { name: '产品状态', nameEn: 'Product Status', key: 'product_status', type: 'select', options: ['在售', '停产', '预售'], required: false, compareRule: 'none', order: 1 },
        { name: '发布日期', nameEn: 'Release Date', key: 'release_date', type: 'date', required: false, compareRule: 'none', order: 2 },
        { name: '官方售价', nameEn: 'Official Price', key: 'price', type: 'number', unit: '元', unitEn: 'CNY', required: false, compareRule: 'lower_better', order: 3 },
      ],
    },
    {
      name: '物理规格',
      nameEn: 'Physical Specifications',
      key: 'physical',
      order: 2,
      fields: [
        { name: '站立长度', nameEn: 'Standing Length', key: 'length', type: 'number', unit: 'mm', unitEn: 'mm', required: false, compareRule: 'none', order: 1 },
        { name: '站立宽度', nameEn: 'Standing Width', key: 'width', type: 'number', unit: 'mm', unitEn: 'mm', required: false, compareRule: 'none', order: 2 },
        { name: '站立高度', nameEn: 'Standing Height', key: 'height', type: 'number', unit: 'mm', unitEn: 'mm', required: false, compareRule: 'none', order: 3 },
        { name: '体重', nameEn: 'Weight', key: 'weight', type: 'number', unit: 'kg', unitEn: 'kg', required: false, compareRule: 'lower_better', order: 4 },
        { name: '单腿自由度', nameEn: 'Leg DOF', key: 'leg_dof', type: 'number', unit: '个', unitEn: 'DOF', required: false, compareRule: 'higher_better', order: 5 },
        { name: '防护等级', nameEn: 'IP Rating', key: 'ip_rating', type: 'text', required: false, compareRule: 'none', order: 6 },
      ],
    },
    {
      name: '性能参数',
      nameEn: 'Performance',
      key: 'performance',
      order: 3,
      fields: [
        { name: '最大负载', nameEn: 'Max Payload', key: 'max_payload', type: 'number', unit: 'kg', unitEn: 'kg', required: false, compareRule: 'higher_better', order: 1 },
        { name: '最大速度', nameEn: 'Max Speed', key: 'max_speed', type: 'number', unit: 'm/s', unitEn: 'm/s', required: false, compareRule: 'higher_better', order: 2 },
        { name: '最大坡度', nameEn: 'Max Slope', key: 'max_slope', type: 'number', unit: '°', unitEn: '°', required: false, compareRule: 'higher_better', order: 3 },
        { name: '最大台阶', nameEn: 'Max Step Height', key: 'max_step', type: 'number', unit: 'mm', unitEn: 'mm', required: false, compareRule: 'higher_better', order: 4 },
        { name: '续航时间', nameEn: 'Battery Life', key: 'battery_life', type: 'number', unit: '分钟', unitEn: 'min', required: false, compareRule: 'higher_better', order: 5 },
      ],
    },
  ],
}

// 灵巧手模板
const dexterousHandTemplate = {
  name: '灵巧手参数模板',
  nameEn: 'Dexterous Hand Template',
  groups: [
    {
      name: '基本信息',
      nameEn: 'Basic Information',
      key: 'basic',
      order: 1,
      fields: [
        { name: '产品状态', nameEn: 'Product Status', key: 'product_status', type: 'select', options: ['在售', '停产', '预售'], required: false, compareRule: 'none', order: 1 },
        { name: '发布日期', nameEn: 'Release Date', key: 'release_date', type: 'date', required: false, compareRule: 'none', order: 2 },
        { name: '官方售价', nameEn: 'Official Price', key: 'price', type: 'number', unit: '元', unitEn: 'CNY', required: false, compareRule: 'lower_better', order: 3 },
        { name: '手型', nameEn: 'Hand Type', key: 'hand_type', type: 'select', options: ['左手', '右手', '通用'], required: false, compareRule: 'none', order: 4 },
      ],
    },
    {
      name: '物理规格',
      nameEn: 'Physical Specifications',
      key: 'physical',
      order: 2,
      fields: [
        { name: '手指数量', nameEn: 'Number of Fingers', key: 'finger_count', type: 'number', unit: '个', unitEn: '', required: false, compareRule: 'higher_better', order: 1 },
        { name: '总自由度', nameEn: 'Total DOF', key: 'total_dof', type: 'number', unit: '个', unitEn: 'DOF', required: false, compareRule: 'higher_better', order: 2 },
        { name: '主动自由度', nameEn: 'Active DOF', key: 'active_dof', type: 'number', unit: '个', unitEn: 'DOF', required: false, compareRule: 'higher_better', order: 3 },
        { name: '重量', nameEn: 'Weight', key: 'weight', type: 'number', unit: 'g', unitEn: 'g', required: false, compareRule: 'lower_better', order: 4 },
        { name: '手掌长度', nameEn: 'Palm Length', key: 'palm_length', type: 'number', unit: 'mm', unitEn: 'mm', required: false, compareRule: 'none', order: 5 },
        { name: '手掌宽度', nameEn: 'Palm Width', key: 'palm_width', type: 'number', unit: 'mm', unitEn: 'mm', required: false, compareRule: 'none', order: 6 },
      ],
    },
    {
      name: '性能参数',
      nameEn: 'Performance',
      key: 'performance',
      order: 3,
      fields: [
        { name: '单指力', nameEn: 'Finger Force', key: 'finger_force', type: 'number', unit: 'N', unitEn: 'N', required: false, compareRule: 'higher_better', order: 1 },
        { name: '抓握力', nameEn: 'Grip Force', key: 'grip_force', type: 'number', unit: 'N', unitEn: 'N', required: false, compareRule: 'higher_better', order: 2 },
        { name: '最大抓握直径', nameEn: 'Max Grip Diameter', key: 'max_grip_diameter', type: 'number', unit: 'mm', unitEn: 'mm', required: false, compareRule: 'higher_better', order: 3 },
        { name: '通信接口', nameEn: 'Communication', key: 'communication', type: 'text', required: false, compareRule: 'none', order: 4 },
        { name: '驱动方式', nameEn: 'Actuation', key: 'actuation', type: 'text', required: false, compareRule: 'none', order: 5 },
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

async function seed() {
  try {
    console.log('连接数据库...')
    await mongoose.connect(MONGODB_URI!)
    console.log('数据库连接成功')

    // 获取或创建模型
    const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema)
    const Template = mongoose.models.Template || mongoose.model('Template', TemplateSchema)

    // 清空现有数据（可选）
    console.log('清空现有品类和模板数据...')
    await Category.deleteMany({})
    await Template.deleteMany({})

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
      { ...quadrupedTemplate, categoryId: categoryMap['quadruped'] },
      { ...dexterousHandTemplate, categoryId: categoryMap['dexterous-hand'] },
    ]

    const insertedTemplates = await Template.insertMany(templates)
    console.log(`成功插入 ${insertedTemplates.length} 个模板`)

    console.log('\n种子数据初始化完成！')
    console.log('品类:')
    for (const cat of insertedCategories) {
      console.log(`  - ${cat.name} (${cat.slug})`)
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
