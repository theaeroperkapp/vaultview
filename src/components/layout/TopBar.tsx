"use client"

import { useCallback, useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useChatStore } from "@/stores/chatStore"
import { useNotificationStore } from "@/stores/notificationStore"
import { useNotifications } from "@/hooks/useNotifications"
import { useNotificationRealtime } from "@/hooks/useNotificationRealtime"
import { Badge } from "@/components/ui/badge"
import { NotificationDropdown } from "@/components/layout/NotificationDropdown"
import type { Profile } from "@/lib/supabase/types"

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/budget": "Budget Editor",
  "/analytics": "Analytics",
  "/net-worth": "Net Worth",
  "/year-overview": "Year Overview",
  "/chat": "Household Chat",
  "/settings": "Settings",
  "/requests": "Purchase Requests",
}

export function TopBar() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [showNotifications, setShowNotifications] = useState(false)
  const { unreadCount: chatUnread, toggleDrawer } = useChatStore()
  const notifUnread = useNotificationStore((s) => s.unreadCount)
  const pathname = usePathname()

  useNotifications()
  useNotificationRealtime(profile?.id)

  const pageTitle = Object.entries(PAGE_TITLES).find(([path]) =>
    pathname.startsWith(path)
  )?.[1] || "VaultView"

  useEffect(() => {
    const supabase = createClient()
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()
        if (data) setProfile(data)
      }
    }
    fetchProfile()
  }, [])

  const handleCloseNotifications = useCallback(() => {
    setShowNotifications(false)
  }, [])

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#2A2D3A]/50 bg-[#0F1117]/60 px-6 backdrop-blur-xl">
      <h1
        className="text-lg font-semibold text-white/90"
        style={{ fontFamily: 'var(--font-playfair)' }}
      >
        {pageTitle}
      </h1>
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="relative text-[#94A3B8] hover:text-white"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell className="h-5 w-5" />
            {notifUnread > 0 && (
              <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-emerald-500 p-0 text-[10px]">
                {notifUnread > 9 ? "9+" : notifUnread}
              </Badge>
            )}
          </Button>
          {showNotifications && (
            <NotificationDropdown onClose={handleCloseNotifications} />
          )}
        </div>

        {/* Chat Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="relative text-[#94A3B8] hover:text-white"
          onClick={toggleDrawer}
        >
          <MessageCircle className="h-5 w-5" />
          {chatUnread > 0 && (
            <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-emerald-500 p-0 text-[10px]">
              {chatUnread}
            </Badge>
          )}
        </Button>

        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-emerald-500/20 text-emerald-500 text-xs">
              {profile?.display_name?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-[#F1F5F9]">
            {profile?.display_name || "User"}
          </span>
        </div>
      </div>
    </header>
  )
}
