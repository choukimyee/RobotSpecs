import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { Product, Category } from '@/models'
import { slugify } from '@/lib/utils'

// GET /api/products/:id - 获取单个产品
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect()
    const { id } = await params
    
    // 支持通过 id 或 slug 查询
    const product = await Product.findOne({
      $or: [{ _id: id }, { slug: id }],
    }).lean()
    
    if (!product) {
      return NextResponse.json(
        { success: false, error: '产品不存在' },
        { status: 404 }
      )
    }
    
    // 增加浏览次数
    await Product.findByIdAndUpdate(product._id, { $inc: { viewCount: 1 } })
    
    return NextResponse.json({
      success: true,
      data: product,
    })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { success: false, error: '获取产品失败' },
      { status: 500 }
    )
  }
}

// PUT /api/products/:id - 更新产品
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect()
    const { id } = await params
    
    const body = await request.json()
    const product = await Product.findById(id)
    
    if (!product) {
      return NextResponse.json(
        { success: false, error: '产品不存在' },
        { status: 404 }
      )
    }
    
    const oldCategoryId = product.categoryId
    
    // 更新字段
    if (body.name !== undefined) product.name = body.name
    if (body.nameEn !== undefined) product.nameEn = body.nameEn
    if (body.brand !== undefined) product.brand = body.brand
    if (body.model !== undefined) product.model = body.model
    if (body.mainImage !== undefined) product.mainImage = body.mainImage
    if (body.images !== undefined) product.images = body.images
    if (body.params !== undefined) product.params = body.params
    if (body.status !== undefined) product.status = body.status
    if (body.sourceUrl !== undefined) product.sourceUrl = body.sourceUrl
    if (body.price !== undefined) product.price = body.price
    if (body.priceUnit !== undefined) product.priceUnit = body.priceUnit
    if (body.releaseDate !== undefined) product.releaseDate = body.releaseDate ? new Date(body.releaseDate) : undefined
    if (body.categoryId !== undefined) product.categoryId = body.categoryId
    
    // 如果更改了品牌或型号，更新 slug
    if (body.brand || body.model) {
      const baseSlug = slugify(`${product.brand}-${product.model}`)
      let slug = baseSlug
      let counter = 1
      
      while (await Product.findOne({ slug, _id: { $ne: id } })) {
        slug = `${baseSlug}-${counter}`
        counter++
      }
      product.slug = slug
    }
    
    await product.save()
    
    // 如果品类变更，更新两个品类的产品数量
    if (body.categoryId && body.categoryId !== oldCategoryId) {
      await Category.findByIdAndUpdate(oldCategoryId, { $inc: { productCount: -1 } })
      await Category.findByIdAndUpdate(body.categoryId, { $inc: { productCount: 1 } })
    }
    
    return NextResponse.json({
      success: true,
      data: product,
    })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { success: false, error: '更新产品失败' },
      { status: 500 }
    )
  }
}

// DELETE /api/products/:id - 删除产品
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect()
    const { id } = await params
    
    const product = await Product.findById(id)
    if (!product) {
      return NextResponse.json(
        { success: false, error: '产品不存在' },
        { status: 404 }
      )
    }
    
    const categoryId = product.categoryId
    
    await Product.findByIdAndDelete(id)
    
    // 更新品类的产品数量
    await Category.findByIdAndUpdate(categoryId, { $inc: { productCount: -1 } })
    
    return NextResponse.json({
      success: true,
      message: '产品删除成功',
    })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { success: false, error: '删除产品失败' },
      { status: 500 }
    )
  }
}
