import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { User } from '@/models'

// GET /api/users/:id - 获取单个用户
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect()
    const { id } = await params
    
    const user = await User.findById(id).lean()
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: user,
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { success: false, error: '获取用户失败' },
      { status: 500 }
    )
  }
}

// PUT /api/users/:id - 更新用户
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect()
    const { id } = await params
    
    const body = await request.json()
    const { name, avatar, role, isActive } = body
    
    const user = await User.findById(id)
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      )
    }
    
    if (name !== undefined) user.name = name
    if (avatar !== undefined) user.avatar = avatar
    if (role !== undefined) user.role = role
    if (isActive !== undefined) user.isActive = isActive
    
    await user.save()
    
    return NextResponse.json({
      success: true,
      data: user,
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { success: false, error: '更新用户失败' },
      { status: 500 }
    )
  }
}

// DELETE /api/users/:id - 删除用户
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect()
    const { id } = await params
    
    const user = await User.findById(id)
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      )
    }
    
    // 不能删除超级管理员
    if (user.role === 'superadmin') {
      return NextResponse.json(
        { success: false, error: '不能删除超级管理员' },
        { status: 403 }
      )
    }
    
    await User.findByIdAndDelete(id)
    
    return NextResponse.json({
      success: true,
      message: '用户删除成功',
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { success: false, error: '删除用户失败' },
      { status: 500 }
    )
  }
}
