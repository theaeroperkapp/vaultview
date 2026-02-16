"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface AddItemRowProps {
  onAdd: (name: string) => void
}

export function AddItemRow({ onAdd }: AddItemRowProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [name, setName] = useState("")

  const handleSubmit = () => {
    if (name.trim()) {
      onAdd(name.trim())
      setName("")
      setIsAdding(false)
    }
  }

  if (!isAdding) {
    return (
      <button
        onClick={() => setIsAdding(true)}
        className="flex w-full items-center gap-2 px-8 py-2 text-sm text-[#94A3B8] transition-colors hover:bg-[#1E2130] hover:text-white"
      >
        <Plus className="h-3.5 w-3.5" />
        Add item
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2 px-8 py-2">
      <Input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSubmit()
          if (e.key === "Escape") { setIsAdding(false); setName("") }
        }}
        placeholder="Item name..."
        className="h-8 border-[#2A2D3A] bg-[#0F1117] text-sm text-white placeholder:text-[#94A3B8]"
      />
      <Button size="sm" className="h-8 bg-emerald-500 text-white hover:bg-emerald-600" onClick={handleSubmit}>
        Add
      </Button>
      <Button size="sm" variant="ghost" className="h-8 text-[#94A3B8]" onClick={() => { setIsAdding(false); setName("") }}>
        Cancel
      </Button>
    </div>
  )
}
