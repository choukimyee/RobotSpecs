import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { Product, Template } from '@/models'
import Papa from 'papaparse'

// GET /api/export - 导出产品数据为 CSV
export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    const searchParams = request.nextUrl.searchParams
    const categoryId = searchParams.get('categoryId')
    const productIds = searchParams.get('productIds')?.split(',')
    
    // 构建筛选条件
    const filter: Record<string, unknown> = {}
    
    if (productIds && productIds.length > 0) {
      filter._id = { $in: productIds }
    } else if (categoryId) {
      filter.categoryId = categoryId
    }
    
    // 获取产品
    const products = await Product.find(filter).lean()
    
    if (products.length === 0) {
      return NextResponse.json(
        { success: false, error: '没有可导出的产品' },
        { status: 404 }
      )
    }
    
    // 获取模板（如果有 categoryId）
    let template = null
    if (categoryId) {
      template = await Template.findOne({ categoryId }).lean()
    }
    
    // 构建 CSV 数据
    const csvData = products.map(product => {
      const row: Record<string, string | number> = {
        name: product.name,
        nameEn: product.nameEn || '',
        brand: product.brand,
        model: product.model,
        mainImage: product.mainImage || '',
        price: product.price || '',
        priceUnit: product.priceUnit || 'CNY',
        releaseDate: product.releaseDate ? new Date(product.releaseDate).toISOString().split('T')[0] : '',
        sourceUrl: product.sourceUrl || '',
        status: product.status,
      }
      
      // 添加参数
      if (product.params && Array.isArray(product.params)) {
        for (const param of product.params) {
          row[param.fieldKey] = Array.isArray(param.value) ? param.value.join(', ') : param.value || ''
        }
      }
      
      return row
    })
    
    // 生成 CSV
    const csv = Papa.unparse(csvData)
    
    // 添加 BOM 以支持 Excel 打开中文
    const bom = '\uFEFF'
    const csvWithBom = bom + csv
    
    // 返回 CSV 文件
    return new NextResponse(csvWithBom, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="products_${Date.now()}.csv"`,
      },
    })
  } catch (error) {
    console.error('Error exporting CSV:', error)
    return NextResponse.json(
      { success: false, error: '导出失败' },
      { status: 500 }
    )
  }
}
