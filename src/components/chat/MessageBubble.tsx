"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DollarSign, MoreHorizontal, Pencil, Trash2, SmilePlus } from "lucide-react"
import type { Message, Profile, Json } from "@/lib/supabase/types"

const EMOJI_MAP: Record<string, string> = {
  thumbs_up: "\u{1F44D}",
  heart: "\u{2764}\u{FE0F}",
  laugh: "\u{1F602}",
  sad: "\u{1F622}",
  fire: "\u{1F525}",
}

const EMOJI_KEYS = Object.keys(EMOJI_MAP)

interface MessageBubbleProps {
  message: Message
  sender: Profile | undefined
  isOwn: boolean
  currentUserId: string
  onEditRequest?: (message: Message) => void
  onDeleteRequest?: (id: string) => void
  onReact?: (messageId: string, emoji: string) => void
}

function getReactions(metadata: Json | null): Record<string, string[]> {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return {}
  const m = metadata as Record<string, Json | undefined>
  const reactions = m.reactions
  if (!reactions || typeof reactions !== "object" || Array.isArray(reactions)) return {}
  return reactions as Record<string, string[]>
}

function ReactionsBar({
  reactions,
  messageId,
  currentUserId,
  onReact,
}: {
  reactions: Record<string, string[]>
  messageId: string
  currentUserId: string
  onReact?: (messageId: string, emoji: string) => void
}) {
  const entries = Object.entries(reactions).filter(([, ids]) => ids.length > 0)
  if (entries.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1 mt-1 px-1">
      {entries.map(([key, userIds]) => {
        const isOwn = userIds.includes(currentUserId)
        return (
          <button
            key={key}
            onClick={() => onReact?.(messageId, key)}
            className={cn(
              "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs transition-colors",
              isOwn
                ? "border border-emerald-500/40 bg-emerald-500/20 text-emerald-400"
                : "border border-[#2A2D3A] bg-[#1A1D27] text-[#94A3B8] hover:bg-[#2A2D3A]"
            )}
          >
            <span>{EMOJI_MAP[key] || key}</span>
            <span>{userIds.length}</span>
          </button>
        )
      })}
    </div>
  )
}

function ReactionPicker({ onSelect }: { onSelect: (emoji: string) => void }) {
  return (
    <div className="flex gap-1 rounded-lg border border-[#2A2D3A] bg-[#0F1117] px-2 py-1 shadow-xl">
      {EMOJI_KEYS.map((key) => (
        <button
          key={key}
          onClick={() => onSelect(key)}
          className="rounded p-1 text-base transition-colors hover:bg-[#1A1D27]"
        >
          {EMOJI_MAP[key]}
        </button>
      ))}
    </div>
  )
}

export function MessageBubble({
  message,
  sender,
  isOwn,
  currentUserId,
  onEditRequest,
  onDeleteRequest,
  onReact,
}: MessageBubbleProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [showReactionPicker, setShowReactionPicker] = useState(false)

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

  const metadata = message.metadata as Record<string, Json | undefined> | null
  const isEdited = metadata?.edited === true
  const reactions = getReactions(message.metadata)

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

  const handleReact = (emoji: string) => {
    onReact?.(message.id, emoji)
    setShowReactionPicker(false)
  }

  return (
    <div
      className={cn("group my-2 flex items-end gap-2", isOwn ? "flex-row-reverse" : "flex-row")}
      onMouseLeave={() => {
        setShowMenu(false)
        setShowReactionPicker(false)
      }}
    >
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
        <div className="relative">
          {/* Action buttons — visible on hover */}
          <div className={cn(
            "absolute top-0 z-10 flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100",
            isOwn ? "left-0 -translate-x-full pr-1" : "right-0 translate-x-full pl-1"
          )}>
            <button
              onClick={() => setShowReactionPicker(!showReactionPicker)}
              className="rounded p-1 text-[#64748B] transition-colors hover:bg-[#1A1D27] hover:text-white"
            >
              <SmilePlus className="h-3.5 w-3.5" />
            </button>
            {isOwn && (
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="rounded p-1 text-[#64748B] transition-colors hover:bg-[#1A1D27] hover:text-white"
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Context menu */}
          {showMenu && isOwn && (
            <div className={cn(
              "absolute top-6 z-20 w-32 overflow-hidden rounded-lg border border-[#2A2D3A] bg-[#0F1117] shadow-xl",
              isOwn ? "left-0 -translate-x-full" : "right-0 translate-x-full"
            )}>
              <button
                onClick={() => {
                  onEditRequest?.(message)
                  setShowMenu(false)
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs text-[#94A3B8] transition-colors hover:bg-[#1A1D27] hover:text-white"
              >
                <Pencil className="h-3 w-3" />
                Edit
              </button>
              <button
                onClick={() => {
                  onDeleteRequest?.(message.id)
                  setShowMenu(false)
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-400 transition-colors hover:bg-red-500/10"
              >
                <Trash2 className="h-3 w-3" />
                Delete
              </button>
            </div>
          )}

          {/* Reaction picker */}
          {showReactionPicker && (
            <div className={cn(
              "absolute -top-10 z-20",
              isOwn ? "right-0" : "left-0"
            )}>
              <ReactionPicker onSelect={handleReact} />
            </div>
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
        </div>

        <ReactionsBar
          reactions={reactions}
          messageId={message.id}
          currentUserId={currentUserId}
          onReact={onReact}
        />

        <span className={cn("text-[10px] text-[#94A3B8] px-1", isOwn ? "text-right" : "text-left")}>
          {formatTime(message.created_at)}
          {isEdited && <span className="ml-1 text-[#64748B]">(edited)</span>}
        </span>
      </div>
    </div>
  )
}
