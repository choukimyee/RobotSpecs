import { NextResponse } from 'next/server'

// POST /api/auth/logout - 用户登出
export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: '已退出登录',
  })
  
  // 清除 cookie
  response.cookies.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
  })
  
  return response
}
