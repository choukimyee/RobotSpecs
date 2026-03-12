import { redirect } from 'next/navigation'
import dbConnect from '@/lib/db'
import { Category } from '@/models'

// 管理页面重定向到第一个品类
async function getFirstCategory() {
  try {
    await dbConnect()
    const category = await Category.findOne({ isActive: true }).sort({ order: 1 }).lean()
    return category ? (category as { slug: string }).slug : null
  } catch {
    return null
  }
}

export default async function ManagePage() {
  const firstCategorySlug = await getFirstCategory()
  
  if (firstCategorySlug) {
    redirect(`/manage/${firstCategorySlug}`)
  }
  
  // 如果没有品类，跳转到管理后台
  redirect('/admin/categories')
}
