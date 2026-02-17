import { create } from 'zustand'
import type { BudgetTemplate } from '@/lib/supabase/types'

interface TemplateState {
  templates: BudgetTemplate[]
  isLoading: boolean
  setTemplates: (templates: BudgetTemplate[]) => void
  addTemplate: (template: BudgetTemplate) => void
  removeTemplate: (id: string) => void
}

export const useTemplateStore = create<TemplateState>((set) => ({
  templates: [],
  isLoading: false,
  setTemplates: (templates) => set({ templates, isLoading: false }),
  addTemplate: (template) =>
    set((state) => ({ templates: [...state.templates, template] })),
  removeTemplate: (id) =>
    set((state) => ({ templates: state.templates.filter((t) => t.id !== id) })),
}))
