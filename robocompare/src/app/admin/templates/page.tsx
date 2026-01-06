'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, ChevronDown, ChevronUp, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ITemplate, ITemplateGroup, ITemplateField, ICategory } from '@/types'

const fieldTypes = [
  { value: 'text', label: '文本' },
  { value: 'number', label: '数字' },
  { value: 'date', label: '日期' },
  { value: 'select', label: '单选' },
  { value: 'multiselect', label: '多选' },
  { value: 'image', label: '图片' },
  { value: 'url', label: '链接' },
  { value: 'textarea', label: '长文本' },
]

const compareRules = [
  { value: 'none', label: '不比较' },
  { value: 'higher_better', label: '越大越好' },
  { value: 'lower_better', label: '越小越好' },
]

export default function TemplatesPage() {
  const [categories, setCategories] = useState<ICategory[]>([])
  const [templates, setTemplates] = useState<ITemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [currentTemplate, setCurrentTemplate] = useState<ITemplate | null>(null)
  
  // 对话框状态
  const [groupDialogOpen, setGroupDialogOpen] = useState(false)
  const [fieldDialogOpen, setFieldDialogOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<ITemplateGroup | null>(null)
  const [editingField, setEditingField] = useState<ITemplateField | null>(null)
  const [editingGroupKey, setEditingGroupKey] = useState<string>('')
  
  // 展开/折叠状态
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  
  // 表单数据
  const [groupForm, setGroupForm] = useState({
    name: '',
    nameEn: '',
    key: '',
    order: 0,
  })
  
  const [fieldForm, setFieldForm] = useState({
    name: '',
    nameEn: '',
    key: '',
    type: 'text',
    unit: '',
    unitEn: '',
    options: '',
    required: false,
    compareRule: 'none',
    order: 0,
    description: '',
    descriptionEn: '',
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (selectedCategory) {
      fetchTemplate(selectedCategory)
    } else {
      setCurrentTemplate(null)
    }
  }, [selectedCategory])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const result = await response.json()
      if (result.success) {
        setCategories(result.data)
        if (result.data.length > 0) {
          setSelectedCategory(result.data[0]._id)
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTemplate = async (categoryId: string) => {
    try {
      const response = await fetch(`/api/templates/${categoryId}`)
      const result = await response.json()
      if (result.success) {
        setCurrentTemplate(result.data)
      } else {
        setCurrentTemplate(null)
      }
    } catch (error) {
      console.error('Error fetching template:', error)
      setCurrentTemplate(null)
    }
  }

  const createTemplate = async () => {
    const category = categories.find(c => c._id === selectedCategory)
    if (!category) return
    
    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: selectedCategory,
          name: `${category.name}参数模板`,
          nameEn: `${category.nameEn} Template`,
          groups: [],
        }),
      })
      const result = await response.json()
      if (result.success) {
        setCurrentTemplate(result.data)
      } else {
        alert(result.error || '创建模板失败')
      }
    } catch (error) {
      console.error('Error creating template:', error)
      alert('创建模板失败')
    }
  }

  const saveTemplate = async () => {
    if (!currentTemplate) return
    
    try {
      const response = await fetch(`/api/templates/${currentTemplate._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groups: currentTemplate.groups,
        }),
      })
      const result = await response.json()
      if (result.success) {
        alert('模板保存成功')
      } else {
        alert(result.error || '保存失败')
      }
    } catch (error) {
      console.error('Error saving template:', error)
      alert('保存失败')
    }
  }

  const toggleGroup = (groupKey: string) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey)
    } else {
      newExpanded.add(groupKey)
    }
    setExpandedGroups(newExpanded)
  }

  // 分组操作
  const openGroupDialog = (group?: ITemplateGroup) => {
    if (group) {
      setEditingGroup(group)
      setGroupForm({
        name: group.name,
        nameEn: group.nameEn,
        key: group.key,
        order: group.order,
      })
    } else {
      setEditingGroup(null)
      setGroupForm({
        name: '',
        nameEn: '',
        key: '',
        order: (currentTemplate?.groups?.length || 0) + 1,
      })
    }
    setGroupDialogOpen(true)
  }

  const saveGroup = () => {
    if (!currentTemplate) return
    
    const newGroup: ITemplateGroup = {
      _id: editingGroup?._id || `group_${Date.now()}`,
      name: groupForm.name,
      nameEn: groupForm.nameEn,
      key: groupForm.key || groupForm.nameEn.toLowerCase().replace(/\s+/g, '_'),
      order: groupForm.order,
      fields: editingGroup?.fields || [],
    }
    
    let newGroups: ITemplateGroup[]
    if (editingGroup) {
      newGroups = currentTemplate.groups.map(g => 
        g._id === editingGroup._id ? newGroup : g
      )
    } else {
      newGroups = [...currentTemplate.groups, newGroup]
    }
    
    setCurrentTemplate({
      ...currentTemplate,
      groups: newGroups.sort((a, b) => a.order - b.order),
    })
    setGroupDialogOpen(false)
  }

  const deleteGroup = (groupKey: string) => {
    if (!currentTemplate) return
    if (!confirm('确定要删除该分组及其所有字段吗？')) return
    
    setCurrentTemplate({
      ...currentTemplate,
      groups: currentTemplate.groups.filter(g => g.key !== groupKey),
    })
  }

  // 字段操作
  const openFieldDialog = (groupKey: string, field?: ITemplateField) => {
    setEditingGroupKey(groupKey)
    if (field) {
      setEditingField(field)
      setFieldForm({
        name: field.name,
        nameEn: field.nameEn,
        key: field.key,
        type: field.type,
        unit: field.unit || '',
        unitEn: field.unitEn || '',
        options: field.options?.join(', ') || '',
        required: field.required,
        compareRule: field.compareRule,
        order: field.order,
        description: field.description || '',
        descriptionEn: field.descriptionEn || '',
      })
    } else {
      const group = currentTemplate?.groups.find(g => g.key === groupKey)
      setEditingField(null)
      setFieldForm({
        name: '',
        nameEn: '',
        key: '',
        type: 'text',
        unit: '',
        unitEn: '',
        options: '',
        required: false,
        compareRule: 'none',
        order: (group?.fields?.length || 0) + 1,
        description: '',
        descriptionEn: '',
      })
    }
    setFieldDialogOpen(true)
  }

  const saveField = () => {
    if (!currentTemplate) return
    
    const newField: ITemplateField = {
      _id: editingField?._id || `field_${Date.now()}`,
      name: fieldForm.name,
      nameEn: fieldForm.nameEn,
      key: fieldForm.key || fieldForm.nameEn.toLowerCase().replace(/\s+/g, '_'),
      type: fieldForm.type as ITemplateField['type'],
      unit: fieldForm.unit || undefined,
      unitEn: fieldForm.unitEn || undefined,
      options: fieldForm.options ? fieldForm.options.split(',').map(s => s.trim()) : undefined,
      required: fieldForm.required,
      compareRule: fieldForm.compareRule as ITemplateField['compareRule'],
      order: fieldForm.order,
      description: fieldForm.description || undefined,
      descriptionEn: fieldForm.descriptionEn || undefined,
    }
    
    const newGroups = currentTemplate.groups.map(group => {
      if (group.key !== editingGroupKey) return group
      
      let newFields: ITemplateField[]
      if (editingField) {
        newFields = group.fields.map(f => 
          f._id === editingField._id ? newField : f
        )
      } else {
        newFields = [...group.fields, newField]
      }
      
      return {
        ...group,
        fields: newFields.sort((a, b) => a.order - b.order),
      }
    })
    
    setCurrentTemplate({
      ...currentTemplate,
      groups: newGroups,
    })
    setFieldDialogOpen(false)
  }

  const deleteField = (groupKey: string, fieldKey: string) => {
    if (!currentTemplate) return
    if (!confirm('确定要删除该字段吗？')) return
    
    const newGroups = currentTemplate.groups.map(group => {
      if (group.key !== groupKey) return group
      return {
        ...group,
        fields: group.fields.filter(f => f.key !== fieldKey),
      }
    })
    
    setCurrentTemplate({
      ...currentTemplate,
      groups: newGroups,
    })
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">模板管理</h1>
        <div className="flex items-center space-x-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="选择品类" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat._id} value={cat._id}>
                  {cat.icon} {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {currentTemplate && (
            <Button onClick={saveTemplate}>保存模板</Button>
          )}
        </div>
      </div>

      {!currentTemplate ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">该品类还没有参数模板</p>
            <Button onClick={createTemplate}>
              <Plus className="mr-2 h-4 w-4" />
              创建模板
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">{currentTemplate.name}</h2>
            <Button variant="outline" onClick={() => openGroupDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              添加分组
            </Button>
          </div>

          {currentTemplate.groups.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                暂无参数分组，点击上方按钮添加
              </CardContent>
            </Card>
          ) : (
            currentTemplate.groups.map((group) => (
              <Card key={group.key}>
                <CardHeader
                  className="cursor-pointer"
                  onClick={() => toggleGroup(group.key)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <GripVertical className="h-4 w-4 text-gray-400" />
                      <CardTitle className="text-base">
                        {group.name}
                        <span className="ml-2 text-sm font-normal text-gray-500">
                          ({group.nameEn})
                        </span>
                      </CardTitle>
                      <Badge variant="secondary">{group.fields.length} 个字段</Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          openGroupDialog(group)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteGroup(group.key)
                        }}
                        className="text-danger hover:text-danger"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      {expandedGroups.has(group.key) ? (
                        <ChevronUp className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                {expandedGroups.has(group.key) && (
                  <CardContent>
                    <div className="space-y-2">
                      {group.fields.map((field) => (
                        <div
                          key={field.key}
                          className="flex items-center justify-between rounded-lg border border-gray-100 p-3 dark:border-gray-800"
                        >
                          <div className="flex items-center space-x-4">
                            <GripVertical className="h-4 w-4 text-gray-400" />
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">{field.name}</span>
                                {field.unit && (
                                  <span className="text-xs text-gray-400">({field.unit})</span>
                                )}
                              </div>
                              <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <span>{field.nameEn}</span>
                                <span>·</span>
                                <span>{fieldTypes.find(t => t.value === field.type)?.label}</span>
                                {field.compareRule !== 'none' && (
                                  <>
                                    <span>·</span>
                                    <Badge variant="outline" className="text-xs">
                                      {compareRules.find(r => r.value === field.compareRule)?.label}
                                    </Badge>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => openFieldDialog(group.key, field)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => deleteField(group.key, field.key)}
                              className="text-danger hover:text-danger"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => openFieldDialog(group.key)}
                      >
                        <Plus className="mr-2 h-3 w-3" />
                        添加字段
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </div>
      )}

      {/* 分组编辑对话框 */}
      <Dialog open={groupDialogOpen} onOpenChange={setGroupDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingGroup ? '编辑分组' : '添加分组'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">中文名称 *</label>
                <Input
                  value={groupForm.name}
                  onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                  placeholder="如：物理规格"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">英文名称 *</label>
                <Input
                  value={groupForm.nameEn}
                  onChange={(e) => setGroupForm({ ...groupForm, nameEn: e.target.value })}
                  placeholder="如：Physical Specs"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">标识符</label>
                <Input
                  value={groupForm.key}
                  onChange={(e) => setGroupForm({ ...groupForm, key: e.target.value })}
                  placeholder="自动生成"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">排序</label>
                <Input
                  type="number"
                  value={groupForm.order}
                  onChange={(e) => setGroupForm({ ...groupForm, order: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGroupDialogOpen(false)}>取消</Button>
            <Button onClick={saveGroup}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 字段编辑对话框 */}
      <Dialog open={fieldDialogOpen} onOpenChange={setFieldDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingField ? '编辑字段' : '添加字段'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">中文名称 *</label>
                <Input
                  value={fieldForm.name}
                  onChange={(e) => setFieldForm({ ...fieldForm, name: e.target.value })}
                  placeholder="如：身高"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">英文名称 *</label>
                <Input
                  value={fieldForm.nameEn}
                  onChange={(e) => setFieldForm({ ...fieldForm, nameEn: e.target.value })}
                  placeholder="如：Height"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">字段类型</label>
                <Select
                  value={fieldForm.type}
                  onValueChange={(v) => setFieldForm({ ...fieldForm, type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fieldTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">对比规则</label>
                <Select
                  value={fieldForm.compareRule}
                  onValueChange={(v) => setFieldForm({ ...fieldForm, compareRule: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {compareRules.map((rule) => (
                      <SelectItem key={rule.value} value={rule.value}>
                        {rule.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">单位（中文）</label>
                <Input
                  value={fieldForm.unit}
                  onChange={(e) => setFieldForm({ ...fieldForm, unit: e.target.value })}
                  placeholder="如：mm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">单位（英文）</label>
                <Input
                  value={fieldForm.unitEn}
                  onChange={(e) => setFieldForm({ ...fieldForm, unitEn: e.target.value })}
                  placeholder="如：mm"
                />
              </div>
            </div>
            {(fieldForm.type === 'select' || fieldForm.type === 'multiselect') && (
              <div>
                <label className="mb-1 block text-sm font-medium">选项（逗号分隔）</label>
                <Input
                  value={fieldForm.options}
                  onChange={(e) => setFieldForm({ ...fieldForm, options: e.target.value })}
                  placeholder="选项1, 选项2, 选项3"
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">标识符</label>
                <Input
                  value={fieldForm.key}
                  onChange={(e) => setFieldForm({ ...fieldForm, key: e.target.value })}
                  placeholder="自动生成"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">排序</label>
                <Input
                  type="number"
                  value={fieldForm.order}
                  onChange={(e) => setFieldForm({ ...fieldForm, order: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="required"
                checked={fieldForm.required}
                onChange={(e) => setFieldForm({ ...fieldForm, required: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="required" className="text-sm">必填字段</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFieldDialogOpen(false)}>取消</Button>
            <Button onClick={saveField}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
