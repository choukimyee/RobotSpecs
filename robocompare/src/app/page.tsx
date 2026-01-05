import { Suspense } from 'react'
import Link from 'next/link'
import { 
  Bot, 
  Dog, 
  Hand, 
  Scissors, 
  Cog, 
  Sparkles,
  ArrowRight,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react'
import { Header, Footer } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import dbConnect from '@/lib/db'
import { Category, Product } from '@/models'

// 获取品类数据
async function getCategories() {
  try {
    await dbConnect()
    const categories = await Category.find({ isActive: true }).sort({ order: 1 }).lean()
    return JSON.parse(JSON.stringify(categories))
  } catch {
    return []
  }
}

// 获取热门产品
async function getFeaturedProducts() {
  try {
    await dbConnect()
    const products = await Product.find({ status: 'published' })
      .sort({ viewCount: -1 })
      .limit(4)
      .lean()
    return JSON.parse(JSON.stringify(products))
  } catch {
    return []
  }
}

// 品类图标映射
const categoryIcons: Record<string, React.ReactNode> = {
  humanoid: <Bot className="h-8 w-8" />,
  quadruped: <Dog className="h-8 w-8" />,
  'dexterous-hand': <Hand className="h-8 w-8" />,
  'lawn-mower': <Scissors className="h-8 w-8" />,
  'robotic-arm': <Cog className="h-8 w-8" />,
  vacuum: <Sparkles className="h-8 w-8" />,
}

export default async function HomePage() {
  const [categories, featuredProducts] = await Promise.all([
    getCategories(),
    getFeaturedProducts(),
  ])

  return (
    <div className="flex min-h-screen flex-col">
      <Header categories={categories} />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-900">
          <div className="absolute inset-0 bg-grid-gray-100/50 dark:bg-grid-gray-800/20" />
          <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
                <span className="block">机器人产品</span>
                <span className="block text-primary-500">参数对比平台</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
                专业的机器人产品参数对比平台，帮助您快速了解和比较不同品牌、型号机器人的详细规格，做出明智的选择。
              </p>
              <div className="mt-10 flex items-center justify-center gap-4">
                <Button size="lg" asChild>
                  <Link href="#categories">
                    开始探索
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/compare">产品对比</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-y border-gray-100 bg-white py-12 dark:border-gray-800 dark:bg-gray-900">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              <div className="text-center">
                <div className="flex justify-center">
                  <Bot className="h-8 w-8 text-primary-500" />
                </div>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {categories.length || 6}+
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">产品品类</p>
              </div>
              <div className="text-center">
                <div className="flex justify-center">
                  <TrendingUp className="h-8 w-8 text-primary-500" />
                </div>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">100+</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">收录产品</p>
              </div>
              <div className="text-center">
                <div className="flex justify-center">
                  <Users className="h-8 w-8 text-primary-500" />
                </div>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">1000+</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">用户使用</p>
              </div>
              <div className="text-center">
                <div className="flex justify-center">
                  <Zap className="h-8 w-8 text-primary-500" />
                </div>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">50+</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">参数维度</p>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section id="categories" className="py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                产品品类
              </h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                浏览不同类型的机器人产品
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Suspense fallback={<CategorySkeleton />}>
                {categories.length > 0 ? (
                  categories.map((category: {
                    _id: string
                    slug: string
                    icon: string
                    name: string
                    description?: string
                    productCount: number
                  }) => (
                    <Link key={category._id} href={`/category/${category.slug}`}>
                      <Card className="group h-full cursor-pointer transition-all hover:-translate-y-1 hover:shadow-medium">
                        <CardContent className="flex flex-col items-center p-8 text-center">
                          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-500 transition-colors group-hover:bg-primary-100 dark:bg-primary-900/20">
                            {categoryIcons[category.slug] || (
                              <span className="text-3xl">{category.icon}</span>
                            )}
                          </div>
                          <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                            {category.name}
                          </h3>
                          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            {category.description || '探索该品类下的机器人产品'}
                          </p>
                          <p className="mt-4 text-sm font-medium text-primary-500">
                            {category.productCount} 个产品
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))
                ) : (
                  // 默认显示的品类卡片
                  <>
                    <Link href="/category/humanoid">
                      <Card className="group h-full cursor-pointer transition-all hover:-translate-y-1 hover:shadow-medium">
                        <CardContent className="flex flex-col items-center p-8 text-center">
                          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-500 transition-colors group-hover:bg-primary-100 dark:bg-primary-900/20">
                            <Bot className="h-8 w-8" />
                          </div>
                          <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                            人形机器人
                          </h3>
                          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            双足直立行走的类人机器人
                          </p>
                          <p className="mt-4 text-sm font-medium text-primary-500">
                            0 个产品
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                    <Link href="/category/quadruped">
                      <Card className="group h-full cursor-pointer transition-all hover:-translate-y-1 hover:shadow-medium">
                        <CardContent className="flex flex-col items-center p-8 text-center">
                          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-500 transition-colors group-hover:bg-primary-100 dark:bg-primary-900/20">
                            <Dog className="h-8 w-8" />
                          </div>
                          <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                            四足机器狗
                          </h3>
                          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            四足行走的仿生机器人
                          </p>
                          <p className="mt-4 text-sm font-medium text-primary-500">
                            0 个产品
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                    <Link href="/category/dexterous-hand">
                      <Card className="group h-full cursor-pointer transition-all hover:-translate-y-1 hover:shadow-medium">
                        <CardContent className="flex flex-col items-center p-8 text-center">
                          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-500 transition-colors group-hover:bg-primary-100 dark:bg-primary-900/20">
                            <Hand className="h-8 w-8" />
                          </div>
                          <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                            灵巧手
                          </h3>
                          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            高自由度仿人机械手
                          </p>
                          <p className="mt-4 text-sm font-medium text-primary-500">
                            0 个产品
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  </>
                )}
              </Suspense>
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        {featuredProducts.length > 0 && (
          <section className="bg-gray-50 py-16 dark:bg-gray-800/50 lg:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                    热门产品
                  </h2>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">
                    最受关注的机器人产品
                  </p>
                </div>
                <Button variant="outline" asChild>
                  <Link href="/products">
                    查看全部
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {featuredProducts.map((product: {
                  _id: string
                  slug: string
                  mainImage?: string
                  name: string
                  brand: string
                  model: string
                  price?: number
                }) => (
                  <Link key={product._id} href={`/product/${product.slug}`}>
                    <Card className="group h-full cursor-pointer overflow-hidden transition-all hover:-translate-y-1 hover:shadow-medium">
                      <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
                        {product.mainImage ? (
                          <img
                            src={product.mainImage}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Bot className="h-16 w-16 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <p className="text-xs text-gray-500">{product.brand}</p>
                        <h3 className="mt-1 font-semibold text-gray-900 dark:text-white">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-500">{product.model}</p>
                        {product.price && (
                          <p className="mt-2 font-medium text-primary-500">
                            ¥{product.price.toLocaleString()}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-3xl bg-primary-500">
              <div className="px-6 py-12 text-center sm:px-12 lg:py-16">
                <h2 className="text-3xl font-bold text-white">
                  开始对比您感兴趣的机器人
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-100">
                  选择多个产品，一键生成详细的参数对比表，快速找到最适合您需求的机器人。
                </p>
                <div className="mt-8">
                  <Button size="lg" variant="secondary" asChild>
                    <Link href="/compare">
                      开始对比
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

function CategorySkeleton() {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <Card key={i} className="h-full">
          <CardContent className="flex flex-col items-center p-8">
            <div className="h-16 w-16 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-700" />
            <div className="mt-4 h-6 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="mt-2 h-4 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          </CardContent>
        </Card>
      ))}
    </>
  )
}
