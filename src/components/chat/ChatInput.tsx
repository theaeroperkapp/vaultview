"use client"

import { useState } from "react"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ChatInputProps {
  onSend: (content: string) => void
  disabled?: boolean
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("")

  const handleSend = () => {
    const trimmed = message.trim()
    if (!trimmed) return
    onSend(trimmed)
    setMessage("")
  }

  return (
    <div className="flex items-center gap-2 border-t border-[#2A2D3A] bg-[#0F1117] px-4 py-3">
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() } }}
        placeholder="Type a message..."
        className="border-[#2A2D3A] bg-[#1A1D27] text-white placeholder:text-[#94A3B8]"
        disabled={disabled}
      />
      <Button
        size="icon"
        className="bg-emerald-500 text-white hover:bg-emerald-600 flex-shrink-0"
        onClick={handleSend}
        disabled={disabled || !message.trim()}
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  )
}
