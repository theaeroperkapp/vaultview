"use client"

import { useState } from "react"
import { StickyNote } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ItemNotePopoverProps {
  itemId: string
  notes: string | null
  onSave: (id: string, notes: string) => void
}

export function ItemNotePopover({ itemId, notes, onSave }: ItemNotePopoverProps) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(notes || "")

  const handleSave = () => {
    onSave(itemId, value)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (o) setValue(notes || "") }}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded transition-opacity",
            notes
              ? "text-emerald-400"
              : "text-[#94A3B8] opacity-0 group-hover:opacity-100"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <StickyNote className="h-3.5 w-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-64 border-[#2A2D3A] bg-[#1A1D27] p-3"
        align="end"
        onClick={(e) => e.stopPropagation()}
      >
        <textarea
          rows={3}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Add a note..."
          className="w-full resize-none rounded border border-[#2A2D3A] bg-[#0F1117] px-2 py-1.5 text-sm text-white placeholder:text-[#64748B] outline-none focus:border-emerald-500"
        />
        <div className="mt-2 flex justify-end">
          <Button
            size="sm"
            className="h-7 bg-emerald-500 text-xs text-white hover:bg-emerald-600"
            onClick={handleSave}
          >
            Save
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
