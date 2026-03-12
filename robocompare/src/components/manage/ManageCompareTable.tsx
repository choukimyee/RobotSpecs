'use client'

import React, { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronRight, Plus, X, Pencil, Save, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ICategory, ITemplate, IProduct, ITemplateGroup, ITemplateField } from '@/types'
import { ManageProductSelector } from './ManageProductSelector'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

interface ManageCompareTableProps {
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
  isNew?: boolean
  newData?: {
    brand: string
    model: string
    mainImage: string
    params: Record<string, string>
  }
}

interface EditingField {
  productIndex: number
  fieldKey: string
}

const MAX_COLUMNS = 5

export function ManageCompareTable({
  category,
  template,
  products,
  brands: initialBrands,
  brandGroups: initialBrandGroups,
}: ManageCompareTableProps) {
  const router = useRouter()
  const [brands, setBrands] = useState(initialBrands)
  const [brandGroups, setBrandGroups] = useState(initialBrandGroups)
  
  // 选中的产品列
  const [columns, setColumns] = useState<SelectedProduct[]>(() => {
    const initial: SelectedProduct[] = []
    for (let i = 0; i < Math.min(brands.length, MAX_COLUMNS - 1); i++) {
      const brand = brands[i]
      const firstProduct = brandGroups[brand]?.[0]
      if (firstProduct) {
        initial.push({
          brand,
          productId: firstProduct._id,
          product: firstProduct as IProduct,
        })
      }
    }
    // 添加一个空列用于添加新产品
    initial.push({ 
      brand: '', 
      productId: '', 
      product: null,
      isNew: true,
      newData: { brand: '', model: '', mainImage: '', params: {} }
    })
    return initial
  })

  // 折叠的分组
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())

  // 编辑状态
  const [editingField, setEditingField] = useState<EditingField | null>(null)
  const [editValue, setEditValue] = useState('')

  // 编辑分组对话框
  const [editGroupDialog, setEditGroupDialog] = useState<{ open: boolean; group: ITemplateGroup | null }>({
    open: false,
    group: null
  })
  const [groupForm, setGroupForm] = useState({ name: '', nameEn: '', key: '' })

  // 保存状态
  const [isSaving, setIsSaving] = useState(false)

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
    newColumns[index] = { brand, productId, product: product as IProduct }
    
    // 如果更新的是最后一列且选择了产品，添加新的空列
    if (index === columns.length - 1 && product && columns.length < MAX_COLUMNS) {
      newColumns.push({ 
        brand: '', 
        productId: '', 
        product: null,
        isNew: true,
        newData: { brand: '', model: '', mainImage: '', params: {} }
      })
    }
    
    setColumns(newColumns)
  }

  const removeColumn = async (index: number) => {
    if (columns.length <= 1) return
    const column = columns[index]
    
    // 如果是已存在的产品，可以选择删除
    if (column.product && !column.isNew) {
      const confirmed = window.confirm(`确定要从对比中移除 ${column.product.name} 吗？`)
      if (!confirmed) return
    }
    
    const newColumns = columns.filter((_, i) => i !== index)
    // 确保至少有一个空列
    const hasEmptyColumn = newColumns.some(c => !c.product && c.isNew)
    if (!hasEmptyColumn && newColumns.length < MAX_COLUMNS) {
      newColumns.push({ 
        brand: '', 
        productId: '', 
        product: null,
        isNew: true,
        newData: { brand: '', model: '', mainImage: '', params: {} }
      })
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

  const startEditing = (productIndex: number, fieldKey: string, currentValue: unknown) => {
    setEditingField({ productIndex, fieldKey })
    setEditValue(currentValue?.toString() || '')
  }

  const saveFieldEdit = async () => {
    if (!editingField) return
    
    const column = columns[editingField.productIndex]
    if (!column.product) return

    try {
      // 更新产品参数
      const updatedParams = column.product.params?.map(p => 
        p.fieldKey === editingField.fieldKey 
          ? { ...p, value: editValue }
          : p
      ) || []

      // 如果参数不存在，添加新参数
      if (!updatedParams.find(p => p.fieldKey === editingField.fieldKey)) {
        updatedParams.push({ fieldKey: editingField.fieldKey, value: editValue })
      }

      const response = await fetch(`/api/products/${column.product._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ params: updatedParams })
      })

      if (response.ok) {
        // 更新本地状态
        const newColumns = [...columns]
        if (newColumns[editingField.productIndex].product) {
          newColumns[editingField.productIndex].product = {
            ...newColumns[editingField.productIndex].product!,
            params: updatedParams
          }
        }
        setColumns(newColumns)
      }
    } catch (error) {
      console.error('保存失败:', error)
    }
    
    setEditingField(null)
    setEditValue('')
  }

  const cancelEdit = () => {
    setEditingField(null)
    setEditValue('')
  }

  const handleNewProductChange = (index: number, field: string, value: string) => {
    const newColumns = [...columns]
    if (newColumns[index].isNew && newColumns[index].newData) {
      newColumns[index].newData = {
        ...newColumns[index].newData!,
        [field]: value
      }
      setColumns(newColumns)
    }
  }

  const handleNewProductParamChange = (index: number, fieldKey: string, value: string) => {
    const newColumns = [...columns]
    if (newColumns[index].isNew && newColumns[index].newData) {
      newColumns[index].newData = {
        ...newColumns[index].newData!,
        params: {
          ...newColumns[index].newData!.params,
          [fieldKey]: value
        }
      }
      setColumns(newColumns)
    }
  }

  const openEditGroupDialog = (group: ITemplateGroup) => {
    setGroupForm({
      name: group.name,
      nameEn: group.nameEn,
      key: group.key
    })
    setEditGroupDialog({ open: true, group })
  }

  const deleteGroup = async (groupKey: string) => {
    if (!template) return
    const confirmed = window.confirm('确定要删除此参数组吗？')
    if (!confirmed) return
    
    try {
      const updatedGroups = template.groups.filter(g => g.key !== groupKey)
      await fetch(`/api/templates/${template._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groups: updatedGroups })
      })
      router.refresh()
    } catch (error) {
      console.error('删除分组失败:', error)
    }
  }

  return (
    <div className="w-full">
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
                    {column.product && (
                      <div className="absolute -top-1 right-0 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          className="p-1 text-gray-400 hover:text-gray-600"
                          onClick={() => router.push(`/admin/products?edit=${column.product?._id}`)}
                        >
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
                    
                    <ManageProductSelector
                      brands={brands}
                      brandGroups={brandGroups}
                      selectedBrand={column.brand}
                      selectedProductId={column.productId}
                      onSelect={(brand, productId) => updateColumn(index, brand, productId)}
                      isNew={column.isNew}
                      newData={column.newData}
                      onNewDataChange={(field, value) => handleNewProductChange(index, field, value)}
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
                {/* 分组标题 */}
                <tr>
                  <td colSpan={columns.length + 1} className="pt-6">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleGroup(group.key)}
                        className="flex items-center space-x-2 text-left"
                      >
                        {collapsedGroups.has(group.key) ? (
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        )}
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                          {group.name}
                        </span>
                      </button>
                      <div className="flex space-x-1">
                        <button 
                          className="p-1 text-gray-400 hover:text-gray-600"
                          onClick={() => openEditGroupDialog(group)}
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button 
                          className="p-1 text-gray-400 hover:text-red-500"
                          onClick={() => deleteGroup(group.key)}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>

                {/* 参数行 */}
                {!collapsedGroups.has(group.key) &&
                  group.fields.map((field) => (
                    <tr key={field.key} className="border-b border-gray-50 dark:border-gray-800 group">
                      <td className="py-2 pr-4 text-sm text-gray-900 dark:text-white">
                        <span className="font-medium">{field.name}:</span>
                      </td>
                      {columns.map((column, index) => {
                        const value = getParamValue(column.product, field.key)
                        const displayValue = formatValue(value, field)
                        const isEditing = editingField?.productIndex === index && editingField?.fieldKey === field.key
                        
                        return (
                          <td key={index} className="py-2 px-2 text-sm">
                            {column.product ? (
                              isEditing ? (
                                <div className="flex items-center space-x-1">
                                  <Input
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    className="h-7 text-sm"
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') saveFieldEdit()
                                      if (e.key === 'Escape') cancelEdit()
                                    }}
                                  />
                                  <button 
                                    onClick={saveFieldEdit}
                                    className="p-1 text-green-500 hover:text-green-600"
                                  >
                                    <Save className="h-3 w-3" />
                                  </button>
                                  <button 
                                    onClick={cancelEdit}
                                    className="p-1 text-gray-400 hover:text-gray-600"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ) : (
                                <div 
                                  className="cursor-pointer hover:bg-gray-50 px-1 py-0.5 rounded"
                                  onClick={() => startEditing(index, field.key, value)}
                                >
                                  <span className="text-gray-700 dark:text-gray-300">
                                    {displayValue || '-'}
                                  </span>
                                </div>
                              )
                            ) : column.isNew ? (
                              <input
                                type="text"
                                placeholder={field.name}
                                value={column.newData?.params[field.key] || ''}
                                onChange={(e) => handleNewProductParamChange(index, field.key, e.target.value)}
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

            {/* 添加分组按钮 */}
            <tr>
              <td colSpan={columns.length + 1} className="pt-6">
                <button 
                  className="flex items-center space-x-2 text-gray-400 hover:text-gray-600"
                  onClick={() => router.push(`/admin/templates?category=${category._id}`)}
                >
                  <ChevronDown className="h-4 w-4" />
                  <Plus className="h-4 w-4" />
                  <span className="text-sm">添加参数组</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 没有模板时的提示 */}
      {!template && (
        <div className="py-12 text-center">
          <p className="text-gray-500 mb-4">该品类还没有配置参数模板</p>
          <Button onClick={() => router.push(`/admin/templates?category=${category._id}`)}>
            创建模板
          </Button>
        </div>
      )}

      {/* 编辑分组对话框 */}
      <Dialog open={editGroupDialog.open} onOpenChange={(open) => setEditGroupDialog({ open, group: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑参数组</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">名称</label>
              <Input
                value={groupForm.name}
                onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                placeholder="例如：Overview"
              />
            </div>
            <div>
              <label className="text-sm font-medium">英文名称</label>
              <Input
                value={groupForm.nameEn}
                onChange={(e) => setGroupForm({ ...groupForm, nameEn: e.target.value })}
                placeholder="例如：Overview"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditGroupDialog({ open: false, group: null })}>
              取消
            </Button>
            <Button onClick={() => {
              // TODO: 保存分组
              setEditGroupDialog({ open: false, group: null })
            }}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
