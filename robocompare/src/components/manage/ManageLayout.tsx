'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Save, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ICategory } from '@/types'
import { Button } from '@/components/ui/button'

interface ManageLayoutProps {
  categories: ICategory[]
  currentCategorySlug: string
  children: React.ReactNode
}

export function ManageLayout({ categories, currentCategorySlug, children }: ManageLayoutProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    // TODO: 实现保存逻辑
    setTimeout(() => {
      setIsSaving(false)
      router.push(`/compare/${currentCategorySlug}`)
    }, 500)
  }

  return (
    <div className="flex min-h-screen bg-white dark:bg-gray-900">
      {/* 左侧品类导航 */}
      <aside className="fixed inset-y-0 left-0 z-40 w-40 border-r border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
        {/* Logo - 参考 ANKER 样式 */}
        <div className="flex h-14 flex-col justify-center px-4">
          <Link href="/" className="flex flex-col">
            <span className="text-lg font-bold tracking-wide text-gray-900 dark:text-white">
              ROBO
            </span>
            <span className="text-[10px] text-gray-400 -mt-1">
              Innovations
            </span>
          </Link>
        </div>

        {/* 品类列表 */}
        <nav className="mt-4 space-y-0.5 px-2">
          {categories.map((category) => (
            <Link
              key={category._id}
              href={`/manage/${category.slug}`}
              className={cn(
                'block px-3 py-1.5 text-sm transition-colors',
                currentCategorySlug === category.slug
                  ? 'font-semibold text-gray-900 dark:text-white'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              )}
            >
              {category.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* 主内容区 */}
      <div className="ml-40 flex-1">
        {/* 顶部栏 */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-gray-100 bg-white px-6 dark:border-gray-800 dark:bg-gray-900">
          <h1 className="compare-header text-gray-900 dark:text-white">
            Robot Comparison
          </h1>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              className="rounded-md"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-primary-500" />
                  保存中...
                </>
              ) : (
                'Safe'
              )}
            </Button>
            <Link
              href="/admin"
              className={cn(
                'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
                'border border-gray-200 text-gray-700 hover:bg-gray-50',
                'dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'
              )}
            >
              <Settings className="inline-block mr-1 h-4 w-4" />
              Admin
            </Link>
            <Link
              href="/login"
              className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              Sign up
            </Link>
          </div>
        </header>

        {/* 内容 */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
