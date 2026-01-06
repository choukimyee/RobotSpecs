import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import dbConnect from '@/lib/db'
import { Category, Product, Template } from '@/models'
import { ManageLayout } from '@/components/manage/ManageLayout'
import { ManageCompareTable } from '@/components/manage/ManageCompareTable'
import { IProduct } from '@/types'

interface PageProps {
  params: Promise<{ category: string }>
}

async function getCategories() {
  await dbConnect()
  const categories = await Category.find({ isActive: true }).sort({ order: 1 }).lean()
  return JSON.parse(JSON.stringify(categories))
}

async function getCategoryBySlug(slug: string) {
  await dbConnect()
  const category = await Category.findOne({ slug, isActive: true }).lean()
  return category ? JSON.parse(JSON.stringify(category)) : null
}

async function getProductsByCategory(categoryId: string) {
  await dbConnect()
  const products = await Product.find({ 
    categoryId
  }).sort({ brand: 1, name: 1 }).lean()
  return JSON.parse(JSON.stringify(products))
}

async function getTemplateByCategory(categoryId: string) {
  await dbConnect()
  const template = await Template.findOne({ categoryId }).lean()
  return template ? JSON.parse(JSON.stringify(template)) : null
}

// 按品牌分组产品
function groupProductsByBrand(products: IProduct[]): Record<string, IProduct[]> {
  const grouped: Record<string, IProduct[]> = {}
  for (const product of products) {
    if (!grouped[product.brand]) {
      grouped[product.brand] = []
    }
    grouped[product.brand].push(product)
  }
  return grouped
}

export default async function ManageComparePage({ params }: PageProps) {
  const { category: categorySlug } = await params
  
  const [categories, currentCategory] = await Promise.all([
    getCategories(),
    getCategoryBySlug(categorySlug),
  ])
  
  if (!currentCategory) {
    notFound()
  }
  
  const [products, template] = await Promise.all([
    getProductsByCategory(currentCategory._id),
    getTemplateByCategory(currentCategory._id),
  ])
  
  const brandGroups = groupProductsByBrand(products)
  const brands = Object.keys(brandGroups).sort()

  return (
    <ManageLayout 
      categories={categories} 
      currentCategorySlug={categorySlug}
    >
      <Suspense fallback={<LoadingTable />}>
        <ManageCompareTable
          category={currentCategory}
          template={template}
          products={products}
          brands={brands}
          brandGroups={brandGroups}
        />
      </Suspense>
    </ManageLayout>
  )
}

function LoadingTable() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary-500" />
    </div>
  )
}
