import { create } from 'zustand'

interface SidebarState {
  collapsed: boolean
  toggle: () => void
  setCollapsed: (collapsed: boolean) => void
}

export const useSidebarStore = create<SidebarState>((set) => ({
  collapsed: typeof window !== 'undefined'
    ? localStorage.getItem('sidebar-collapsed') === 'true'
    : false,

  toggle: () =>
    set((state) => {
      const next = !state.collapsed
      if (typeof window !== 'undefined') {
        localStorage.setItem('sidebar-collapsed', String(next))
      }
      return { collapsed: next }
    }),

  setCollapsed: (collapsed) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar-collapsed', String(collapsed))
    }
    set({ collapsed })
  },
}))
