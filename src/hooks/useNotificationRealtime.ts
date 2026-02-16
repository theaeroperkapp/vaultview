"use client"

import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useNotificationStore } from "@/stores/notificationStore"
import type { Notification } from "@/lib/supabase/types"

export function useNotificationRealtime(userId: string | undefined) {
  const addNotification = useNotificationStore((s) => s.addNotification)

  useEffect(() => {
    if (!userId) return

    const supabase = createClient()

    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          addNotification(payload.new as Notification)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, addNotification])
}
