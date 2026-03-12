import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { User } from '@/models'

// POST /api/auth/register - 用户注册
export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const body = await request.json()
    const { email, name, password } = body
    
    if (!email || !name || !password) {
      return NextResponse.json(
        { success: false, error: '请填写完整的注册信息' },
        { status: 400 }
      )
    }
    
    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: '邮箱格式不正确' },
        { status: 400 }
      )
    }
    
    // 验证密码长度
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: '密码至少需要6个字符' },
        { status: 400 }
      )
    }
    
    // 检查邮箱是否已注册
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: '该邮箱已被注册' },
        { status: 400 }
      )
    }
    
    // 创建用户
    const user = await User.create({
      email,
      name,
      password,
      role: 'user',
      isActive: true,
    })
    
    return NextResponse.json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Error registering user:', error)
    return NextResponse.json(
      { success: false, error: '注册失败，请稍后重试' },
      { status: 500 }
    )
  }
}
