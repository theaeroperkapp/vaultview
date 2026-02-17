import { create } from 'zustand'

interface SidebarState {
  collapsed: boolean
  mobileOpen: boolean
  toggle: () => void
  setCollapsed: (collapsed: boolean) => void
  toggleMobile: () => void
  setMobileOpen: (open: boolean) => void
}

export const useSidebarStore = create<SidebarState>((set) => ({
  collapsed: typeof window !== 'undefined'
    ? localStorage.getItem('sidebar-collapsed') === 'true'
    : false,
  mobileOpen: false,

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

  toggleMobile: () => set((state) => ({ mobileOpen: !state.mobileOpen })),
  setMobileOpen: (mobileOpen) => set({ mobileOpen }),
}))
