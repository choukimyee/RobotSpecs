import { notFound } from 'next/navigation'
import Link from 'next/link'
import { 
  Bot, 
  ArrowLeft, 
  Plus, 
  Check, 
  ExternalLink, 
  Calendar, 
  Tag,
  ChevronRight
} from 'lucide-react'
import { Header, Footer } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import dbConnect from '@/lib/db'
import { Product, Category, Template } from '@/models'
import { AddToCompareButton } from '@/components/AddToCompareButton'

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getProductData(slug: string) {
  await dbConnect()
  
  const product = await Product.findOne({ slug, status: 'published' }).lean()
  if (!product) return null
  
  // 增加浏览次数
  await Product.findByIdAndUpdate(product._id, { $inc: { viewCount: 1 } })
  
  const [category, template, relatedProducts] = await Promise.all([
    Category.findById(product.categoryId).lean(),
    Template.findOne({ categoryId: product.categoryId }).lean(),
    Product.find({ 
      categoryId: product.categoryId, 
      status: 'published',
      _id: { $ne: product._id }
    }).limit(4).lean(),
  ])
  
  return {
    product: JSON.parse(JSON.stringify(product)),
    category: category ? JSON.parse(JSON.stringify(category)) : null,
    template: template ? JSON.parse(JSON.stringify(template)) : null,
    relatedProducts: JSON.parse(JSON.stringify(relatedProducts)),
  }
}

async function getAllCategories() {
  await dbConnect()
  const categories = await Category.find({ isActive: true }).sort({ order: 1 }).lean()
  return JSON.parse(JSON.stringify(categories))
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params
  
  const [data, categories] = await Promise.all([
    getProductData(slug),
    getAllCategories(),
  ])
  
  if (!data) {
    notFound()
  }
  
  const { product, category, template, relatedProducts } = data
  
  const getParamValue = (fieldKey: string) => {
    const param = product.params?.find((p: { fieldKey: string }) => p.fieldKey === fieldKey)
    return param?.value
  }
  
  const formatValue = (value: unknown, unit?: string) => {
    if (value === null || value === undefined) return '-'
    if (Array.isArray(value)) return value.join(', ')
    const strValue = String(value)
    return unit ? `${strValue} ${unit}` : strValue
  }

  // 获取所有图片
  const allImages = [
    product.mainImage,
    ...(product.images?.map((img: { url: string }) => img.url) || []),
  ].filter(Boolean)

  return (
    <div className="flex min-h-screen flex-col">
      <Header categories={categories} />
      
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        {/* 面包屑 */}
        <div className="border-b border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
            <nav className="flex items-center space-x-2 text-sm text-gray-500">
              <Link href="/" className="hover:text-gray-900 dark:hover:text-white">
                首页
              </Link>
              <ChevronRight className="h-4 w-4" />
              {category && (
                <>
                  <Link 
                    href={`/category/${category.slug}`} 
                    className="hover:text-gray-900 dark:hover:text-white"
                  >
                    {category.name}
                  </Link>
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
              <span className="text-gray-900 dark:text-white">{product.name}</span>
            </nav>
          </div>
        </div>

        {/* 产品概览 */}
        <div className="border-b border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-2">
              {/* 图片区 */}
              <div className="space-y-4">
                <div className="aspect-square overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800">
                  {product.mainImage ? (
                    <img
                      src={product.mainImage}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Bot className="h-32 w-32 text-gray-300" />
                    </div>
                  )}
                </div>
                {allImages.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {allImages.slice(0, 4).map((img: string, index: number) => (
                      <div
                        key={index}
                        className="aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800"
                      >
                        <img
                          src={img}
                          alt={`${product.name} - ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 信息区 */}
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-500">{product.brand}</p>
                  <h1 className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
                    {product.name}
                  </h1>
                  {product.nameEn && (
                    <p className="mt-1 text-lg text-gray-500">{product.nameEn}</p>
                  )}
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    型号: {product.model}
                  </p>
                </div>

                {product.price && (
                  <div>
                    <p className="text-3xl font-bold text-primary-500">
                      ¥{product.price.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">官方指导价</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {product.releaseDate && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(product.releaseDate).toLocaleDateString('zh-CN')}
                    </Badge>
                  )}
                  {category && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {category.name}
                    </Badge>
                  )}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <AddToCompareButton 
                    productId={product._id}
                    categoryId={product.categoryId}
                    productName={product.name}
                  />
                  {product.sourceUrl && (
                    <Button variant="outline" asChild>
                      <a href={product.sourceUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        查看官网
                      </a>
                    </Button>
                  )}
                </div>

                {/* 关键参数 */}
                {template && template.groups && template.groups.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">核心参数</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3">
                        {template.groups[0]?.fields?.slice(0, 6).map((field: { key: string; name: string; unit?: string }) => {
                          const value = getParamValue(field.key)
                          return (
                            <div key={field.key}>
                              <p className="text-xs text-gray-500">{field.name}</p>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {formatValue(value, field.unit)}
                              </p>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 详细参数 */}
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Tabs defaultValue="specs" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="specs">详细参数</TabsTrigger>
              <TabsTrigger value="images">产品图片</TabsTrigger>
            </TabsList>

            <TabsContent value="specs">
              <div className="space-y-6">
                {template?.groups?.map((group: { key: string; name: string; fields: Array<{ key: string; name: string; unit?: string }> }) => (
                  <Card key={group.key}>
                    <CardHeader>
                      <CardTitle className="text-lg">{group.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {group.fields.map((field) => {
                          const value = getParamValue(field.key)
                          return (
                            <div
                              key={field.key}
                              className="flex justify-between border-b border-gray-100 pb-2 dark:border-gray-800"
                            >
                              <span className="text-gray-500">{field.name}</span>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {formatValue(value, field.unit)}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {(!template || !template.groups || template.groups.length === 0) && (
                  <Card>
                    <CardContent className="py-12 text-center text-gray-500">
                      暂无详细参数
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="images">
              {allImages.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {allImages.map((img: string, index: number) => (
                    <div
                      key={index}
                      className="aspect-square overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800"
                    >
                      <img
                        src={img}
                        alt={`${product.name} - ${index + 1}`}
                        className="h-full w-full object-cover transition-transform hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center text-gray-500">
                    暂无产品图片
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* 相关产品 */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-gray-100 bg-white py-12 dark:border-gray-800 dark:bg-gray-900">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  相关产品
                </h2>
                {category && (
                  <Button variant="outline" asChild>
                    <Link href={`/category/${category.slug}`}>
                      查看更多
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>

              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {relatedProducts.map((related: {
                  _id: string
                  slug: string
                  mainImage?: string
                  name: string
                  brand: string
                  model: string
                  price?: number
                }) => (
                  <Link key={related._id} href={`/product/${related.slug}`}>
                    <Card className="group h-full cursor-pointer overflow-hidden transition-all hover:-translate-y-1 hover:shadow-medium">
                      <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
                        {related.mainImage ? (
                          <img
                            src={related.mainImage}
                            alt={related.name}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Bot className="h-12 w-12 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <p className="text-xs text-gray-500">{related.brand}</p>
                        <h3 className="mt-1 font-semibold text-gray-900 dark:text-white line-clamp-2">
                          {related.name}
                        </h3>
                        {related.price && (
                          <p className="mt-2 font-medium text-primary-500">
                            ¥{related.price.toLocaleString()}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
