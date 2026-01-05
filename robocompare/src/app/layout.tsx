import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'RoboCompare - 机器人参数对比平台',
  description: '专业的机器人产品参数对比平台，帮助您快速了解和比较不同品牌、型号机器人的详细规格。',
  keywords: '机器人, 人形机器人, 机器狗, 灵巧手, 参数对比, robot, humanoid, comparison',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
