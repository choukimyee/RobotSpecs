import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { Product, Category } from '@/models'
import { slugify } from '@/lib/utils'

// GET /api/products - 获取产品列表
export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    const searchParams = request.nextUrl.searchParams
    const categoryId = searchParams.get('categoryId')
    const categorySlug = searchParams.get('category')
    const status = searchParams.get('status')
    const brand = searchParams.get('brand')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    
    // 构建筛选条件
    const filter: Record<string, unknown> = {}
    
    if (categoryId) {
      filter.categoryId = categoryId
    } else if (categorySlug) {
      const category = await Category.findOne({ slug: categorySlug })
      if (category) {
        filter.categoryId = category._id.toString()
      }
    }
    
    if (status) {
      filter.status = status
    } else {
      filter.status = 'published' // 默认只显示已发布的
    }
    
    if (brand) {
      filter.brand = brand
    }
    
    if (search) {
      filter.$text = { $search: search }
    }
    
    // 构建排序
    const sort: Record<string, 1 | -1> = {}
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1
    
    // 分页查询
    const skip = (page - 1) * pageSize
    
    const [products, total] = await Promise.all([
      Product.find(filter).sort(sort).skip(skip).limit(pageSize).lean(),
      Product.countDocuments(filter),
    ])
    
    return NextResponse.json({
      success: true,
      data: {
        items: products,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { success: false, error: '获取产品列表失败' },
      { status: 500 }
    )
  }
}

// POST /api/products - 创建产品
export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const body = await request.json()
    const {
      categoryId,
      name,
      nameEn,
      brand,
      model,
      mainImage,
      images,
      params,
      status,
      sourceUrl,
      price,
      priceUnit,
      releaseDate,
    } = body
    
    if (!categoryId || !name || !brand || !model) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段' },
        { status: 400 }
      )
    }
    
    // 生成 slug
    const baseSlug = slugify(`${brand}-${model}`)
    let slug = baseSlug
    let counter = 1
    
    // 确保 slug 唯一
    while (await Product.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }
    
    const product = await Product.create({
      categoryId,
      name,
      nameEn,
      brand,
      model,
      slug,
      mainImage,
      images: images || [],
      params: params || [],
      status: status || 'draft',
      sourceUrl,
      price,
      priceUnit: priceUnit || 'CNY',
      releaseDate: releaseDate ? new Date(releaseDate) : undefined,
      viewCount: 0,
      compareCount: 0,
    })
    
    // 更新品类的产品数量
    await Category.findByIdAndUpdate(categoryId, { $inc: { productCount: 1 } })
    
    return NextResponse.json({
      success: true,
      data: product,
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { success: false, error: '创建产品失败' },
      { status: 500 }
    )
  }
}
