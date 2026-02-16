import { create } from 'zustand'
import type { Message, Profile } from '@/lib/supabase/types'

interface ChatState {
  messages: Message[]
  profiles: Record<string, Profile>
  isLoading: boolean
  unreadCount: number
  isDrawerOpen: boolean

  setMessages: (messages: Message[]) => void
  addMessage: (message: Message) => void
  setProfiles: (profiles: Record<string, Profile>) => void
  setLoading: (loading: boolean) => void
  setUnreadCount: (count: number) => void
  toggleDrawer: () => void
  setDrawerOpen: (open: boolean) => void
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  profiles: {},
  isLoading: true,
  unreadCount: 0,
  isDrawerOpen: false,

  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
  setProfiles: (profiles) => set({ profiles }),
  setLoading: (isLoading) => set({ isLoading }),
  setUnreadCount: (unreadCount) => set({ unreadCount }),
  toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),
  setDrawerOpen: (isDrawerOpen) => set({ isDrawerOpen }),
}))
