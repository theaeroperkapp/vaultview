"use client"

import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useNotificationStore } from "@/stores/notificationStore"
import type { Notification } from "@/lib/supabase/types"

export function useNotifications() {
  const { setNotifications, setLoading } = useNotificationStore()

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true)
      const supabase = createClient()

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50)

      if (data) {
        setNotifications(data as Notification[])
      }

      setLoading(false)
    }

    fetchNotifications()
  }, [setNotifications, setLoading])
}
