'use client'

import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ICategory } from '@/types'

interface CompareLayoutProps {
  categories: ICategory[]
  currentCategorySlug: string
  children: React.ReactNode
}

export function CompareLayout({ categories, currentCategorySlug, children }: CompareLayoutProps) {
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
              href={`/compare/${category.slug}`}
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
            <Link
              href="/manage"
              className={cn(
                'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
                'border border-gray-200 text-gray-700 hover:bg-gray-50',
                'dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'
              )}
            >
              Manage
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
