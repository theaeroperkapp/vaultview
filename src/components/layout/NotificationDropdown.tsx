"use client"

import { useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  ShoppingCart,
  ThumbsUp,
  CheckCircle2,
  XCircle,
  Plus,
  Pencil,
  Trash2,
  CheckCheck,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useNotificationStore } from "@/stores/notificationStore"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import type { Notification } from "@/lib/supabase/types"

const TYPE_CONFIG: Record<
  Notification["type"],
  { icon: React.ElementType; color: string; href: string }
> = {
  request_new: { icon: ShoppingCart, color: "text-blue-400", href: "/requests" },
  request_vote: { icon: ThumbsUp, color: "text-amber-400", href: "/requests" },
  request_approved: { icon: CheckCircle2, color: "text-emerald-400", href: "/requests" },
  request_denied: { icon: XCircle, color: "text-red-400", href: "/requests" },
  budget_add: { icon: Plus, color: "text-emerald-400", href: "/budget" },
  budget_edit: { icon: Pencil, color: "text-blue-400", href: "/budget" },
  budget_remove: { icon: Trash2, color: "text-red-400", href: "/budget" },
}

function getRelativeTime(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = Math.floor((now - then) / 1000)

  if (diff < 60) return "just now"
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

interface NotificationDropdownProps {
  onClose: () => void
}

export function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const router = useRouter()
  const ref = useRef<HTMLDivElement>(null)
  const { notifications, markRead, markAllRead } = useNotificationStore()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [onClose])

  const handleClick = async (notification: Notification) => {
    if (!notification.is_read) {
      markRead(notification.id)
      const supabase = createClient()
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notification.id)
    }
    const config = TYPE_CONFIG[notification.type]
    router.push(config.href)
    onClose()
  }

  const handleMarkAllRead = async () => {
    markAllRead()
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false)
    }
  }

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-96 rounded-xl border border-[#2A2D3A] bg-[#0F1117]/95 shadow-2xl backdrop-blur-xl z-50"
    >
      <div className="flex items-center justify-between border-b border-[#2A2D3A] px-4 py-3">
        <h3 className="text-sm font-semibold text-white">Notifications</h3>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 text-xs text-[#94A3B8] hover:text-white"
          onClick={handleMarkAllRead}
        >
          <CheckCheck className="h-3.5 w-3.5" />
          Mark all read
        </Button>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-[#94A3B8]">
            No notifications yet
          </div>
        ) : (
          notifications.map((n) => {
            const config = TYPE_CONFIG[n.type]
            const Icon = config.icon
            return (
              <button
                key={n.id}
                onClick={() => handleClick(n)}
                className={cn(
                  "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[#1A1D27]",
                  !n.is_read && "border-l-2 border-emerald-500"
                )}
              >
                <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", config.color)} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{n.title}</p>
                  {n.body && (
                    <p className="truncate text-xs text-[#94A3B8]">{n.body}</p>
                  )}
                  <p className="mt-0.5 text-xs text-[#64748B]">
                    {getRelativeTime(n.created_at)}
                  </p>
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
