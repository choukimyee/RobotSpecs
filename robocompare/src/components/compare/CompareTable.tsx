'use client'

import React, { useState } from 'react'
import { ChevronDown, ChevronRight, Plus, X, Pencil, Save } from 'lucide-react'
import { ICategory, ITemplate, IProduct, ITemplateField } from '@/types'
import { ProductSelector } from './ProductSelector'
import { Button } from '@/components/ui/button'

interface CompareTableProps {
  category: ICategory
  template: ITemplate | null
  products: IProduct[]
  brands: string[]
  brandGroups: Record<string, IProduct[]>
}

interface SelectedProduct {
  brand: string
  productId: string
  product: IProduct | null
}

const MAX_COLUMNS = 5

export function CompareTable({
  category,
  template,
  products,
  brands,
  brandGroups,
}: CompareTableProps) {
  // 选中的产品列
  const [columns, setColumns] = useState<SelectedProduct[]>(() => {
    // 默认显示前几个品牌的第一个产品
    const initial: SelectedProduct[] = []
    for (let i = 0; i < Math.min(brands.length, MAX_COLUMNS - 1); i++) {
      const brand = brands[i]
      const firstProduct = brandGroups[brand]?.[0]
      if (firstProduct) {
        initial.push({
          brand,
          productId: firstProduct._id,
          product: firstProduct,
        })
      }
    }
    // 添加一个空列用于添加新产品
    initial.push({ brand: '', productId: '', product: null })
    return initial
  })

  // 折叠的分组
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())

  // 管理模式
  const [isManageMode, setIsManageMode] = useState(false)

  const toggleGroup = (groupKey: string) => {
    const newCollapsed = new Set(collapsedGroups)
    if (newCollapsed.has(groupKey)) {
      newCollapsed.delete(groupKey)
    } else {
      newCollapsed.add(groupKey)
    }
    setCollapsedGroups(newCollapsed)
  }

  const updateColumn = (index: number, brand: string, productId: string) => {
    const newColumns = [...columns]
    const product = products.find(p => p._id === productId) || null
    newColumns[index] = { brand, productId, product }
    
    // 如果更新的是最后一列且选择了产品，添加新的空列
    if (index === columns.length - 1 && product && columns.length < MAX_COLUMNS) {
      newColumns.push({ brand: '', productId: '', product: null })
    }
    
    setColumns(newColumns)
  }

  const removeColumn = (index: number) => {
    if (columns.length <= 1) return
    const newColumns = columns.filter((_, i) => i !== index)
    // 确保至少有一个空列
    const hasEmptyColumn = newColumns.some(c => !c.product)
    if (!hasEmptyColumn && newColumns.length < MAX_COLUMNS) {
      newColumns.push({ brand: '', productId: '', product: null })
    }
    setColumns(newColumns)
  }

  const getParamValue = (product: IProduct | null, fieldKey: string) => {
    if (!product) return null
    const param = product.params?.find(p => p.fieldKey === fieldKey)
    return param?.value ?? null
  }

  const formatValue = (value: unknown, field: ITemplateField) => {
    if (value === null || value === undefined || value === '') return ''
    if (Array.isArray(value)) return value.join(', ')
    
    const strValue = String(value)
    if (field.unit) {
      return `${strValue} ${field.unit}`
    }
    return strValue
  }

  return (
    <div className="w-full">
      {/* 管理模式切换 */}
      {isManageMode && (
        <div className="mb-4 flex items-center justify-end">
          <Button size="sm" onClick={() => setIsManageMode(false)}>
            <Save className="mr-2 h-4 w-4" />
            Safe
          </Button>
        </div>
      )}

      {/* 对比表格 */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          {/* 产品选择区 */}
          <thead>
            <tr>
              <th className="w-48" />
              {columns.map((column, index) => (
                <th key={index} className="min-w-[200px] p-2 align-top">
                  <div className="relative">
                    {/* 编辑/删除按钮 */}
                    {isManageMode && column.product && (
                      <div className="absolute -top-2 right-0 flex space-x-1">
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button 
                          className="p-1 text-gray-400 hover:text-red-500"
                          onClick={() => removeColumn(index)}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                    
                    <ProductSelector
                      brands={brands}
                      brandGroups={brandGroups}
                      selectedBrand={column.brand}
                      selectedProductId={column.productId}
                      onSelect={(brand, productId) => updateColumn(index, brand, productId)}
                      isManageMode={isManageMode}
                    />
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* 参数区 */}
          <tbody>
            {template?.groups?.map((group) => (
              <React.Fragment key={group.key}>
                {/* 分组标题 - 参考图使用向下的三角形图标 */}
                <tr>
                  <td colSpan={columns.length + 1} className="pt-6 pb-2">
                    <button
                      onClick={() => toggleGroup(group.key)}
                      className="compare-group-title"
                    >
                      {collapsedGroups.has(group.key) ? (
                        <ChevronRight className="h-4 w-4 text-orange-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-orange-400" />
                      )}
                      <span>{group.name}</span>
                      {isManageMode && (
                        <div className="ml-2 flex space-x-1">
                          <button className="p-1 text-gray-400 hover:text-gray-600">
                            <Pencil className="h-3 w-3" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-red-500">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </button>
                  </td>
                </tr>

                {/* 参数行 */}
                {!collapsedGroups.has(group.key) &&
                  group.fields.map((field) => (
                    <tr key={field.key} className="border-b border-gray-50 dark:border-gray-800">
                      <td className="py-2 pr-4">
                        <span className="compare-param-label">{field.name}:</span>
                      </td>
                      {columns.map((column, index) => {
                        const value = getParamValue(column.product, field.key)
                        const displayValue = formatValue(value, field)
                        
                        return (
                          <td key={index} className="py-2 px-2">
                            {column.product ? (
                              <span className="compare-param-value">
                                {displayValue || '-'}
                              </span>
                            ) : isManageMode ? (
                              <input
                                type="text"
                                placeholder={field.name}
                                className="w-full border-b border-gray-200 bg-transparent py-1 text-sm outline-none focus:border-primary-500"
                              />
                            ) : null}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
              </React.Fragment>
            ))}

            {/* 添加分组按钮（管理模式） */}
            {isManageMode && (
              <tr>
                <td colSpan={columns.length + 1} className="pt-6">
                  <button className="flex items-center space-x-2 text-gray-400 hover:text-gray-600">
                    <ChevronDown className="h-4 w-4" />
                    <Plus className="h-4 w-4" />
                  </button>
                  <button className="mt-2 flex items-center space-x-2 text-gray-400 hover:text-gray-600">
                    <Plus className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 没有模板时的提示 */}
      {!template && (
        <div className="py-12 text-center text-gray-500">
          该品类还没有配置参数模板，请先在管理后台添加模板
        </div>
      )}

      {/* 没有产品时的提示 */}
      {products.length === 0 && (
        <div className="py-12 text-center text-gray-500">
          该品类还没有产品，请先在管理后台添加产品
        </div>
      )}
    </div>
  )
}
