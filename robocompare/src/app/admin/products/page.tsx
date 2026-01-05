'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, Upload, Download, Search, ArrowRightLeft, Link as LinkIcon, Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { IProduct, ICategory } from '@/types'

export default function ProductsPage() {
  const [products, setProducts] = useState<IProduct[]>([])
  const [categories, setCategories] = useState<ICategory[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  
  // 筛选条件
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  
  // 对话框状态
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [scrapeDialogOpen, setScrapeDialogOpen] = useState(false)
  const [transferDialogOpen, setTransferDialogOpen] = useState(false)
  const [productDialogOpen, setProductDialogOpen] = useState(false)
  
  // 表单数据
  const [scrapeUrl, setScrapeUrl] = useState('')
  const [scrapeLoading, setScrapeLoading] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [transferTargetCategory, setTransferTargetCategory] = useState('')
  const [importCategory, setImportCategory] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // 产品表单
  const [editingProduct, setEditingProduct] = useState<IProduct | null>(null)
  const [productForm, setProductForm] = useState({
    categoryId: '',
    name: '',
    nameEn: '',
    brand: '',
    model: '',
    mainImage: '',
    price: '',
    priceUnit: 'CNY',
    sourceUrl: '',
    status: 'draft' as 'draft' | 'pending' | 'published' | 'archived',
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [page, categoryFilter, statusFilter])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const result = await response.json()
      if (result.success) {
        setCategories(result.data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      })
      if (categoryFilter) params.append('categoryId', categoryFilter)
      if (statusFilter) params.append('status', statusFilter)
      if (searchQuery) params.append('search', searchQuery)
      
      const response = await fetch(`/api/products?${params}`)
      const result = await response.json()
      
      if (result.success) {
        setProducts(result.data.items)
        setTotal(result.data.total)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (product: IProduct) => {
    if (!confirm(`确定要删除产品 "${product.name}" 吗？`)) return
    
    try {
      const response = await fetch(`/api/products/${product._id}`, {
        method: 'DELETE',
      })
      const result = await response.json()
      
      if (result.success) {
        fetchProducts()
      } else {
        alert(result.error || '删除失败')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('删除失败')
    }
  }

  const handleScrape = async () => {
    if (!scrapeUrl) return
    
    try {
      setScrapeLoading(true)
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: scrapeUrl }),
      })
      const result = await response.json()
      
      if (result.success) {
        // 用抓取的数据填充表单
        setProductForm({
          ...productForm,
          name: result.data.title || '',
          mainImage: result.data.images?.[0] || '',
          sourceUrl: scrapeUrl,
          price: result.data.price?.toString() || '',
        })
        setScrapeDialogOpen(false)
        setProductDialogOpen(true)
        setScrapeUrl('')
      } else {
        alert(result.error || '抓取失败')
      }
    } catch (error) {
      console.error('Error scraping:', error)
      alert('抓取失败')
    } finally {
      setScrapeLoading(false)
    }
  }

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault()
    const file = fileInputRef.current?.files?.[0]
    if (!file || !importCategory) return
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('categoryId', importCategory)
    
    try {
      const response = await fetch('/api/import', {
        method: 'POST',
        body: formData,
      })
      const result = await response.json()
      
      if (result.success) {
        alert(result.message)
        setImportDialogOpen(false)
        fetchProducts()
      } else {
        alert(result.error || '导入失败')
      }
    } catch (error) {
      console.error('Error importing:', error)
      alert('导入失败')
    }
  }

  const handleTransfer = async () => {
    if (selectedProducts.length === 0 || !transferTargetCategory) return
    
    try {
      const response = await fetch('/api/products/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productIds: selectedProducts,
          targetCategoryId: transferTargetCategory,
        }),
      })
      const result = await response.json()
      
      if (result.success) {
        alert(result.message)
        setTransferDialogOpen(false)
        setSelectedProducts([])
        fetchProducts()
      } else {
        alert(result.error || '转移失败')
      }
    } catch (error) {
      console.error('Error transferring:', error)
      alert('转移失败')
    }
  }

  const handleExport = async () => {
    const params = new URLSearchParams()
    if (categoryFilter) params.append('categoryId', categoryFilter)
    if (selectedProducts.length > 0) params.append('productIds', selectedProducts.join(','))
    
    window.open(`/api/export?${params}`, '_blank')
  }

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingProduct
        ? `/api/products/${editingProduct._id}`
        : '/api/products'
      const method = editingProduct ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...productForm,
          price: productForm.price ? parseFloat(productForm.price) : undefined,
        }),
      })
      
      const result = await response.json()
      
      if (result.success) {
        setProductDialogOpen(false)
        setEditingProduct(null)
        resetProductForm()
        fetchProducts()
      } else {
        alert(result.error || '保存失败')
      }
    } catch (error) {
      console.error('Error saving product:', error)
      alert('保存失败')
    }
  }

  const resetProductForm = () => {
    setProductForm({
      categoryId: '',
      name: '',
      nameEn: '',
      brand: '',
      model: '',
      mainImage: '',
      price: '',
      priceUnit: 'CNY',
      sourceUrl: '',
      status: 'draft',
    })
  }

  const openEditDialog = (product: IProduct) => {
    setEditingProduct(product)
    setProductForm({
      categoryId: product.categoryId,
      name: product.name,
      nameEn: product.nameEn || '',
      brand: product.brand,
      model: product.model,
      mainImage: product.mainImage || '',
      price: product.price?.toString() || '',
      priceUnit: product.priceUnit || 'CNY',
      sourceUrl: product.sourceUrl || '',
      status: product.status,
    })
    setProductDialogOpen(true)
  }

  const openNewDialog = () => {
    setEditingProduct(null)
    resetProductForm()
    setProductDialogOpen(true)
  }

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    )
  }

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c._id === categoryId)?.name || '-'
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">产品管理</h1>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setScrapeDialogOpen(true)}>
            <LinkIcon className="mr-2 h-4 w-4" />
            链接抓取
          </Button>
          <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            导入
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            导出
          </Button>
          <Button onClick={openNewDialog}>
            <Plus className="mr-2 h-4 w-4" />
            添加产品
          </Button>
        </div>
      </div>

      {/* 筛选栏 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="w-48">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="选择品类" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部品类</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.icon} {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-40">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部状态</SelectItem>
                  <SelectItem value="draft">草稿</SelectItem>
                  <SelectItem value="pending">待审核</SelectItem>
                  <SelectItem value="published">已发布</SelectItem>
                  <SelectItem value="archived">已归档</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="搜索产品名称、品牌、型号..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchProducts()}
                  className="pl-9"
                />
              </div>
            </div>
            {selectedProducts.length > 0 && (
              <Button
                variant="outline"
                onClick={() => setTransferDialogOpen(true)}
              >
                <ArrowRightLeft className="mr-2 h-4 w-4" />
                转移 ({selectedProducts.length})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 产品列表 */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary-500" />
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === products.length && products.length > 0}
                      onChange={(e) =>
                        setSelectedProducts(
                          e.target.checked ? products.map((p) => p._id) : []
                        )
                      }
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">产品</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">品类</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">品牌</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">型号</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">价格</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">状态</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr
                    key={product._id}
                    className="border-b border-gray-100 last:border-0 dark:border-gray-800"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product._id)}
                        onChange={() => toggleProductSelection(product._id)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                          {product.mainImage ? (
                            <img
                              src={product.mainImage}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <Bot className="h-6 w-6 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {product.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {getCategoryName(product.categoryId)}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{product.brand}</td>
                    <td className="px-4 py-3 text-gray-500">{product.model}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {product.price ? `¥${product.price.toLocaleString()}` : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          product.status === 'published'
                            ? 'success'
                            : product.status === 'pending'
                            ? 'warning'
                            : 'secondary'
                        }
                      >
                        {product.status === 'published'
                          ? '已发布'
                          : product.status === 'pending'
                          ? '待审核'
                          : product.status === 'archived'
                          ? '已归档'
                          : '草稿'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => openEditDialog(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDelete(product)}
                          className="text-danger hover:text-danger"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                      暂无产品
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <nav className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              上一页
            </Button>
            <span className="px-4 text-sm text-gray-500">
              第 {page} / {totalPages} 页
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              下一页
            </Button>
          </nav>
        </div>
      )}

      {/* 链接抓取对话框 */}
      <Dialog open={scrapeDialogOpen} onOpenChange={setScrapeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>链接抓取</DialogTitle>
            <DialogDescription>
              输入产品页面链接，自动提取产品信息
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="https://..."
              value={scrapeUrl}
              onChange={(e) => setScrapeUrl(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScrapeDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleScrape} disabled={scrapeLoading || !scrapeUrl}>
              {scrapeLoading ? '抓取中...' : '开始抓取'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CSV 导入对话框 */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>CSV 导入</DialogTitle>
            <DialogDescription>
              上传 CSV 文件批量导入产品数据
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleImport} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">选择品类 *</label>
              <Select value={importCategory} onValueChange={setImportCategory}>
                <SelectTrigger>
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
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">选择文件 *</label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-primary-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-700 hover:file:bg-primary-100"
              />
              <p className="mt-1 text-xs text-gray-500">
                CSV 文件需包含 name、brand、model 列
              </p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setImportDialogOpen(false)}>
                取消
              </Button>
              <Button type="submit" disabled={!importCategory}>
                开始导入
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 品类转移对话框 */}
      <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>转移产品</DialogTitle>
            <DialogDescription>
              将选中的 {selectedProducts.length} 个产品转移到其他品类
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">目标品类</label>
              <Select value={transferTargetCategory} onValueChange={setTransferTargetCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="选择目标品类" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.icon} {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransferDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleTransfer} disabled={!transferTargetCategory}>
              确认转移
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 产品编辑对话框 */}
      <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingProduct ? '编辑产品' : '添加产品'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleProductSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">品类 *</label>
              <Select
                value={productForm.categoryId}
                onValueChange={(v) => setProductForm({ ...productForm, categoryId: v })}
              >
                <SelectTrigger>
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
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">产品名称 *</label>
                <Input
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">英文名称</label>
                <Input
                  value={productForm.nameEn}
                  onChange={(e) => setProductForm({ ...productForm, nameEn: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">品牌 *</label>
                <Input
                  value={productForm.brand}
                  onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">型号 *</label>
                <Input
                  value={productForm.model}
                  onChange={(e) => setProductForm({ ...productForm, model: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">主图 URL</label>
              <Input
                value={productForm.mainImage}
                onChange={(e) => setProductForm({ ...productForm, mainImage: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">价格</label>
                <Input
                  type="number"
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">状态</label>
                <Select
                  value={productForm.status}
                  onValueChange={(v: 'draft' | 'pending' | 'published' | 'archived') =>
                    setProductForm({ ...productForm, status: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">草稿</SelectItem>
                    <SelectItem value="pending">待审核</SelectItem>
                    <SelectItem value="published">已发布</SelectItem>
                    <SelectItem value="archived">已归档</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">来源链接</label>
              <Input
                value={productForm.sourceUrl}
                onChange={(e) => setProductForm({ ...productForm, sourceUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setProductDialogOpen(false)}>
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
