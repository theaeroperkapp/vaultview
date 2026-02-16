"use client"

import { Card } from "@/components/ui/card"
import { ChatPanel } from "@/components/chat/ChatPanel"

export default function ChatPage() {
  return (
    <div className="animate-slide-in">
      <Card className="glass-card overflow-hidden">
        <ChatPanel />
      </Card>
    </div>
  )
}
