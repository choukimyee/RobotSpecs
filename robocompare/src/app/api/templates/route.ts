import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { Template } from '@/models'

// GET /api/templates - 获取模板列表
export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    const searchParams = request.nextUrl.searchParams
    const categoryId = searchParams.get('categoryId')
    
    const filter = categoryId ? { categoryId } : {}
    const templates = await Template.find(filter).sort({ createdAt: -1 }).lean()
    
    return NextResponse.json({
      success: true,
      data: templates,
    })
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json(
      { success: false, error: '获取模板列表失败' },
      { status: 500 }
    )
  }
}

// POST /api/templates - 创建模板
export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const body = await request.json()
    const { categoryId, name, nameEn, groups } = body
    
    if (!categoryId || !name || !nameEn) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段' },
        { status: 400 }
      )
    }
    
    // 检查是否已存在该品类的模板
    const existing = await Template.findOne({ categoryId })
    if (existing) {
      return NextResponse.json(
        { success: false, error: '该品类已有模板，请编辑现有模板' },
        { status: 400 }
      )
    }
    
    const template = await Template.create({
      categoryId,
      name,
      nameEn,
      groups: groups || [],
    })
    
    return NextResponse.json({
      success: true,
      data: template,
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating template:', error)
    return NextResponse.json(
      { success: false, error: '创建模板失败' },
      { status: 500 }
    )
  }
}
