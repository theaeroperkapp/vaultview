"use client"

import { useEffect, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useHousehold } from "@/hooks/useHousehold"
import { useChatRealtime } from "@/hooks/useChatRealtime"
import { useChatStore } from "@/stores/chatStore"
import { MessageBubble } from "./MessageBubble"
import { ChatInput } from "./ChatInput"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle } from "lucide-react"
import type { Profile } from "@/lib/supabase/types"

interface ChatPanelProps {
  isDrawer?: boolean
}

export function ChatPanel({ isDrawer }: ChatPanelProps) {
  const { household } = useHousehold()
  const { messages, setMessages, profiles, setProfiles, setLoading } = useChatStore()
  const [currentUserId, setCurrentUserId] = useState<string>("")
  const scrollRef = useRef<HTMLDivElement>(null)

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
      console.error("Failed to send message:", error)
    }
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
              />
            ))}
          </div>
        )}
      </ScrollArea>
      <ChatInput onSend={handleSend} disabled={!household} />
    </div>
  )
}
