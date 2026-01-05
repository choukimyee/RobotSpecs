'use client'

import React from 'react'
import Link from 'next/link'
import { Bot, Plus, Check } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useCompareStore } from '@/store'
import { cn } from '@/lib/utils'

interface ProductCardProps {
  product: {
    _id: string
    slug: string
    mainImage?: string
    name: string
    nameEn?: string
    brand: string
    model: string
    price?: number
    categoryId: string
  }
  categoryId: string
}

export function ProductCard({ product, categoryId }: ProductCardProps) {
  const { addProduct, removeProduct, isInCompare, canAddMore } = useCompareStore()
  const inCompare = isInCompare(product._id)

  const handleCompareClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (inCompare) {
      removeProduct(product._id)
    } else if (canAddMore()) {
      addProduct(categoryId, product._id)
    }
  }

  return (
    <Link href={`/product/${product.slug}`}>
      <Card className="product-card group h-full cursor-pointer overflow-hidden">
        <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
          {product.mainImage ? (
            <img
              src={product.mainImage}
              alt={product.name}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Bot className="h-16 w-16 text-gray-300" />
            </div>
          )}
          
          {/* 对比按钮 */}
          <button
            onClick={handleCompareClick}
            className={cn(
              'absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full transition-all',
              inCompare
                ? 'bg-primary-500 text-white'
                : 'bg-white/80 text-gray-600 opacity-0 group-hover:opacity-100 hover:bg-white'
            )}
          >
            {inCompare ? (
              <Check className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </button>
        </div>
        
        <CardContent className="p-4">
          <p className="text-xs text-gray-500">{product.brand}</p>
          <h3 className="mt-1 font-semibold text-gray-900 dark:text-white line-clamp-2">
            {product.name}
          </h3>
          <p className="text-sm text-gray-500">{product.model}</p>
          {product.price && (
            <p className="mt-2 font-medium text-primary-500">
              ¥{product.price.toLocaleString()}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
