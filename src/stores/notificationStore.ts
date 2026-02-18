import { create } from 'zustand'
import type { Notification } from '@/lib/supabase/types'

const DEFAULT_PREFERENCES: Record<string, boolean> = {
  request_new: true,
  request_vote: true,
  request_approved: true,
  request_denied: true,
  budget_add: true,
  budget_edit: true,
  budget_remove: true,
  budget_overspend: true,
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  preferences: Record<string, boolean>

  setNotifications: (notifications: Notification[]) => void
  addNotification: (notification: Notification) => void
  markRead: (id: string) => void
  markAllRead: () => void
  setLoading: (loading: boolean) => void
  setPreference: (type: string, enabled: boolean) => void
  loadPreferences: () => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: true,
  preferences: { ...DEFAULT_PREFERENCES },

  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.is_read).length,
    }),

  addNotification: (notification) =>
    set((state) => {
      if (state.notifications.some((n) => n.id === notification.id)) return state
      return {
        notifications: [notification, ...state.notifications],
        unreadCount: state.unreadCount + (notification.is_read ? 0 : 1),
      }
    }),

  markRead: (id) =>
    set((state) => {
      const target = state.notifications.find((n) => n.id === id)
      if (!target || target.is_read) return state
      return {
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, is_read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }
    }),

  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
      unreadCount: 0,
    })),

  setLoading: (loading) => set({ isLoading: loading }),

  setPreference: (type, enabled) =>
    set((state) => {
      const next = { ...state.preferences, [type]: enabled }
      if (typeof window !== "undefined") {
        localStorage.setItem("vaultview-notification-prefs", JSON.stringify(next))
      }
      return { preferences: next }
    }),

  loadPreferences: () => {
    if (typeof window === "undefined") return
    const saved = localStorage.getItem("vaultview-notification-prefs")
    if (saved) {
      try {
        set({ preferences: { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) } })
      } catch { /* ignore corrupt data */ }
    }
  },
}))
