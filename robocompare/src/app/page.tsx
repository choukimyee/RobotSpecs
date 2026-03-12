import { redirect } from 'next/navigation'
import dbConnect from '@/lib/db'
import { Category } from '@/models'

// 首页重定向到第一个品类的对比页面
async function getFirstCategory() {
  try {
    await dbConnect()
    const category = await Category.findOne({ isActive: true }).sort({ order: 1 }).lean()
    return category ? (category as { slug: string }).slug : null
  } catch {
    return null
  }
}

export default async function HomePage() {
  const firstCategorySlug = await getFirstCategory()
  
  if (firstCategorySlug) {
    redirect(`/compare/${firstCategorySlug}`)
  }
  
  // 如果没有品类，显示欢迎页面
  redirect('/welcome')
}
