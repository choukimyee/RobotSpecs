'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bot, X, Share2, Download, ArrowLeft, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react'
import { Header, Footer } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { useCompareStore, useLocaleStore } from '@/store'
import { cn, getBestValue } from '@/lib/utils'
import { IProduct, ITemplate, ICategory } from '@/types'

interface CompareData {
  category: ICategory
  template: ITemplate
  products: IProduct[]
}

export default function ComparePage() {
  const { productIds, removeProduct, clearProducts } = useCompareStore()
  const { locale, t } = useLocaleStore()
  const [data, setData] = useState<CompareData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDiffOnly, setShowDiffOnly] = useState(false)
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())
  const [shareLoading, setShareLoading] = useState(false)

  useEffect(() => {
    if (productIds.length >= 2) {
      fetchCompareData()
    } else {
      setLoading(false)
    }
  }, [productIds])

  const fetchCompareData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds }),
      })
      const result = await response.json()
      if (result.success) {
        setData(result.data)
      }
    } catch (error) {
      console.error('Error fetching compare data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    try {
      setShareLoading(true)
      const response = await fetch('/api/compare/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds }),
      })
      const result = await response.json()
      if (result.success) {
        const shareUrl = `${window.location.origin}/share/${result.data.shareId}`
        await navigator.clipboard.writeText(shareUrl)
        alert('分享链接已复制到剪贴板')
      }
    } catch (error) {
      console.error('Error creating share:', error)
      alert('创建分享链接失败')
    } finally {
      setShareLoading(false)
    }
  }

  const toggleGroup = (groupKey: string) => {
    const newCollapsed = new Set(collapsedGroups)
    if (newCollapsed.has(groupKey)) {
      newCollapsed.delete(groupKey)
    } else {
      newCollapsed.add(groupKey)
    }
    setCollapsedGroups(newCollapsed)
  }

  const getParamValue = (product: IProduct, fieldKey: string) => {
    const param = product.params?.find((p) => p.fieldKey === fieldKey)
    return param?.value
  }

  const hasValueDifference = (products: IProduct[], fieldKey: string) => {
    const values = products.map((p) => getParamValue(p, fieldKey))
    const nonNullValues = values.filter((v) => v !== null && v !== undefined)
    if (nonNullValues.length <= 1) return false
    return new Set(nonNullValues.map(String)).size > 1
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-primary-500" />
            <p className="mt-4 text-gray-500">加载对比数据中...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (productIds.length < 2) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <Bot className="mx-auto h-24 w-24 text-gray-300" />
            <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
              请选择要对比的产品
            </h2>
            <p className="mt-2 text-gray-500">
              至少选择 2 个同品类产品进行对比
            </p>
            <Button className="mt-6" asChild>
              <Link href="/">浏览产品</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-gray-500">加载失败，请重试</p>
        </main>
        <Footer />
      </div>
    )
  }

  const { category, template, products } = data

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        {/* 头部 */}
        <div className="border-b border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/category/${category?.slug || ''}`}>
                    <ArrowLeft className="h-5 w-5" />
                  </Link>
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    产品对比
                  </h1>
                  <p className="text-sm text-gray-500">
                    {locale === 'zh' ? category?.name : category?.nameEn} · 共 {products.length} 个产品
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 mr-4">
                  <Checkbox
                    id="showDiff"
                    checked={showDiffOnly}
                    onCheckedChange={(checked) => setShowDiffOnly(!!checked)}
                  />
                  <label htmlFor="showDiff" className="text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                    只显示差异
                  </label>
                </div>

                <Button variant="outline" onClick={handleShare} disabled={shareLoading}>
                  <Share2 className="mr-2 h-4 w-4" />
                  分享
                </Button>
                <Button variant="ghost" onClick={clearProducts}>
                  清空
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 对比表格 */}
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="overflow-x-auto">
            <table className="compare-table w-full min-w-max">
              {/* 产品头部 */}
              <thead>
                <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                  <th className="sticky left-0 z-10 min-w-48 bg-gray-50 p-4 dark:bg-gray-800">
                    <span className="text-gray-500">对比项目</span>
                  </th>
                  {products.map((product) => (
                    <th key={product._id} className="min-w-56 p-4">
                      <div className="relative">
                        <button
                          onClick={() => removeProduct(product._id)}
                          className="absolute -right-2 -top-2 rounded-full bg-gray-200 p-1 text-gray-500 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <Link href={`/product/${product.slug}`} className="block">
                          <div className="mx-auto mb-3 h-32 w-32 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-700">
                            {product.mainImage ? (
                              <img
                                src={product.mainImage}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <Bot className="h-12 w-12 text-gray-300" />
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">{product.brand}</p>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {locale === 'zh' ? product.name : product.nameEn || product.name}
                          </h3>
                          {product.price && (
                            <p className="mt-1 font-medium text-primary-500">
                              ¥{product.price.toLocaleString()}
                            </p>
                          )}
                        </Link>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {template?.groups?.map((group) => {
                  const isCollapsed = collapsedGroups.has(group.key)
                  const visibleFields = showDiffOnly
                    ? group.fields.filter((f) => hasValueDifference(products, f.key))
                    : group.fields

                  if (visibleFields.length === 0 && showDiffOnly) return null

                  return (
                    <React.Fragment key={group.key}>
                      {/* 分组标题 */}
                      <tr
                        className="cursor-pointer bg-gray-100 hover:bg-gray-150 dark:bg-gray-800 dark:hover:bg-gray-750"
                        onClick={() => toggleGroup(group.key)}
                      >
                        <td
                          colSpan={products.length + 1}
                          className="sticky left-0 z-10 bg-gray-100 p-3 dark:bg-gray-800"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {locale === 'zh' ? group.name : group.nameEn}
                            </span>
                            {isCollapsed ? (
                              <ChevronDown className="h-4 w-4 text-gray-500" />
                            ) : (
                              <ChevronUp className="h-4 w-4 text-gray-500" />
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* 参数行 */}
                      {!isCollapsed &&
                        visibleFields.map((field) => {
                          const values = products.map((p) => {
                            const val = getParamValue(p, field.key)
                            return typeof val === 'number' ? val : null
                          })
                          const bestValue = getBestValue(values, field.compareRule)

                          return (
                            <tr key={field.key} className="border-b border-gray-100 dark:border-gray-800">
                              <td className="sticky left-0 z-10 bg-white p-4 dark:bg-gray-900">
                                <div className="flex items-center">
                                  <span className="text-gray-700 dark:text-gray-300">
                                    {locale === 'zh' ? field.name : field.nameEn}
                                  </span>
                                  {field.unit && (
                                    <span className="ml-1 text-xs text-gray-400">
                                      ({locale === 'zh' ? field.unit : field.unitEn || field.unit})
                                    </span>
                                  )}
                                </div>
                              </td>
                              {products.map((product) => {
                                const value = getParamValue(product, field.key)
                                const numValue = typeof value === 'number' ? value : null
                                const isBest = bestValue !== null && numValue === bestValue

                                return (
                                  <td
                                    key={product._id}
                                    className={cn(
                                      'p-4 text-center',
                                      isBest && field.compareRule !== 'none' && 'compare-cell-best'
                                    )}
                                  >
                                    {value !== null && value !== undefined ? (
                                      <span className="font-medium">
                                        {Array.isArray(value) ? value.join(', ') : String(value)}
                                      </span>
                                    ) : (
                                      <span className="text-gray-300">-</span>
                                    )}
                                    {isBest && field.compareRule !== 'none' && (
                                      <Badge variant="success" className="ml-2">
                                        最优
                                      </Badge>
                                    )}
                                  </td>
                                )
                              })}
                            </tr>
                          )
                        })}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
