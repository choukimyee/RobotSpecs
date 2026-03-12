import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Bot, ArrowLeft, Share2 } from 'lucide-react'
import { Header, Footer } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import dbConnect from '@/lib/db'
import { CompareShare, Product, Category, Template } from '@/models'
import { getBestValue } from '@/lib/utils'

interface PageProps {
  params: Promise<{ id: string }>
}

async function getShareData(shareId: string) {
  await dbConnect()
  
  const share = await CompareShare.findOne({ shareId }).lean()
  if (!share) return null
  
  // 检查是否过期
  if (share.expiresAt && new Date(share.expiresAt) < new Date()) {
    return null
  }
  
  const [products, category, template] = await Promise.all([
    Product.find({ _id: { $in: share.productIds } }).lean(),
    Category.findById(share.categoryId).lean(),
    Template.findOne({ categoryId: share.categoryId }).lean(),
  ])
  
  // 增加查看次数
  await CompareShare.findByIdAndUpdate(share._id, { $inc: { viewCount: 1 } })
  
  return {
    share: JSON.parse(JSON.stringify(share)),
    products: JSON.parse(JSON.stringify(products)),
    category: category ? JSON.parse(JSON.stringify(category)) : null,
    template: template ? JSON.parse(JSON.stringify(template)) : null,
  }
}

async function getAllCategories() {
  await dbConnect()
  const categories = await Category.find({ isActive: true }).sort({ order: 1 }).lean()
  return JSON.parse(JSON.stringify(categories))
}

export default async function SharePage({ params }: PageProps) {
  const { id } = await params
  
  const [data, categories] = await Promise.all([
    getShareData(id),
    getAllCategories(),
  ])
  
  if (!data) {
    notFound()
  }
  
  const { share, products, category, template } = data
  
  const getParamValue = (product: { params?: Array<{ fieldKey: string; value: unknown }> }, fieldKey: string) => {
    const param = product.params?.find((p) => p.fieldKey === fieldKey)
    return param?.value
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header categories={categories} />
      
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        {/* 头部 */}
        <div className="border-b border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" asChild>
                  <Link href={category ? `/category/${category.slug}` : '/'}>
                    <ArrowLeft className="h-5 w-5" />
                  </Link>
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {share.title || '产品对比'}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {category?.name} · {products.length} 个产品 · 已被查看 {share.viewCount} 次
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={() => {
                  navigator.clipboard.writeText(window.location.href)
                }}>
                  <Share2 className="mr-2 h-4 w-4" />
                  复制链接
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 对比表格 */}
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
            <table className="w-full min-w-max">
              {/* 产品头部 */}
              <thead>
                <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                  <th className="sticky left-0 z-10 min-w-48 bg-gray-50 p-4 text-left dark:bg-gray-800">
                    <span className="text-gray-500">对比项目</span>
                  </th>
                  {products.map((product: { _id: string; slug: string; mainImage?: string; brand: string; name: string; price?: number }) => (
                    <th key={product._id} className="min-w-56 p-4">
                      <Link href={`/product/${product.slug}`} className="block">
                        <div className="mx-auto mb-3 h-32 w-32 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-700">
                          {product.mainImage ? (
                            <img
                              src={product.mainImage}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <Bot className="h-12 w-12 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">{product.brand}</p>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {product.name}
                        </h3>
                        {product.price && (
                          <p className="mt-1 font-medium text-primary-500">
                            ¥{product.price.toLocaleString()}
                          </p>
                        )}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {template?.groups?.map((group: { key: string; name: string; fields: Array<{ key: string; name: string; unit?: string; compareRule: 'higher_better' | 'lower_better' | 'none' }> }) => (
                  <>
                    {/* 分组标题 */}
                    <tr
                      key={group.key}
                      className="bg-gray-100 dark:bg-gray-800"
                    >
                      <td
                        colSpan={products.length + 1}
                        className="sticky left-0 z-10 bg-gray-100 p-3 dark:bg-gray-800"
                      >
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {group.name}
                        </span>
                      </td>
                    </tr>

                    {/* 参数行 */}
                    {group.fields.map((field) => {
                      const values = products.map((p: { params?: Array<{ fieldKey: string; value: unknown }> }) => {
                        const val = getParamValue(p, field.key)
                        return typeof val === 'number' ? val : null
                      })
                      const bestValue = getBestValue(values, field.compareRule)

                      return (
                        <tr key={field.key} className="border-b border-gray-100 dark:border-gray-800">
                          <td className="sticky left-0 z-10 bg-white p-4 dark:bg-gray-900">
                            <div className="flex items-center">
                              <span className="text-gray-700 dark:text-gray-300">
                                {field.name}
                              </span>
                              {field.unit && (
                                <span className="ml-1 text-xs text-gray-400">
                                  ({field.unit})
                                </span>
                              )}
                            </div>
                          </td>
                          {products.map((product: { _id: string; params?: Array<{ fieldKey: string; value: unknown }> }) => {
                            const value = getParamValue(product, field.key)
                            const numValue = typeof value === 'number' ? value : null
                            const isBest = bestValue !== null && numValue === bestValue

                            return (
                              <td
                                key={product._id}
                                className={`p-4 text-center ${
                                  isBest && field.compareRule !== 'none'
                                    ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                    : ''
                                }`}
                              >
                                {value !== null && value !== undefined ? (
                                  <span className="font-medium">
                                    {Array.isArray(value) ? value.join(', ') : String(value)}
                                  </span>
                                ) : (
                                  <span className="text-gray-300">-</span>
                                )}
                                {isBest && field.compareRule !== 'none' && (
                                  <Badge variant="success" className="ml-2">
                                    最优
                                  </Badge>
                                )}
                              </td>
                            )
                          })}
                        </tr>
                      )
                    })}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
