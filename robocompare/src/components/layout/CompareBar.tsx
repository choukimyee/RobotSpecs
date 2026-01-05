'use client'

import React from 'react'
import Link from 'next/link'
import { X, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCompareStore, useLocaleStore, translations } from '@/store'

interface CompareBarProps {
  products?: Array<{
    _id: string
    name: string
    nameEn?: string
    mainImage?: string
  }>
}

export function CompareBar({ products = [] }: CompareBarProps) {
  const { productIds, removeProduct, clearProducts } = useCompareStore()
  const { locale, t } = useLocaleStore()
  const common = translations.common

  if (productIds.length === 0) return null

  const compareProducts = productIds
    .map((id) => products.find((p) => p._id === id))
    .filter(Boolean)

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white shadow-hard dark:border-gray-700 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t(common.compare.zh, common.compare.en)} ({productIds.length}/10)
            </span>
            <div className="flex items-center space-x-2 overflow-x-auto">
              {compareProducts.map((product) => (
                <div
                  key={product!._id}
                  className="relative flex items-center rounded-lg bg-gray-100 px-2 py-1 dark:bg-gray-800"
                >
                  {product!.mainImage && (
                    <img
                      src={product!.mainImage}
                      alt={product!.name}
                      className="mr-2 h-8 w-8 rounded object-cover"
                    />
                  )}
                  <span className="max-w-24 truncate text-sm">
                    {locale === 'zh' ? product!.name : product!.nameEn || product!.name}
                  </span>
                  <button
                    onClick={() => removeProduct(product!._id)}
                    className="ml-2 rounded-full p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    <X className="h-3 w-3 text-gray-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={clearProducts}>
              {t('清空', 'Clear')}
            </Button>
            <Button size="sm" disabled={productIds.length < 2} asChild>
              <Link href="/compare" className="flex items-center">
                {t(common.startCompare.zh, common.startCompare.en)}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
