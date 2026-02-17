import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import type { BudgetCategory, BudgetItem, BudgetPeriod } from '@/lib/supabase/types'

interface BudgetState {
  period: BudgetPeriod | null
  categories: BudgetCategory[]
  items: BudgetItem[]
  isLoading: boolean
  error: string | null

  setPeriod: (period: BudgetPeriod | null) => void
  setCategories: (categories: BudgetCategory[]) => void
  setItems: (items: BudgetItem[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  updateItem: (id: string, updates: Partial<BudgetItem>) => void
  addItem: (item: BudgetItem) => void
  removeItem: (id: string) => void

  reorderCategories: (reordered: BudgetCategory[]) => void
  reorderItemsInCategory: (categoryId: string, reordered: BudgetItem[]) => void
}

export const useBudgetStore = create<BudgetState>((set, get) => ({
  period: null,
  categories: [],
  items: [],
  isLoading: false,
  error: null,

  setPeriod: (period) => set({ period }),
  setCategories: (categories) => set({ categories: categories.sort((a, b) => a.sort_order - b.sort_order) }),
  setItems: (items) => set({ items }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  updateItem: (id, updates) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    })),

  addItem: (item) =>
    set((state) => ({
      items: [...state.items, item],
    })),

  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    })),

  reorderCategories: (reordered) => set({ categories: reordered }),
  reorderItemsInCategory: (categoryId, reordered) =>
    set((state) => ({
      items: [
        ...state.items.filter((i) => i.category_id !== categoryId),
        ...reordered,
      ],
    })),
}))

// Derived selectors as hooks (stable references with shallow comparison)
export function useBudgetTotals() {
  return useBudgetStore(
    useShallow((s) => {
      const totalPlanned = s.items.reduce((sum, item) => sum + Number(item.planned_amount), 0)
      const totalActual = s.items.reduce((sum, item) => sum + Number(item.actual_amount), 0)
      const income = Number(s.period?.total_income || 0)
      return {
        totalPlanned,
        totalActual,
        totalDifference: totalPlanned - totalActual,
        income,
        balance: income - totalActual,
      }
    })
  )
}

export function getItemsByCategory(items: BudgetItem[], categoryId: string) {
  return items
    .filter((item) => item.category_id === categoryId)
    .sort((a, b) => a.sort_order - b.sort_order)
}

export function getCategorySubtotal(items: BudgetItem[], categoryId: string) {
  const catItems = items.filter((item) => item.category_id === categoryId)
  const planned = catItems.reduce((sum, item) => sum + Number(item.planned_amount), 0)
  const actual = catItems.reduce((sum, item) => sum + Number(item.actual_amount), 0)
  return { planned, actual, difference: planned - actual }
}
