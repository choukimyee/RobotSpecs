import Link from 'next/link'
import { Bot, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function WelcomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/20">
          <Bot className="h-12 w-12 text-primary-500" />
        </div>
        <h1 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
          Robot Comparison
        </h1>
        <p className="mt-2 text-gray-500">
          机器人参数对比平台
        </p>
        <p className="mt-4 text-sm text-gray-400">
          请先在管理后台添加品类和产品
        </p>
        <div className="mt-8">
          <Button asChild>
            <Link href="/admin">
              <Settings className="mr-2 h-4 w-4" />
              进入管理后台
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
