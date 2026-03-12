import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { Product, Category } from '@/models'
import { slugify } from '@/lib/utils'
import Papa from 'papaparse'

// POST /api/import - 导入 CSV 数据
export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    const categoryId = formData.get('categoryId') as string
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: '请上传CSV文件' },
        { status: 400 }
      )
    }
    
    if (!categoryId) {
      return NextResponse.json(
        { success: false, error: '请选择品类' },
        { status: 400 }
      )
    }
    
    // 验证品类
    const category = await Category.findById(categoryId)
    if (!category) {
      return NextResponse.json(
        { success: false, error: '品类不存在' },
        { status: 404 }
      )
    }
    
    // 读取文件内容
    const text = await file.text()
    
    // 解析 CSV
    const parseResult = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
    })
    
    if (parseResult.errors.length > 0) {
      return NextResponse.json(
        { success: false, error: `CSV解析错误: ${parseResult.errors[0].message}` },
        { status: 400 }
      )
    }
    
    const rows = parseResult.data as Record<string, string>[]
    
    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'CSV文件为空' },
        { status: 400 }
      )
    }
    
    // 必需字段
    const requiredFields = ['name', 'brand', 'model']
    const headers = Object.keys(rows[0])
    const missingFields = requiredFields.filter(f => !headers.includes(f))
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { success: false, error: `缺少必需列: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }
    
    // 处理每一行
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    }
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const rowNum = i + 2 // CSV 行号（加上表头）
      
      try {
        const { name, nameEn, brand, model, mainImage, price, priceUnit, releaseDate, sourceUrl, ...params } = row
        
        if (!name || !brand || !model) {
          results.failed++
          results.errors.push(`行 ${rowNum}: 缺少必填字段`)
          continue
        }
        
        // 生成 slug
        const baseSlug = slugify(`${brand}-${model}`)
        let slug = baseSlug
        let counter = 1
        
        while (await Product.findOne({ slug })) {
          slug = `${baseSlug}-${counter}`
          counter++
        }
        
        // 转换参数
        const productParams = Object.entries(params)
          .filter(([_, value]) => value && value.trim())
          .map(([key, value]) => ({
            fieldKey: key,
            value: isNaN(Number(value)) ? value : Number(value),
          }))
        
        await Product.create({
          categoryId,
          name: name.trim(),
          nameEn: nameEn?.trim(),
          brand: brand.trim(),
          model: model.trim(),
          slug,
          mainImage: mainImage?.trim(),
          params: productParams,
          status: 'pending', // 导入的数据默认为待审核
          sourceUrl: sourceUrl?.trim(),
          price: price ? parseFloat(price) : undefined,
          priceUnit: priceUnit?.trim() || 'CNY',
          releaseDate: releaseDate ? new Date(releaseDate) : undefined,
          viewCount: 0,
          compareCount: 0,
        })
        
        results.success++
      } catch (error) {
        results.failed++
        results.errors.push(`行 ${rowNum}: ${error instanceof Error ? error.message : '导入失败'}`)
      }
    }
    
    // 更新品类产品数量
    await Category.findByIdAndUpdate(categoryId, { $inc: { productCount: results.success } })
    
    return NextResponse.json({
      success: true,
      data: results,
      message: `成功导入 ${results.success} 个产品，失败 ${results.failed} 个`,
    })
  } catch (error) {
    console.error('Error importing CSV:', error)
    return NextResponse.json(
      { success: false, error: '导入失败' },
      { status: 500 }
    )
  }
}
