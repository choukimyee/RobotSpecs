import { Suspense } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Bot, Plus, Check, ArrowUpDown, Filter } from 'lucide-react'
import { Header, Footer } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import dbConnect from '@/lib/db'
import { Category, Product } from '@/models'
import { ProductCard } from '@/components/ProductCard'

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string; brand?: string; sort?: string }>
}

async function getCategoryData(slug: string) {
  await dbConnect()
  const category = await Category.findOne({ slug, isActive: true }).lean()
  return category ? JSON.parse(JSON.stringify(category)) : null
}

async function getProducts(
  categoryId: string,
  page: number = 1,
  pageSize: number = 20,
  brand?: string,
  sort: string = 'createdAt'
) {
  await dbConnect()

  const filter: Record<string, unknown> = {
    categoryId,
    status: 'published',
  }

  if (brand) {
    filter.brand = brand
  }

  const sortOrder: Record<string, 1 | -1> = {}
  switch (sort) {
    case 'price_asc':
      sortOrder.price = 1
      break
    case 'price_desc':
      sortOrder.price = -1
      break
    case 'popular':
      sortOrder.viewCount = -1
      break
    default:
      sortOrder.createdAt = -1
  }

  const skip = (page - 1) * pageSize

  const [products, total, brands] = await Promise.all([
    Product.find(filter).sort(sortOrder).skip(skip).limit(pageSize).lean(),
    Product.countDocuments(filter),
    Product.distinct('brand', { categoryId, status: 'published' }),
  ])

  return {
    products: JSON.parse(JSON.stringify(products)),
    total,
    totalPages: Math.ceil(total / pageSize),
    brands,
  }
}

async function getAllCategories() {
  await dbConnect()
  const categories = await Category.find({ isActive: true }).sort({ order: 1 }).lean()
  return JSON.parse(JSON.stringify(categories))
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { page, brand, sort } = await searchParams

  const [category, categories] = await Promise.all([
    getCategoryData(slug),
    getAllCategories(),
  ])

  if (!category) {
    notFound()
  }

  const currentPage = parseInt(page || '1')
  const { products, total, totalPages, brands } = await getProducts(
    category._id,
    currentPage,
    20,
    brand,
    sort || 'createdAt'
  )

  return (
    <div className="flex min-h-screen flex-col">
      <Header categories={categories} />

      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        {/* 页面头部 */}
        <div className="border-b border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-3xl dark:bg-primary-900/20">
                {category.icon}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {category.name}
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                  {category.description || `共 ${total} 个产品`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 筛选和排序 */}
        <div className="border-b border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* 品牌筛选 */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-500">
                  <Filter className="mr-1 inline h-4 w-4" />
                  品牌:
                </span>
                <Link
                  href={`/category/${slug}${sort ? `?sort=${sort}` : ''}`}
                  className={`rounded-full px-3 py-1 text-sm transition-colors ${
                    !brand
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
                  }`}
                >
                  全部
                </Link>
                {brands.map((b: string) => (
                  <Link
                    key={b}
                    href={`/category/${slug}?brand=${b}${sort ? `&sort=${sort}` : ''}`}
                    className={`rounded-full px-3 py-1 text-sm transition-colors ${
                      brand === b
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
                    }`}
                  >
                    {b}
                  </Link>
                ))}
              </div>

              {/* 排序 */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  <ArrowUpDown className="mr-1 inline h-4 w-4" />
                  排序:
                </span>
                <Link
                  href={`/category/${slug}?sort=createdAt${brand ? `&brand=${brand}` : ''}`}
                  className={`rounded-full px-3 py-1 text-sm transition-colors ${
                    !sort || sort === 'createdAt'
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
                  }`}
                >
                  最新
                </Link>
                <Link
                  href={`/category/${slug}?sort=popular${brand ? `&brand=${brand}` : ''}`}
                  className={`rounded-full px-3 py-1 text-sm transition-colors ${
                    sort === 'popular'
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
                  }`}
                >
                  热门
                </Link>
                <Link
                  href={`/category/${slug}?sort=price_asc${brand ? `&brand=${brand}` : ''}`}
                  className={`rounded-full px-3 py-1 text-sm transition-colors ${
                    sort === 'price_asc'
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
                  }`}
                >
                  价格↑
                </Link>
                <Link
                  href={`/category/${slug}?sort=price_desc${brand ? `&brand=${brand}` : ''}`}
                  className={`rounded-full px-3 py-1 text-sm transition-colors ${
                    sort === 'price_desc'
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
                  }`}
                >
                  价格↓
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 产品列表 */}
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Suspense fallback={<ProductGridSkeleton />}>
            {products.length > 0 ? (
              <>
                <div className="product-grid">
                  {products.map((product: {
                    _id: string
                    slug: string
                    mainImage?: string
                    name: string
                    brand: string
                    model: string
                    price?: number
                    categoryId: string
                  }) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      categoryId={category._id}
                    />
                  ))}
                </div>

                {/* 分页 */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <nav className="flex items-center space-x-2">
                      {currentPage > 1 && (
                        <Link
                          href={`/category/${slug}?page=${currentPage - 1}${brand ? `&brand=${brand}` : ''}${sort ? `&sort=${sort}` : ''}`}
                          className="rounded-lg border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                        >
                          上一页
                        </Link>
                      )}
                      <span className="px-4 py-2 text-sm text-gray-500">
                        第 {currentPage} / {totalPages} 页
                      </span>
                      {currentPage < totalPages && (
                        <Link
                          href={`/category/${slug}?page=${currentPage + 1}${brand ? `&brand=${brand}` : ''}${sort ? `&sort=${sort}` : ''}`}
                          className="rounded-lg border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                        >
                          下一页
                        </Link>
                      )}
                    </nav>
                  </div>
                )}
              </>
            ) : (
              <div className="py-24 text-center">
                <Bot className="mx-auto h-16 w-16 text-gray-300" />
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                  暂无产品
                </h3>
                <p className="mt-2 text-gray-500">
                  该品类下还没有收录产品
                </p>
              </div>
            )}
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  )
}

function ProductGridSkeleton() {
  return (
    <div className="product-grid">
      {[...Array(8)].map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <div className="aspect-square animate-pulse bg-gray-200 dark:bg-gray-700" />
          <CardContent className="p-4">
            <div className="h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="mt-2 h-5 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="mt-1 h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
