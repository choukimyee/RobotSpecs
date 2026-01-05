import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { Product, Category } from '@/models'

// POST /api/products/transfer - 批量转移产品到其他品类
export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const body = await request.json()
    const { productIds, targetCategoryId } = body
    
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { success: false, error: '请选择要转移的产品' },
        { status: 400 }
      )
    }
    
    if (!targetCategoryId) {
      return NextResponse.json(
        { success: false, error: '请选择目标品类' },
        { status: 400 }
      )
    }
    
    // 检查目标品类是否存在
    const targetCategory = await Category.findById(targetCategoryId)
    if (!targetCategory) {
      return NextResponse.json(
        { success: false, error: '目标品类不存在' },
        { status: 404 }
      )
    }
    
    // 获取需要转移的产品
    const products = await Product.find({ _id: { $in: productIds } })
    
    if (products.length === 0) {
      return NextResponse.json(
        { success: false, error: '未找到要转移的产品' },
        { status: 404 }
      )
    }
    
    // 统计每个源品类的产品数量
    const sourceCategoryCounts: Record<string, number> = {}
    for (const product of products) {
      const sourceId = product.categoryId
      if (sourceId !== targetCategoryId) {
        sourceCategoryCounts[sourceId] = (sourceCategoryCounts[sourceId] || 0) + 1
      }
    }
    
    // 执行转移
    const result = await Product.updateMany(
      { _id: { $in: productIds }, categoryId: { $ne: targetCategoryId } },
      { $set: { categoryId: targetCategoryId } }
    )
    
    // 更新品类的产品数量
    for (const [sourceId, count] of Object.entries(sourceCategoryCounts)) {
      await Category.findByIdAndUpdate(sourceId, { $inc: { productCount: -count } })
    }
    
    // 更新目标品类的产品数量
    const transferredCount = Object.values(sourceCategoryCounts).reduce((a, b) => a + b, 0)
    await Category.findByIdAndUpdate(targetCategoryId, { $inc: { productCount: transferredCount } })
    
    return NextResponse.json({
      success: true,
      message: `成功转移 ${result.modifiedCount} 个产品`,
      data: {
        modifiedCount: result.modifiedCount,
      },
    })
  } catch (error) {
    console.error('Error transferring products:', error)
    return NextResponse.json(
      { success: false, error: '转移产品失败' },
      { status: 500 }
    )
  }
}
