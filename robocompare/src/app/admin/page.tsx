import { FolderTree, Package, Users, Eye } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import dbConnect from '@/lib/db'
import { Category, Product, User } from '@/models'

async function getStats() {
  try {
    await dbConnect()
    
    const [categoryCount, productCount, userCount, totalViews] = await Promise.all([
      Category.countDocuments(),
      Product.countDocuments(),
      User.countDocuments(),
      Product.aggregate([{ $group: { _id: null, total: { $sum: '$viewCount' } } }]),
    ])
    
    return {
      categories: categoryCount,
      products: productCount,
      users: userCount,
      views: totalViews[0]?.total || 0,
    }
  } catch {
    return { categories: 0, products: 0, users: 0, views: 0 }
  }
}

async function getRecentProducts() {
  try {
    await dbConnect()
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean()
    return JSON.parse(JSON.stringify(products))
  } catch {
    return []
  }
}

export default async function AdminDashboard() {
  const [stats, recentProducts] = await Promise.all([
    getStats(),
    getRecentProducts(),
  ])

  const statCards = [
    { title: '品类数量', value: stats.categories, icon: FolderTree, color: 'text-blue-500' },
    { title: '产品数量', value: stats.products, icon: Package, color: 'text-green-500' },
    { title: '用户数量', value: stats.users, icon: Users, color: 'text-purple-500' },
    { title: '总浏览量', value: stats.views, icon: Eye, color: 'text-orange-500' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">仪表盘</h1>

      {/* 统计卡片 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 最近添加的产品 */}
      <Card>
        <CardHeader>
          <CardTitle>最近添加的产品</CardTitle>
        </CardHeader>
        <CardContent>
          {recentProducts.length > 0 ? (
            <div className="space-y-4">
              {recentProducts.map((product: {
                _id: string
                name: string
                brand: string
                model: string
                status: string
                createdAt: string
              }) => (
                <div
                  key={product._id}
                  className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0 dark:border-gray-800"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {product.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {product.brand} · {product.model}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs ${
                        product.status === 'published'
                          ? 'bg-green-100 text-green-700'
                          : product.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {product.status === 'published' ? '已发布' : product.status === 'pending' ? '待审核' : '草稿'}
                    </span>
                    <p className="mt-1 text-xs text-gray-400">
                      {new Date(product.createdAt).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">暂无产品</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
