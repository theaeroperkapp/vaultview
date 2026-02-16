"use client"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DollarSign } from "lucide-react"
import type { Message, Profile } from "@/lib/supabase/types"

interface MessageBubbleProps {
  message: Message
  sender: Profile | undefined
  isOwn: boolean
}

export function MessageBubble({ message, sender, isOwn }: MessageBubbleProps) {
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return "just now"
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  if (message.message_type === "budget_alert") {
    return (
      <div className="my-2 flex items-center justify-center">
        <div className="flex items-center gap-2 rounded-full bg-amber-500/10 px-4 py-1.5">
          <DollarSign className="h-3.5 w-3.5 text-amber-400" />
          <span className="text-xs italic text-amber-400">{message.content}</span>
        </div>
      </div>
    )
  }

  if (message.message_type === "system") {
    return (
      <div className="my-2 flex items-center justify-center">
        <span className="text-xs italic text-[#94A3B8]">{message.content}</span>
      </div>
    )
  }

  return (
    <div className={cn("my-2 flex items-end gap-2", isOwn ? "flex-row-reverse" : "flex-row")}>
      {!isOwn && (
        <Avatar className="h-7 w-7">
          <AvatarImage src={sender?.avatar_url || undefined} />
          <AvatarFallback className="bg-emerald-500/20 text-emerald-500 text-[10px]">
            {sender?.display_name?.charAt(0)?.toUpperCase() || "?"}
          </AvatarFallback>
        </Avatar>
      )}
      <div className={cn("max-w-[75%] space-y-1", isOwn ? "items-end" : "items-start")}>
        {!isOwn && (
          <span className="text-[10px] font-medium text-[#94A3B8] px-1">
            {sender?.display_name || "Unknown"}
          </span>
        )}
        <div
          className={cn(
            "rounded-2xl px-4 py-2 text-sm",
            isOwn
              ? "rounded-br-md bg-emerald-500 text-white"
              : "rounded-bl-md bg-[#1E2130] text-white"
          )}
        >
          {message.image_url && (
            <img
              src={message.image_url}
              alt="Shared image"
              className="mb-2 max-h-48 rounded-lg object-cover"
            />
          )}
          <p>{message.content}</p>
        </div>
        <span className={cn("text-[10px] text-[#94A3B8] px-1", isOwn ? "text-right" : "text-left")}>
          {formatTime(message.created_at)}
        </span>
      </div>
    </div>
  )
}
