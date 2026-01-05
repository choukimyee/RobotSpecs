import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Locale = 'zh' | 'en'

interface LocaleState {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (zh: string, en: string) => string
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set, get) => ({
      locale: 'zh',

      setLocale: (locale: Locale) => {
        set({ locale })
      },

      t: (zh: string, en: string) => {
        return get().locale === 'zh' ? zh : en
      },
    }),
    {
      name: 'robocompare-locale',
    }
  )
)

// 通用翻译函数
export const translations = {
  // 导航
  nav: {
    home: { zh: '首页', en: 'Home' },
    categories: { zh: '品类', en: 'Categories' },
    compare: { zh: '对比', en: 'Compare' },
    admin: { zh: '管理', en: 'Admin' },
    login: { zh: '登录', en: 'Login' },
    register: { zh: '注册', en: 'Register' },
    logout: { zh: '退出', en: 'Logout' },
    profile: { zh: '个人中心', en: 'Profile' },
    favorites: { zh: '我的收藏', en: 'Favorites' },
  },
  // 品类
  category: {
    humanoid: { zh: '人形机器人', en: 'Humanoid Robot' },
    quadruped: { zh: '四足机器狗', en: 'Quadruped Robot' },
    dexterous_hand: { zh: '灵巧手', en: 'Dexterous Hand' },
    lawn_mower: { zh: '割草机器人', en: 'Lawn Mower Robot' },
    robotic_arm: { zh: '机械臂', en: 'Robotic Arm' },
    vacuum: { zh: '扫地机器人', en: 'Vacuum Robot' },
  },
  // 通用
  common: {
    search: { zh: '搜索', en: 'Search' },
    filter: { zh: '筛选', en: 'Filter' },
    sort: { zh: '排序', en: 'Sort' },
    price: { zh: '价格', en: 'Price' },
    brand: { zh: '品牌', en: 'Brand' },
    model: { zh: '型号', en: 'Model' },
    releaseDate: { zh: '发布日期', en: 'Release Date' },
    save: { zh: '保存', en: 'Save' },
    cancel: { zh: '取消', en: 'Cancel' },
    delete: { zh: '删除', en: 'Delete' },
    edit: { zh: '编辑', en: 'Edit' },
    add: { zh: '添加', en: 'Add' },
    confirm: { zh: '确认', en: 'Confirm' },
    loading: { zh: '加载中...', en: 'Loading...' },
    noData: { zh: '暂无数据', en: 'No data' },
    viewAll: { zh: '查看全部', en: 'View All' },
    products: { zh: '个产品', en: 'products' },
    compare: { zh: '对比', en: 'Compare' },
    addToCompare: { zh: '加入对比', en: 'Add to Compare' },
    removeFromCompare: { zh: '移除对比', en: 'Remove' },
    startCompare: { zh: '开始对比', en: 'Start Compare' },
    share: { zh: '分享', en: 'Share' },
    copyLink: { zh: '复制链接', en: 'Copy Link' },
  },
  // 对比
  compare: {
    title: { zh: '产品对比', en: 'Product Comparison' },
    selectProducts: { zh: '请选择 2-10 个产品进行对比', en: 'Select 2-10 products to compare' },
    showDiffOnly: { zh: '只显示差异项', en: 'Show differences only' },
    bestValue: { zh: '最优', en: 'Best' },
    noValue: { zh: '-', en: '-' },
  },
  // 管理
  admin: {
    dashboard: { zh: '仪表盘', en: 'Dashboard' },
    categories: { zh: '品类管理', en: 'Category Management' },
    templates: { zh: '模板管理', en: 'Template Management' },
    products: { zh: '产品管理', en: 'Product Management' },
    users: { zh: '用户管理', en: 'User Management' },
    import: { zh: '数据导入', en: 'Import Data' },
    export: { zh: '数据导出', en: 'Export Data' },
  },
}
