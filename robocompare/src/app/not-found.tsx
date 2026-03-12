import Link from 'next/link'
import { Bot, ArrowLeft, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
      <div className="text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
          <Bot className="h-12 w-12 text-gray-400" />
        </div>
        <h1 className="mt-6 text-4xl font-bold text-gray-900 dark:text-white">
          404
        </h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
          页面未找到
        </p>
        <p className="mt-1 text-gray-500">
          您访问的页面不存在或已被删除
        </p>
        <div className="mt-8 flex items-center justify-center space-x-4">
          <Button variant="outline" asChild>
            <Link href="javascript:history.back()">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回上页
            </Link>
          </Button>
          <Button asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              返回首页
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
