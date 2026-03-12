'use client'

import React from 'react'
import { Plus, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCompareStore } from '@/store'

interface AddToCompareButtonProps {
  productId: string
  categoryId: string
  productName: string
}

export function AddToCompareButton({ productId, categoryId, productName }: AddToCompareButtonProps) {
  const { addProduct, removeProduct, isInCompare, canAddMore } = useCompareStore()
  const inCompare = isInCompare(productId)

  const handleClick = () => {
    if (inCompare) {
      removeProduct(productId)
    } else if (canAddMore()) {
      const success = addProduct(categoryId, productId)
      if (!success) {
        alert('对比栏已满，最多支持10个产品')
      }
    } else {
      alert('对比栏已满，最多支持10个产品')
    }
  }

  return (
    <Button
      variant={inCompare ? 'secondary' : 'default'}
      onClick={handleClick}
      className="flex-1 sm:flex-none"
    >
      {inCompare ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          已加入对比
        </>
      ) : (
        <>
          <Plus className="mr-2 h-4 w-4" />
          加入对比
        </>
      )}
    </Button>
  )
}
