"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/utils/currency"

interface InlineEditCellProps {
  value: number
  onSave: (value: number) => void
  className?: string
}

export function InlineEditCell({ value, onSave, className }: InlineEditCellProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value.toString())
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleSave = () => {
    const num = parseFloat(editValue.replace(/[$,]/g, ""))
    if (!isNaN(num) && num !== value) {
      onSave(num)
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault()
      handleSave()
    }
    if (e.key === "Escape") {
      setEditValue(value.toString())
      setIsEditing(false)
    }
  }

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={cn(
          "w-full rounded border border-emerald-500 bg-[#0F1117] px-2 py-1 text-right text-sm tabular-nums text-white outline-none",
          className
        )}
      />
    )
  }

  return (
    <button
      onClick={() => {
        setEditValue(value.toString())
        setIsEditing(true)
      }}
      className={cn(
        "w-full cursor-pointer rounded px-2 py-1 text-right text-sm tabular-nums transition-colors hover:bg-[#2A2D3A]",
        className
      )}
    >
      {formatCurrency(value)}
    </button>
  )
}
