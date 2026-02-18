"use client"

import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useChatStore } from "@/stores/chatStore"
import type { Message } from "@/lib/supabase/types"

export function useChatRealtime(householdId: string | undefined) {
  const addMessage = useChatStore((s) => s.addMessage)
  const updateMessage = useChatStore((s) => s.updateMessage)
  const deleteMessage = useChatStore((s) => s.deleteMessage)
  const setUnreadCount = useChatStore((s) => s.setUnreadCount)

  useEffect(() => {
    if (!householdId) return

    const supabase = createClient()

    const channel = supabase
      .channel("household-chat")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `household_id=eq.${householdId}`,
        },
        async (payload) => {
          const newMessage = payload.new as Message

          // Check if from another user
          const { data: { user } } = await supabase.auth.getUser()
          if (newMessage.sender_id !== user?.id) {
            const current = useChatStore.getState().unreadCount
            setUnreadCount(current + 1)
          }

          addMessage(newMessage)
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `household_id=eq.${householdId}`,
        },
        (payload) => {
          const updated = payload.new as Message
          updateMessage(updated.id, updated)
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "messages",
          filter: `household_id=eq.${householdId}`,
        },
        (payload) => {
          const old = payload.old as { id: string }
          deleteMessage(old.id)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [householdId, addMessage, updateMessage, deleteMessage, setUnreadCount])
}
