'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Plus, Bot, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'
import { IProduct } from '@/types'
import { Input } from '@/components/ui/input'

interface ManageProductSelectorProps {
  brands: string[]
  brandGroups: Record<string, IProduct[]>
  selectedBrand: string
  selectedProductId: string
  onSelect: (brand: string, productId: string) => void
  isNew?: boolean
  newData?: {
    brand: string
    model: string
    mainImage: string
    params: Record<string, string>
  }
  onNewDataChange?: (field: string, value: string) => void
}

export function ManageProductSelector({
  brands,
  brandGroups,
  selectedBrand,
  selectedProductId,
  onSelect,
  isNew,
  newData,
  onNewDataChange,
}: ManageProductSelectorProps) {
  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false)
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false)
  const [newBrandInput, setNewBrandInput] = useState('')
  const [showNewBrandInput, setShowNewBrandInput] = useState(false)
  const brandRef = useRef<HTMLDivElement>(null)
  const modelRef = useRef<HTMLDivElement>(null)

  const selectedProduct = selectedProductId
    ? brandGroups[selectedBrand]?.find(p => p._id === selectedProductId)
    : null

  const availableModels = selectedBrand ? brandGroups[selectedBrand] || [] : []

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (brandRef.current && !brandRef.current.contains(event.target as Node)) {
        setBrandDropdownOpen(false)
        setShowNewBrandInput(false)
      }
      if (modelRef.current && !modelRef.current.contains(event.target as Node)) {
        setModelDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleBrandSelect = (brand: string) => {
    setBrandDropdownOpen(false)
    setShowNewBrandInput(false)
    // 自动选择该品牌的第一个产品
    const firstProduct = brandGroups[brand]?.[0]
    if (firstProduct) {
      onSelect(brand, firstProduct._id)
    } else {
      onSelect(brand, '')
    }
  }

  const handleModelSelect = (productId: string) => {
    setModelDropdownOpen(false)
    onSelect(selectedBrand, productId)
  }

  const handleAddNewBrand = () => {
    if (newBrandInput.trim()) {
      onNewDataChange?.('brand', newBrandInput.trim())
      setNewBrandInput('')
      setShowNewBrandInput(false)
      setBrandDropdownOpen(false)
    }
  }

  // 新产品添加状态
  if (isNew && newData) {
    return (
      <div className="flex flex-col items-center space-y-2">
        {/* 品牌选择/输入 */}
        <div ref={brandRef} className="relative w-full">
          <button
            onClick={() => setBrandDropdownOpen(!brandDropdownOpen)}
            className="flex w-full items-center justify-between rounded-md border border-gray-200 px-3 py-2 text-sm hover:border-gray-300"
          >
            <span className={newData.brand ? 'font-medium' : 'text-gray-400'}>
              {newData.brand || <Plus className="h-4 w-4" />}
            </span>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </button>
          
          {brandDropdownOpen && (
            <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
              <div className="max-h-60 overflow-y-auto py-1">
                {brands.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => {
                      onNewDataChange?.('brand', brand)
                      setBrandDropdownOpen(false)
                    }}
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                  >
                    {brand}
                  </button>
                ))}
                
                {/* 添加新品牌 */}
                <div className="border-t px-3 py-2">
                  {showNewBrandInput ? (
                    <div className="flex items-center space-x-2">
                      <Input
                        value={newBrandInput}
                        onChange={(e) => setNewBrandInput(e.target.value)}
                        placeholder="新品牌名称"
                        className="h-8 text-sm"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddNewBrand()
                          if (e.key === 'Escape') {
                            setShowNewBrandInput(false)
                            setNewBrandInput('')
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowNewBrandInput(true)}
                      className="flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-700"
                    >
                      <Plus className="h-4 w-4" />
                      <span>添加新品牌</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 型号输入 */}
        <div className="w-full">
          <Input
            value={newData.model}
            onChange={(e) => onNewDataChange?.('model', e.target.value)}
            placeholder="型号名称"
            className="text-center font-semibold text-lg"
          />
        </div>

        {/* 图片上传 */}
        <div className="aspect-square w-full overflow-hidden rounded-lg border-2 border-dashed border-gray-200 hover:border-gray-400 cursor-pointer flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Upload className="mx-auto h-8 w-8 text-gray-300" />
            <span className="mt-2 block text-sm text-gray-400">Import Image</span>
          </div>
        </div>
      </div>
    )
  }

  // 已选择产品状态
  if (selectedBrand && selectedProduct) {
    return (
      <div className="flex flex-col items-center space-y-2 group">
        {/* 品牌选择 */}
        <div ref={brandRef} className="relative w-full">
          <button
            onClick={() => setBrandDropdownOpen(!brandDropdownOpen)}
            className="flex w-full items-center justify-between rounded-md border border-gray-200 px-3 py-2 text-sm hover:border-gray-300"
          >
            <span className="font-medium">{selectedBrand}</span>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </button>
          
          {brandDropdownOpen && (
            <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
              <div className="max-h-60 overflow-y-auto py-1">
                {brands.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => handleBrandSelect(brand)}
                    className={cn(
                      'block w-full px-3 py-2 text-left text-sm hover:bg-gray-50',
                      brand === selectedBrand && 'bg-gray-50 font-medium'
                    )}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 型号选择 */}
        <div ref={modelRef} className="relative w-full">
          <button
            onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
            className="flex w-full items-center justify-between rounded-md border border-gray-200 px-3 py-2 text-sm hover:border-gray-300"
          >
            <span className="font-semibold text-lg">
              {selectedProduct?.model || selectedProduct?.name || 'Select Model'}
            </span>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </button>
          
          {modelDropdownOpen && (
            <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
              <div className="max-h-60 overflow-y-auto py-1">
                {availableModels.map((product) => (
                  <button
                    key={product._id}
                    onClick={() => handleModelSelect(product._id)}
                    className={cn(
                      'block w-full px-3 py-2 text-left text-sm hover:bg-gray-50',
                      product._id === selectedProductId && 'bg-gray-50 font-medium'
                    )}
                  >
                    {product.model || product.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 产品图片 */}
        <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
          {selectedProduct?.mainImage ? (
            <img
              src={selectedProduct.mainImage}
              alt={selectedProduct.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Bot className="h-16 w-16 text-gray-300" />
            </div>
          )}
        </div>
      </div>
    )
  }

  // 默认空状态
  return (
    <div className="flex flex-col items-center space-y-2">
      <div ref={brandRef} className="relative w-full">
        <button
          onClick={() => setBrandDropdownOpen(!brandDropdownOpen)}
          className="flex w-full items-center justify-between rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-400 hover:border-gray-300"
        >
          <Plus className="h-4 w-4" />
          <ChevronDown className="h-4 w-4" />
        </button>
        
        {brandDropdownOpen && (
          <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
            <div className="max-h-60 overflow-y-auto py-1">
              {brands.map((brand) => (
                <button
                  key={brand}
                  onClick={() => handleBrandSelect(brand)}
                  className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="w-full rounded-md border border-gray-200 px-3 py-2 text-center text-sm text-gray-300">
        <Plus className="mx-auto h-4 w-4" />
      </div>

      <div className="flex aspect-square w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-200 text-gray-300">
        <span className="text-sm">Import Image</span>
      </div>
    </div>
  )
}
