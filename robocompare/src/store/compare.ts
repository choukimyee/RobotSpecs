import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CompareState {
  categoryId: string | null
  productIds: string[]
  maxProducts: number
  addProduct: (categoryId: string, productId: string) => boolean
  removeProduct: (productId: string) => void
  clearProducts: () => void
  isInCompare: (productId: string) => boolean
  canAddMore: () => boolean
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      categoryId: null,
      productIds: [],
      maxProducts: 10,

      addProduct: (categoryId: string, productId: string) => {
        const state = get()
        
        // 检查是否达到上限
        if (state.productIds.length >= state.maxProducts) {
          return false
        }

        // 如果是不同品类，清空已有产品
        if (state.categoryId && state.categoryId !== categoryId) {
          set({ categoryId, productIds: [productId] })
          return true
        }

        // 如果已存在，不添加
        if (state.productIds.includes(productId)) {
          return false
        }

        set({
          categoryId,
          productIds: [...state.productIds, productId],
        })
        return true
      },

      removeProduct: (productId: string) => {
        const state = get()
        const newProductIds = state.productIds.filter((id) => id !== productId)
        set({
          productIds: newProductIds,
          categoryId: newProductIds.length === 0 ? null : state.categoryId,
        })
      },

      clearProducts: () => {
        set({ categoryId: null, productIds: [] })
      },

      isInCompare: (productId: string) => {
        return get().productIds.includes(productId)
      },

      canAddMore: () => {
        const state = get()
        return state.productIds.length < state.maxProducts
      },
    }),
    {
      name: 'robocompare-compare',
    }
  )
)
