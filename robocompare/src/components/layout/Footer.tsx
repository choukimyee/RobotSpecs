'use client'

import React from 'react'
import Link from 'next/link'
import { Bot, Github, Twitter } from 'lucide-react'
import { useLocaleStore } from '@/store'

export function Footer() {
  const { t } = useLocaleStore()

  return (
    <footer className="border-t border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                RoboCompare
              </span>
            </Link>
            <p className="mt-4 max-w-md text-sm text-gray-500 dark:text-gray-400">
              {t(
                '专业的机器人产品参数对比平台，帮助您快速了解和比较不同品牌、型号机器人的详细规格。',
                'Professional robot product comparison platform, helping you quickly understand and compare detailed specifications of different robot brands and models.'
              )}
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              {t('产品', 'Products')}
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href="/category/humanoid"
                  className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  {t('人形机器人', 'Humanoid Robots')}
                </Link>
              </li>
              <li>
                <Link
                  href="/category/quadruped"
                  className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  {t('四足机器狗', 'Quadruped Robots')}
                </Link>
              </li>
              <li>
                <Link
                  href="/category/dexterous-hand"
                  className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  {t('灵巧手', 'Dexterous Hands')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              {t('支持', 'Support')}
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  {t('关于我们', 'About Us')}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  {t('联系我们', 'Contact Us')}
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  {t('隐私政策', 'Privacy Policy')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between border-t border-gray-100 pt-8 dark:border-gray-800 sm:flex-row">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} RoboCompare. {t('保留所有权利', 'All rights reserved')}.
          </p>
          <div className="mt-4 flex space-x-4 sm:mt-0">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <Github className="h-5 w-5" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <Twitter className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
