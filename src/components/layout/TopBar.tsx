"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, MessageCircle, Menu, Settings, LogOut, User, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useChatStore } from "@/stores/chatStore"
import { useSidebarStore } from "@/stores/sidebarStore"
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
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement>(null)
  const { unreadCount: chatUnread, toggleDrawer } = useChatStore()
  const toggleMobile = useSidebarStore((s) => s.toggleMobile)
  const notifUnread = useNotificationStore((s) => s.unreadCount)
  const pathname = usePathname()
  const router = useRouter()

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

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  // Close profile menu on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false)
      }
    }
    if (showProfileMenu) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showProfileMenu])

  return (
    <header className="sticky top-0 z-30 flex h-14 md:h-16 items-center justify-between border-b border-[#2A2D3A]/50 bg-[#0F1117]/60 px-3 md:px-6 backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-[#94A3B8] hover:text-white"
          onClick={toggleMobile}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1
          className="text-base md:text-lg font-semibold text-white/90"
          style={{ fontFamily: 'var(--font-playfair)' }}
        >
          {pageTitle}
        </h1>
      </div>
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

        {/* Chat Toggle — full page on mobile, drawer on desktop */}
        <Button
          variant="ghost"
          size="icon"
          className="relative text-[#94A3B8] hover:text-white"
          onClick={() => {
            if (window.innerWidth < 768) {
              router.push("/chat")
            } else {
              toggleDrawer()
            }
          }}
        >
          <MessageCircle className="h-5 w-5" />
          {chatUnread > 0 && (
            <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-emerald-500 p-0 text-[10px]">
              {chatUnread}
            </Badge>
          )}
        </Button>

        {/* Profile dropdown */}
        <div className="relative" ref={profileMenuRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-[#1A1D27]"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-emerald-500/20 text-emerald-500 text-xs">
                {profile?.display_name?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <span className="hidden md:inline text-sm font-medium text-[#F1F5F9]">
              {profile?.display_name || "User"}
            </span>
            <ChevronDown className="hidden md:block h-3.5 w-3.5 text-[#64748B]" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-[#2A2D3A] bg-[#0F1117]/95 shadow-2xl backdrop-blur-xl z-50 overflow-hidden">
              {/* User info header */}
              <div className="border-b border-[#2A2D3A] px-4 py-3">
                <p className="text-sm font-medium text-white">{profile?.display_name || "User"}</p>
                <p className="text-xs text-[#64748B] truncate">{profile?.email}</p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => { router.push("/settings"); setShowProfileMenu(false) }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[#94A3B8] transition-colors hover:bg-[#1A1D27] hover:text-white"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </button>
                <button
                  onClick={() => { router.push("/settings/members"); setShowProfileMenu(false) }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[#94A3B8] transition-colors hover:bg-[#1A1D27] hover:text-white"
                >
                  <User className="h-4 w-4" />
                  Manage Members
                </button>
              </div>

              <div className="border-t border-[#2A2D3A] py-1">
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-400 transition-colors hover:bg-red-500/10"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
