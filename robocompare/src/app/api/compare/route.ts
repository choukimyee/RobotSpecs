import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { Product, Template, Category } from '@/models'

// POST /api/compare - 获取对比数据
export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const body = await request.json()
    const { productIds } = body
    
    if (!productIds || !Array.isArray(productIds) || productIds.length < 2) {
      return NextResponse.json(
        { success: false, error: '请至少选择2个产品进行对比' },
        { status: 400 }
      )
    }
    
    if (productIds.length > 10) {
      return NextResponse.json(
        { success: false, error: '最多只能对比10个产品' },
        { status: 400 }
      )
    }
    
    // 获取产品数据
    const products = await Product.find({
      _id: { $in: productIds },
      status: 'published',
    }).lean()
    
    if (products.length < 2) {
      return NextResponse.json(
        { success: false, error: '有效产品数量不足' },
        { status: 400 }
      )
    }
    
    // 检查是否是同一品类
    const categoryIds = [...new Set(products.map(p => p.categoryId))]
    if (categoryIds.length > 1) {
      return NextResponse.json(
        { success: false, error: '只能对比同一品类的产品' },
        { status: 400 }
      )
    }
    
    // 获取品类和模板
    const categoryId = categoryIds[0]
    const [category, template] = await Promise.all([
      Category.findById(categoryId).lean(),
      Template.findOne({ categoryId }).lean(),
    ])
    
    // 增加对比次数
    await Product.updateMany(
      { _id: { $in: productIds } },
      { $inc: { compareCount: 1 } }
    )
    
    // 按照请求的顺序排序产品
    const sortedProducts = productIds
      .map(id => products.find(p => p._id.toString() === id))
      .filter(Boolean)
    
    return NextResponse.json({
      success: true,
      data: {
        category,
        template,
        products: sortedProducts,
      },
    })
  } catch (error) {
    console.error('Error fetching compare data:', error)
    return NextResponse.json(
      { success: false, error: '获取对比数据失败' },
      { status: 500 }
    )
  }
}
