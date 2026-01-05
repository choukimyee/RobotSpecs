import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { CompareShare, Product, Category } from '@/models'
import { generateShareId } from '@/lib/utils'

// POST /api/compare/share - 创建分享链接
export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const body = await request.json()
    const { productIds, title, expiresIn } = body
    
    if (!productIds || !Array.isArray(productIds) || productIds.length < 2) {
      return NextResponse.json(
        { success: false, error: '请至少选择2个产品' },
        { status: 400 }
      )
    }
    
    // 获取产品确认品类
    const products = await Product.find({ _id: { $in: productIds } }).lean()
    if (products.length < 2) {
      return NextResponse.json(
        { success: false, error: '有效产品数量不足' },
        { status: 400 }
      )
    }
    
    const categoryId = products[0].categoryId
    
    // 生成唯一的分享 ID
    let shareId = generateShareId()
    while (await CompareShare.findOne({ shareId })) {
      shareId = generateShareId()
    }
    
    // 计算过期时间
    let expiresAt: Date | undefined
    if (expiresIn && expiresIn > 0) {
      expiresAt = new Date(Date.now() + expiresIn * 1000) // expiresIn 为秒数
    }
    
    const share = await CompareShare.create({
      shareId,
      categoryId,
      productIds,
      title,
      viewCount: 0,
      expiresAt,
    })
    
    return NextResponse.json({
      success: true,
      data: {
        shareId: share.shareId,
        url: `/share/${share.shareId}`,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating share:', error)
    return NextResponse.json(
      { success: false, error: '创建分享链接失败' },
      { status: 500 }
    )
  }
}

// GET /api/compare/share?id=xxx - 获取分享数据
export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    const searchParams = request.nextUrl.searchParams
    const shareId = searchParams.get('id')
    
    if (!shareId) {
      return NextResponse.json(
        { success: false, error: '缺少分享ID' },
        { status: 400 }
      )
    }
    
    const share = await CompareShare.findOne({ shareId }).lean()
    
    if (!share) {
      return NextResponse.json(
        { success: false, error: '分享链接不存在或已过期' },
        { status: 404 }
      )
    }
    
    // 检查是否过期
    if (share.expiresAt && new Date(share.expiresAt) < new Date()) {
      return NextResponse.json(
        { success: false, error: '分享链接已过期' },
        { status: 410 }
      )
    }
    
    // 获取产品和品类数据
    const [products, category] = await Promise.all([
      Product.find({ _id: { $in: share.productIds } }).lean(),
      Category.findById(share.categoryId).lean(),
    ])
    
    // 增加查看次数
    await CompareShare.findByIdAndUpdate(share._id, { $inc: { viewCount: 1 } })
    
    return NextResponse.json({
      success: true,
      data: {
        share,
        products,
        category,
      },
    })
  } catch (error) {
    console.error('Error fetching share:', error)
    return NextResponse.json(
      { success: false, error: '获取分享数据失败' },
      { status: 500 }
    )
  }
}
