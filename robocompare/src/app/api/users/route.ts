import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { User } from '@/models'

// GET /api/users - 获取用户列表
export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    const searchParams = request.nextUrl.searchParams
    const role = searchParams.get('role')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '50')
    
    const filter: Record<string, unknown> = {}
    if (role) {
      filter.role = role
    }
    
    const skip = (page - 1) * pageSize
    
    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(pageSize).lean(),
      User.countDocuments(filter),
    ])
    
    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { success: false, error: '获取用户列表失败' },
      { status: 500 }
    )
  }
}
