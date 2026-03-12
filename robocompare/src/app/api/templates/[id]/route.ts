import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { Template } from '@/models'

// GET /api/templates/:id - 获取单个模板
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect()
    const { id } = await params
    
    // 支持通过 id 或 categoryId 查询
    const template = await Template.findOne({
      $or: [{ _id: id }, { categoryId: id }],
    }).lean()
    
    if (!template) {
      return NextResponse.json(
        { success: false, error: '模板不存在' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: template,
    })
  } catch (error) {
    console.error('Error fetching template:', error)
    return NextResponse.json(
      { success: false, error: '获取模板失败' },
      { status: 500 }
    )
  }
}

// PUT /api/templates/:id - 更新模板
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect()
    const { id } = await params
    
    const body = await request.json()
    const { name, nameEn, groups } = body
    
    const template = await Template.findById(id)
    if (!template) {
      return NextResponse.json(
        { success: false, error: '模板不存在' },
        { status: 404 }
      )
    }
    
    if (name) template.name = name
    if (nameEn) template.nameEn = nameEn
    if (groups) template.groups = groups
    
    await template.save()
    
    return NextResponse.json({
      success: true,
      data: template,
    })
  } catch (error) {
    console.error('Error updating template:', error)
    return NextResponse.json(
      { success: false, error: '更新模板失败' },
      { status: 500 }
    )
  }
}

// DELETE /api/templates/:id - 删除模板
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect()
    const { id } = await params
    
    const template = await Template.findById(id)
    if (!template) {
      return NextResponse.json(
        { success: false, error: '模板不存在' },
        { status: 404 }
      )
    }
    
    await Template.findByIdAndDelete(id)
    
    return NextResponse.json({
      success: true,
      message: '模板删除成功',
    })
  } catch (error) {
    console.error('Error deleting template:', error)
    return NextResponse.json(
      { success: false, error: '删除模板失败' },
      { status: 500 }
    )
  }
}
