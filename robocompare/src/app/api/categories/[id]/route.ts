import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { Category, Product, Template } from '@/models'
import { slugify } from '@/lib/utils'

// GET /api/categories/:id - 获取单个品类
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect()
    const { id } = await params
    
    // 支持通过 id 或 slug 查询
    const category = await Category.findOne({
      $or: [{ _id: id }, { slug: id }],
    }).lean()
    
    if (!category) {
      return NextResponse.json(
        { success: false, error: '品类不存在' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: category,
    })
  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json(
      { success: false, error: '获取品类失败' },
      { status: 500 }
    )
  }
}

// PUT /api/categories/:id - 更新品类
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect()
    const { id } = await params
    
    const body = await request.json()
    const { name, nameEn, icon, description, descriptionEn, image, order, isActive } = body
    
    const category = await Category.findById(id)
    if (!category) {
      return NextResponse.json(
        { success: false, error: '品类不存在' },
        { status: 404 }
      )
    }
    
    // 如果更新了英文名，重新生成 slug
    if (nameEn && nameEn !== category.nameEn) {
      const newSlug = slugify(nameEn)
      const existing = await Category.findOne({ slug: newSlug, _id: { $ne: id } })
      if (existing) {
        return NextResponse.json(
          { success: false, error: '该品类标识已存在' },
          { status: 400 }
        )
      }
      category.slug = newSlug
    }
    
    if (name) category.name = name
    if (nameEn) category.nameEn = nameEn
    if (icon !== undefined) category.icon = icon
    if (description !== undefined) category.description = description
    if (descriptionEn !== undefined) category.descriptionEn = descriptionEn
    if (image !== undefined) category.image = image
    if (order !== undefined) category.order = order
    if (isActive !== undefined) category.isActive = isActive
    
    await category.save()
    
    return NextResponse.json({
      success: true,
      data: category,
    })
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json(
      { success: false, error: '更新品类失败' },
      { status: 500 }
    )
  }
}

// DELETE /api/categories/:id - 删除品类
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect()
    const { id } = await params
    
    const category = await Category.findById(id)
    if (!category) {
      return NextResponse.json(
        { success: false, error: '品类不存在' },
        { status: 404 }
      )
    }
    
    // 检查是否有关联的产品
    const productCount = await Product.countDocuments({ categoryId: id })
    if (productCount > 0) {
      return NextResponse.json(
        { success: false, error: `该品类下还有 ${productCount} 个产品，请先删除或转移产品` },
        { status: 400 }
      )
    }
    
    // 删除关联的模板
    await Template.deleteMany({ categoryId: id })
    
    // 删除品类
    await Category.findByIdAndDelete(id)
    
    return NextResponse.json({
      success: true,
      message: '品类删除成功',
    })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { success: false, error: '删除品类失败' },
      { status: 500 }
    )
  }
}
