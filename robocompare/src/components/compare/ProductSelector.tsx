'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Plus, Bot } from 'lucide-react'
import { cn } from '@/lib/utils'
import { IProduct } from '@/types'

interface ProductSelectorProps {
  brands: string[]
  brandGroups: Record<string, IProduct[]>
  selectedBrand: string
  selectedProductId: string
  onSelect: (brand: string, productId: string) => void
  isManageMode?: boolean
}

export function ProductSelector({
  brands,
  brandGroups,
  selectedBrand,
  selectedProductId,
  onSelect,
  isManageMode,
}: ProductSelectorProps) {
  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false)
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false)
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

  // 空状态 - 用于添加新产品
  if (!selectedBrand) {
    return (
      <div className="flex flex-col items-center space-y-2">
        {/* 品牌选择 */}
        <div ref={brandRef} className="relative w-full">
          <button
            onClick={() => setBrandDropdownOpen(!brandDropdownOpen)}
            className="compare-selector w-full text-gray-400"
          >
            <Plus className="h-4 w-4" />
            <ChevronDown className="h-4 w-4" />
          </button>
          
          {brandDropdownOpen && (
            <div className="compare-dropdown">
              <div className="max-h-60 overflow-y-auto py-1">
                {brands.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => handleBrandSelect(brand)}
                    className="compare-dropdown-item"
                  >
                    {brand}
                  </button>
                ))}
                {isManageMode && (
                  <button className="compare-dropdown-item border-t text-gray-400">
                    + Add new brand
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 型号选择占位 */}
        <div className="compare-selector w-full justify-center text-gray-300">
          <Plus className="h-4 w-4" />
        </div>

        {/* 图片占位 */}
        <div className="compare-image-placeholder">
          <span className="text-sm">Import Image</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      {/* 品牌选择 */}
      <div ref={brandRef} className="relative w-full">
        <button
          onClick={() => setBrandDropdownOpen(!brandDropdownOpen)}
          className="compare-selector w-full"
        >
          <span className="font-medium text-gray-900">{selectedBrand}</span>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </button>
        
        {brandDropdownOpen && (
          <div className="compare-dropdown">
            <div className="max-h-60 overflow-y-auto py-1">
              {brands.map((brand) => (
                <button
                  key={brand}
                  onClick={() => handleBrandSelect(brand)}
                  className={cn(
                    'compare-dropdown-item',
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
          className="compare-selector w-full"
        >
          <span className="font-bold text-lg text-gray-900">
            {selectedProduct?.model || selectedProduct?.name || 'Select'}
          </span>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </button>
        
        {modelDropdownOpen && (
          <div className="compare-dropdown">
            <div className="max-h-60 overflow-y-auto py-1">
              {availableModels.map((product) => (
                <button
                  key={product._id}
                  onClick={() => handleModelSelect(product._id)}
                  className={cn(
                    'compare-dropdown-item',
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
      <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-50">
        {selectedProduct?.mainImage ? (
          <img
            src={selectedProduct.mainImage}
            alt={selectedProduct.name}
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Bot className="h-16 w-16 text-gray-200" />
          </div>
        )}
      </div>
    </div>
  )
}
