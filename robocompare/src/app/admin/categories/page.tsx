'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ICategory } from '@/types'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<ICategory[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<ICategory | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    icon: '🤖',
    description: '',
    descriptionEn: '',
    order: 0,
    isActive: true,
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories?includeInactive=true')
      const result = await response.json()
      if (result.success) {
        setCategories(result.data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingCategory
        ? `/api/categories/${editingCategory._id}`
        : '/api/categories'
      const method = editingCategory ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      
      const result = await response.json()
      
      if (result.success) {
        setDialogOpen(false)
        setEditingCategory(null)
        resetForm()
        fetchCategories()
      } else {
        alert(result.error || '操作失败')
      }
    } catch (error) {
      console.error('Error saving category:', error)
      alert('保存失败')
    }
  }

  const handleEdit = (category: ICategory) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      nameEn: category.nameEn,
      icon: category.icon,
      description: category.description || '',
      descriptionEn: category.descriptionEn || '',
      order: category.order,
      isActive: category.isActive,
    })
    setDialogOpen(true)
  }

  const handleDelete = async (category: ICategory) => {
    if (!confirm(`确定要删除品类 "${category.name}" 吗？`)) return
    
    try {
      const response = await fetch(`/api/categories/${category._id}`, {
        method: 'DELETE',
      })
      const result = await response.json()
      
      if (result.success) {
        fetchCategories()
      } else {
        alert(result.error || '删除失败')
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      alert('删除失败')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      nameEn: '',
      icon: '🤖',
      description: '',
      descriptionEn: '',
      order: 0,
      isActive: true,
    })
  }

  const openNewDialog = () => {
    setEditingCategory(null)
    resetForm()
    setDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">品类管理</h1>
        <Button onClick={openNewDialog}>
          <Plus className="mr-2 h-4 w-4" />
          添加品类
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">排序</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">图标</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">名称</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">英文名</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">产品数</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">状态</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr
                  key={category._id}
                  className="border-b border-gray-100 last:border-0 dark:border-gray-800"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center text-gray-400">
                      <GripVertical className="mr-2 h-4 w-4" />
                      {category.order}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-2xl">{category.icon}</span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                    {category.name}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{category.nameEn}</td>
                  <td className="px-4 py-3 text-gray-500">{category.productCount}</td>
                  <td className="px-4 py-3">
                    <Badge variant={category.isActive ? 'success' : 'secondary'}>
                      {category.isActive ? '启用' : '禁用'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleEdit(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(category)}
                        className="text-danger hover:text-danger"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                    暂无品类，点击右上角添加
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* 编辑对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCategory ? '编辑品类' : '添加品类'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">图标</label>
                <Input
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="text-center text-2xl"
                  maxLength={2}
                />
              </div>
              <div className="col-span-3">
                <label className="mb-1 block text-sm font-medium">排序</label>
                <Input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">中文名称 *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="如：人形机器人"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">英文名称 *</label>
              <Input
                value={formData.nameEn}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                placeholder="如：Humanoid Robot"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">中文描述</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="品类简介"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">英文描述</label>
              <Input
                value={formData.descriptionEn}
                onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                placeholder="Category description"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="isActive" className="text-sm">启用该品类</label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                取消
              </Button>
              <Button type="submit">保存</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
