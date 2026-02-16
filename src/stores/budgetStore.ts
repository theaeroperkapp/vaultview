import { create } from 'zustand'
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

  getItemsByCategory: (categoryId: string) => BudgetItem[]
  getCategorySubtotal: (categoryId: string) => { planned: number; actual: number; difference: number }
  getTotals: () => { totalPlanned: number; totalActual: number; totalDifference: number; income: number; balance: number }
}

export const useBudgetStore = create<BudgetState>((set, get) => ({
  period: null,
  categories: [],
  items: [],
  isLoading: true,
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

  getItemsByCategory: (categoryId) => {
    return get().items
      .filter((item) => item.category_id === categoryId)
      .sort((a, b) => a.sort_order - b.sort_order)
  },

  getCategorySubtotal: (categoryId) => {
    const items = get().items.filter((item) => item.category_id === categoryId)
    const planned = items.reduce((sum, item) => sum + Number(item.planned_amount), 0)
    const actual = items.reduce((sum, item) => sum + Number(item.actual_amount), 0)
    return { planned, actual, difference: planned - actual }
  },

  getTotals: () => {
    const { items, period } = get()
    const totalPlanned = items.reduce((sum, item) => sum + Number(item.planned_amount), 0)
    const totalActual = items.reduce((sum, item) => sum + Number(item.actual_amount), 0)
    const income = Number(period?.total_income || 0)
    return {
      totalPlanned,
      totalActual,
      totalDifference: totalPlanned - totalActual,
      income,
      balance: income - totalActual,
    }
  },
}))
