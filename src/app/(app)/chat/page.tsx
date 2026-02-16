"use client"

import { Card } from "@/components/ui/card"
import { ChatPanel } from "@/components/chat/ChatPanel"

export default function ChatPage() {
  return (
    <div className="animate-slide-in">
      <h1 className="mb-6 text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-playfair)' }}>
        Household Chat
      </h1>
      <Card className="border-[#2A2D3A] bg-[#1A1D27] overflow-hidden">
        <ChatPanel />
      </Card>
    </div>
  )
}
