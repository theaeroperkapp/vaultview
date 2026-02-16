"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle, DollarSign } from "lucide-react"
import type { Message } from "@/lib/supabase/types"

interface ActivityFeedProps {
  householdId: string | undefined
}

export function ActivityFeed({ householdId }: ActivityFeedProps) {
  const [messages, setMessages] = useState<Message[]>([])

  useEffect(() => {
    if (!householdId) return

    const supabase = createClient()
    const fetchRecent = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("household_id", householdId)
        .order("created_at", { ascending: false })
        .limit(10)

      setMessages(data || [])
    }
    fetchRecent()
  }, [householdId])

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return "just now"
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    return date.toLocaleDateString()
  }

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-white">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[240px]">
          {messages.length === 0 ? (
            <div className="flex h-[200px] items-center justify-center text-sm text-[#94A3B8]">
              No activity yet
            </div>
          ) : (
            <div className="space-y-0 px-4">
              {messages.map((msg) => (
                <div key={msg.id} className="flex items-start gap-3 border-b border-[#2A2D3A]/50 py-3 last:border-0">
                  <div className={`mt-0.5 rounded-full p-1.5 ${
                    msg.message_type === "budget_alert"
                      ? "bg-amber-500/10"
                      : "bg-emerald-500/10"
                  }`}>
                    {msg.message_type === "budget_alert" ? (
                      <DollarSign className="h-3.5 w-3.5 text-amber-400" />
                    ) : (
                      <MessageCircle className="h-3.5 w-3.5 text-emerald-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{msg.content}</p>
                    <p className="text-xs text-[#94A3B8]">{formatTime(msg.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
