"use client"

import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useChatStore } from "@/stores/chatStore"
import type { Message } from "@/lib/supabase/types"

export function useChatRealtime(householdId: string | undefined) {
  const { addMessage, setUnreadCount, unreadCount } = useChatStore()

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
            setUnreadCount(unreadCount + 1)
          }

          addMessage(newMessage)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [householdId, addMessage, setUnreadCount, unreadCount])
}
