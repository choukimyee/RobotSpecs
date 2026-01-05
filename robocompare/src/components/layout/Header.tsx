'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Bot,
  Search,
  Menu,
  X,
  Globe,
  User,
  LogIn,
  LogOut,
  Settings,
  Heart,
  ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useLocaleStore, translations } from '@/store'
import { cn } from '@/lib/utils'
import { ICategory } from '@/types'

interface HeaderProps {
  categories?: ICategory[]
  user?: {
    name: string
    email: string
    avatar?: string
    role: string
  } | null
}

export function Header({ categories = [], user }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const pathname = usePathname()
  const { locale, setLocale, t } = useLocaleStore()

  const nav = translations.nav

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                RoboCompare
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex md:items-center md:space-x-1">
            <Link
              href="/"
              className={cn(
                'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                pathname === '/'
                  ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
              )}
            >
              {t(nav.home.zh, nav.home.en)}
            </Link>

            {/* Categories Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    pathname.startsWith('/category')
                      ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
                  )}
                >
                  {t(nav.categories.zh, nav.categories.en)}
                  <ChevronDown className="ml-1 h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {categories.map((category) => (
                  <DropdownMenuItem key={category._id} asChild>
                    <Link
                      href={`/category/${category.slug}`}
                      className="flex items-center"
                    >
                      <span className="mr-2">{category.icon}</span>
                      <span>{locale === 'zh' ? category.name : category.nameEn}</span>
                      <span className="ml-auto text-xs text-gray-400">
                        {category.productCount}
                      </span>
                    </Link>
                  </DropdownMenuItem>
                ))}
                {categories.length === 0 && (
                  <DropdownMenuItem disabled>
                    {t('暂无品类', 'No categories')}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link
              href="/compare"
              className={cn(
                'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                pathname === '/compare'
                  ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
              )}
            >
              {t(nav.compare.zh, nav.compare.en)}
            </Link>

            {user && (user.role === 'admin' || user.role === 'superadmin' || user.role === 'editor') && (
              <Link
                href="/admin"
                className={cn(
                  'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  pathname.startsWith('/admin')
                    ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
                )}
              >
                {t(nav.admin.zh, nav.admin.en)}
              </Link>
            )}
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-2">
            {/* Search Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(!searchOpen)}
              className="text-gray-600 dark:text-gray-300"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-600 dark:text-gray-300">
                  <Globe className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLocale('zh')}>
                  <span className={locale === 'zh' ? 'font-semibold' : ''}>简体中文</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocale('en')}>
                  <span className={locale === 'en' ? 'font-semibold' : ''}>English</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-gray-600 dark:text-gray-300">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      {t(nav.profile.zh, nav.profile.en)}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/favorites" className="flex items-center">
                      <Heart className="mr-2 h-4 w-4" />
                      {t(nav.favorites.zh, nav.favorites.en)}
                    </Link>
                  </DropdownMenuItem>
                  {(user.role === 'admin' || user.role === 'superadmin') && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        {t(nav.admin.zh, nav.admin.en)}
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/api/auth/signout" className="flex items-center text-danger">
                      <LogOut className="mr-2 h-4 w-4" />
                      {t(nav.logout.zh, nav.logout.en)}
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden items-center space-x-2 sm:flex">
                <Button variant="ghost" asChild>
                  <Link href="/login">{t(nav.login.zh, nav.login.en)}</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">{t(nav.register.zh, nav.register.en)}</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="border-t border-gray-100 py-3 dark:border-gray-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={t('搜索产品...', 'Search products...')}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800"
                autoFocus
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900 md:hidden">
          <div className="space-y-1 px-4 py-3">
            <Link
              href="/"
              className="block rounded-lg px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-gray-800"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t(nav.home.zh, nav.home.en)}
            </Link>
            <div className="px-3 py-2">
              <p className="text-sm font-medium text-gray-500">
                {t(nav.categories.zh, nav.categories.en)}
              </p>
              <div className="mt-2 space-y-1">
                {categories.map((category) => (
                  <Link
                    key={category._id}
                    href={`/category/${category.slug}`}
                    className="flex items-center rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="mr-2">{category.icon}</span>
                    {locale === 'zh' ? category.name : category.nameEn}
                  </Link>
                ))}
              </div>
            </div>
            <Link
              href="/compare"
              className="block rounded-lg px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-gray-800"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t(nav.compare.zh, nav.compare.en)}
            </Link>
            {!user && (
              <div className="flex space-x-2 pt-3">
                <Button variant="outline" className="flex-1" asChild>
                  <Link href="/login">{t(nav.login.zh, nav.login.en)}</Link>
                </Button>
                <Button className="flex-1" asChild>
                  <Link href="/register">{t(nav.register.zh, nav.register.en)}</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
