import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { Category } from '@/models'
import { slugify } from '@/lib/utils'

// GET /api/categories - 获取所有品类
export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    const searchParams = request.nextUrl.searchParams
    const includeInactive = searchParams.get('includeInactive') === 'true'
    
    const filter = includeInactive ? {} : { isActive: true }
    const categories = await Category.find(filter).sort({ order: 1 }).lean()
    
    return NextResponse.json({
      success: true,
      data: categories,
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { success: false, error: '获取品类列表失败' },
      { status: 500 }
    )
  }
}

// POST /api/categories - 创建品类
export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const body = await request.json()
    const { name, nameEn, icon, description, descriptionEn, image, order, isActive } = body
    
    if (!name || !nameEn) {
      return NextResponse.json(
        { success: false, error: '名称为必填项' },
        { status: 400 }
      )
    }
    
    const slug = slugify(nameEn)
    
    // 检查 slug 是否已存在
    const existing = await Category.findOne({ slug })
    if (existing) {
      return NextResponse.json(
        { success: false, error: '该品类标识已存在' },
        { status: 400 }
      )
    }
    
    const category = await Category.create({
      name,
      nameEn,
      slug,
      icon: icon || '🤖',
      description,
      descriptionEn,
      image,
      order: order || 0,
      isActive: isActive !== false,
      productCount: 0,
    })
    
    return NextResponse.json({
      success: true,
      data: category,
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { success: false, error: '创建品类失败' },
      { status: 500 }
    )
  }
}
