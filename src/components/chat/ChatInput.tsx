"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Send, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Message } from "@/lib/supabase/types"

interface ChatInputProps {
  onSend: (content: string) => void
  onEdit?: (id: string, content: string) => void
  onCancelEdit?: () => void
  onTyping?: (isTyping: boolean) => void
  editingMessage?: Message | null
  disabled?: boolean
}

export function ChatInput({ onSend, onEdit, onCancelEdit, onTyping, editingMessage, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Pre-fill input when editing
  useEffect(() => {
    if (editingMessage) {
      setMessage(editingMessage.content)
      inputRef.current?.focus()
    }
  }, [editingMessage])

  const handleTyping = useCallback(() => {
    if (!onTyping) return
    onTyping(true)
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false)
    }, 2000)
  }, [onTyping])

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    }
  }, [])

  const handleSend = () => {
    const trimmed = message.trim()
    if (!trimmed) return

    if (editingMessage && onEdit) {
      onEdit(editingMessage.id, trimmed)
    } else {
      onSend(trimmed)
    }

    setMessage("")
    if (onTyping) onTyping(false)
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
  }

  const handleCancel = () => {
    setMessage("")
    onCancelEdit?.()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
    if (e.key === "Escape" && editingMessage) {
      handleCancel()
    }
  }

  return (
    <div className="border-t border-[#2A2D3A] bg-[#0F1117]">
      {editingMessage && (
        <div className="flex items-center gap-2 border-b border-[#2A2D3A] bg-blue-500/5 px-4 py-2">
          <div className="h-0.5 w-0.5 rounded-full bg-blue-400" />
          <span className="text-xs text-blue-400">Editing message</span>
          <button onClick={handleCancel} className="ml-auto text-[#94A3B8] hover:text-white">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      <div className="flex items-center gap-2 px-4 py-3">
        <Input
          ref={inputRef}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value)
            handleTyping()
          }}
          onKeyDown={handleKeyDown}
          placeholder={editingMessage ? "Edit your message..." : "Type a message..."}
          className="border-[#2A2D3A] bg-[#1A1D27] text-white placeholder:text-[#94A3B8]"
          disabled={disabled}
        />
        <Button
          size="icon"
          className={`flex-shrink-0 text-white ${
            editingMessage
              ? "bg-blue-500 hover:bg-blue-600"
              : "bg-emerald-500 hover:bg-emerald-600"
          }`}
          onClick={handleSend}
          disabled={disabled || !message.trim()}
        >
          {editingMessage ? (
            <Check className="h-4 w-4" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  )
}
