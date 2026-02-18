"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useHousehold } from "@/hooks/useHousehold"
import { useChatRealtime } from "@/hooks/useChatRealtime"
import { useChatStore } from "@/stores/chatStore"
import { MessageBubble } from "./MessageBubble"
import { ChatInput } from "./ChatInput"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle } from "lucide-react"
import { toast } from "sonner"
import type { Message, Profile, Json } from "@/lib/supabase/types"

interface ChatPanelProps {
  isDrawer?: boolean
}

export function ChatPanel({ isDrawer }: ChatPanelProps) {
  const { household } = useHousehold()
  const {
    messages,
    setMessages,
    profiles,
    setProfiles,
    isLoading,
    setLoading,
    updateMessage,
    deleteMessage,
  } = useChatStore()
  const [currentUserId, setCurrentUserId] = useState<string>("")
  const [editingMessage, setEditingMessage] = useState<Message | null>(null)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const presenceChannelRef = useRef<ReturnType<ReturnType<typeof createClient>["channel"]> | null>(null)

  useChatRealtime(household?.id)

  useEffect(() => {
    if (!household) return

    const supabase = createClient()

    const fetchData = async () => {
      setLoading(true)

      const { data: { user } } = await supabase.auth.getUser()
      if (user) setCurrentUserId(user.id)

      // Fetch messages
      const { data: msgs } = await supabase
        .from("messages")
        .select("*")
        .eq("household_id", household.id)
        .order("created_at", { ascending: true })
        .limit(100)

      setMessages(msgs || [])

      // Fetch member profiles
      const { data: members } = await supabase
        .from("household_members")
        .select("user_id")
        .eq("household_id", household.id)

      if (members) {
        const userIds = members.map((m) => m.user_id)
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .in("id", userIds)

        const profileMap: Record<string, Profile> = {}
        for (const p of profileData || []) {
          profileMap[p.id] = p
        }
        setProfiles(profileMap)
      }

      setLoading(false)
    }

    fetchData()
  }, [household, setMessages, setProfiles, setLoading])

  // Typing presence channel
  useEffect(() => {
    if (!household?.id || !currentUserId) return

    const supabase = createClient()
    const channel = supabase.channel(`typing:${household.id}`)

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState()
        const typing: string[] = []
        for (const presences of Object.values(state)) {
          for (const p of presences as unknown as Array<{ user_id: string; display_name: string; is_typing: boolean }>) {
            if (p.user_id !== currentUserId && p.is_typing) {
              typing.push(p.display_name)
            }
          }
        }
        setTypingUsers(typing)
      })
      .subscribe()

    presenceChannelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
      presenceChannelRef.current = null
    }
  }, [household?.id, currentUserId])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async (content: string) => {
    if (!household) return

    const supabase = createClient()
    const { error } = await supabase.from("messages").insert({
      household_id: household.id,
      sender_id: currentUserId,
      content,
      message_type: "text",
    })

    if (error) {
      toast.error("Failed to send message")
    }
  }

  const handleEdit = async (id: string, content: string) => {
    const msg = messages.find((m) => m.id === id)
    if (!msg) return

    const existingMeta = (msg.metadata && typeof msg.metadata === "object" && !Array.isArray(msg.metadata))
      ? msg.metadata as Record<string, Json | undefined>
      : {}
    const newMetadata = { ...existingMeta, edited: true }

    // Optimistic update
    updateMessage(id, { content, metadata: newMetadata as Json })
    setEditingMessage(null)

    const supabase = createClient()
    const { error } = await supabase
      .from("messages")
      .update({ content, metadata: newMetadata })
      .eq("id", id)

    if (error) {
      toast.error("Failed to edit message")
      // Revert
      updateMessage(id, { content: msg.content, metadata: msg.metadata })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this message?")) return

    const msg = messages.find((m) => m.id === id)
    // Optimistic delete
    deleteMessage(id)

    const supabase = createClient()
    const { error } = await supabase.from("messages").delete().eq("id", id)

    if (error) {
      toast.error("Failed to delete message")
      // Revert
      if (msg) useChatStore.getState().addMessage(msg)
    }
  }

  const handleReact = useCallback(async (messageId: string, emoji: string) => {
    const msg = messages.find((m) => m.id === messageId)
    if (!msg || !currentUserId) return

    const existingMeta = (msg.metadata && typeof msg.metadata === "object" && !Array.isArray(msg.metadata))
      ? msg.metadata as Record<string, Json | undefined>
      : {}
    const reactions = (existingMeta.reactions && typeof existingMeta.reactions === "object" && !Array.isArray(existingMeta.reactions))
      ? { ...existingMeta.reactions as Record<string, string[]> }
      : {} as Record<string, string[]>

    const userList = reactions[emoji] ? [...reactions[emoji]] : []
    const idx = userList.indexOf(currentUserId)
    if (idx >= 0) {
      userList.splice(idx, 1)
    } else {
      userList.push(currentUserId)
    }
    reactions[emoji] = userList

    // Clean up empty reactions
    if (userList.length === 0) delete reactions[emoji]

    const newMetadata = { ...existingMeta, reactions }

    // Optimistic update
    updateMessage(messageId, { metadata: newMetadata as Json })

    const supabase = createClient()
    const { error } = await supabase
      .from("messages")
      .update({ metadata: newMetadata })
      .eq("id", messageId)

    if (error) {
      toast.error("Failed to update reaction")
      updateMessage(messageId, { metadata: msg.metadata })
    }
  }, [messages, currentUserId, updateMessage])

  const handleTyping = useCallback((isTyping: boolean) => {
    if (!presenceChannelRef.current || !currentUserId) return
    presenceChannelRef.current.track({
      user_id: currentUserId,
      display_name: profiles[currentUserId]?.display_name || "Someone",
      is_typing: isTyping,
    })
  }, [currentUserId, profiles])

  if (isLoading) {
    return (
      <div className={`flex flex-col ${isDrawer ? "h-[calc(100vh-60px)]" : "h-[calc(100vh-8rem)] md:h-[calc(100vh-10rem)]"}`}>
        <div className="flex-1 px-4 py-4 space-y-4">
          <div className="flex items-end gap-2">
            <div className="h-7 w-7 rounded-full animate-shimmer shrink-0" />
            <div className="space-y-1">
              <div className="h-3 w-16 animate-shimmer rounded" />
              <div className="h-10 w-48 animate-shimmer rounded-2xl rounded-bl-md" />
              <div className="h-2 w-12 animate-shimmer rounded" />
            </div>
          </div>
          <div className="flex items-end gap-2 flex-row-reverse">
            <div className="space-y-1">
              <div className="h-10 w-56 animate-shimmer rounded-2xl rounded-br-md" />
              <div className="h-2 w-12 animate-shimmer rounded ml-auto" />
            </div>
          </div>
          <div className="flex items-end gap-2">
            <div className="h-7 w-7 rounded-full animate-shimmer shrink-0" />
            <div className="space-y-1">
              <div className="h-3 w-20 animate-shimmer rounded" />
              <div className="h-10 w-40 animate-shimmer rounded-2xl rounded-bl-md" />
              <div className="h-2 w-12 animate-shimmer rounded" />
            </div>
          </div>
          <div className="flex items-end gap-2 flex-row-reverse">
            <div className="space-y-1">
              <div className="h-10 w-44 animate-shimmer rounded-2xl rounded-br-md" />
              <div className="h-2 w-12 animate-shimmer rounded ml-auto" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 border-t border-[#2A2D3A] bg-[#0F1117] px-4 py-3">
          <div className="h-10 flex-1 animate-shimmer rounded-md" />
          <div className="h-10 w-10 animate-shimmer rounded-md" />
        </div>
      </div>
    )
  }

  return (
    <div className={`flex flex-col ${isDrawer ? "h-[calc(100vh-60px)]" : "h-[calc(100vh-8rem)] md:h-[calc(100vh-10rem)]"}`}>
      <ScrollArea className="flex-1 px-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center py-20 text-center">
            <MessageCircle className="mb-4 h-12 w-12 text-[#94A3B8]" />
            <h3 className="mb-1 text-lg font-semibold text-white">No messages yet</h3>
            <p className="text-sm text-[#94A3B8]">Start a conversation about your budget</p>
          </div>
        ) : (
          <div className="py-4">
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                sender={msg.sender_id ? profiles[msg.sender_id] : undefined}
                isOwn={msg.sender_id === currentUserId}
                currentUserId={currentUserId}
                onEditRequest={setEditingMessage}
                onDeleteRequest={handleDelete}
                onReact={handleReact}
              />
            ))}
          </div>
        )}
      </ScrollArea>
      {typingUsers.length > 0 && (
        <div className="px-4 py-1.5 border-t border-[#2A2D3A]/30">
          <span className="text-xs italic text-[#94A3B8]">
            {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
          </span>
        </div>
      )}
      <ChatInput
        onSend={handleSend}
        onEdit={handleEdit}
        onCancelEdit={() => setEditingMessage(null)}
        onTyping={handleTyping}
        editingMessage={editingMessage}
        disabled={!household}
      />
    </div>
  )
}
