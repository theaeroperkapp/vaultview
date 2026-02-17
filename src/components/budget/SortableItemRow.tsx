"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { TableCell, TableRow } from "@/components/ui/table"
import { InlineEditCell } from "./InlineEditCell"
import { ItemNotePopover } from "./ItemNotePopover"
import { DifferenceDisplay } from "@/components/shared/CurrencyDisplay"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { GripVertical, Trash2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { BudgetItem } from "@/lib/supabase/types"

interface SortableItemRowProps {
  item: BudgetItem
  categoryColor: string
  onUpdateItem: (id: string, field: "planned_amount" | "actual_amount", value: number) => void
  onDeleteItem: (id: string) => void
  onToggleComplete: (id: string, completed: boolean) => void
  onUpdateNote?: (id: string, notes: string) => void
}

export function SortableItemRow({ item, categoryColor, onUpdateItem, onDeleteItem, onToggleComplete, onUpdateNote }: SortableItemRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    borderLeft: `2px solid ${categoryColor}20`,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={`group border-[#2A2D3A] hover:bg-[#1E2130] ${item.is_completed ? "opacity-60" : ""}`}
    >
      <TableCell className="pl-4 text-sm text-white">
        <div className="flex items-center gap-2">
          <button
            className="cursor-grab touch-none text-[#94A3B8] opacity-0 group-hover:opacity-100 hover:text-white"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <button
            onClick={() => onToggleComplete(item.id, !item.is_completed)}
            className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded border transition-colors ${
              item.is_completed
                ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
                : "border-[#2A2D3A] hover:border-[#94A3B8]"
            }`}
          >
            {item.is_completed && <Check className="h-3 w-3" />}
          </button>
          <span className={item.is_completed ? "line-through text-[#94A3B8]" : ""}>{item.name}</span>
        </div>
      </TableCell>
      <TableCell className="w-36 p-0">
        <InlineEditCell
          value={Number(item.planned_amount)}
          onSave={(v) => onUpdateItem(item.id, "planned_amount", v)}
          className="text-[#94A3B8]"
        />
      </TableCell>
      <TableCell className="w-36 p-0">
        <InlineEditCell
          value={Number(item.actual_amount)}
          onSave={(v) => onUpdateItem(item.id, "actual_amount", v)}
          className="text-white"
        />
      </TableCell>
      <TableCell className="text-right">
        <DifferenceDisplay
          planned={Number(item.planned_amount)}
          actual={Number(item.actual_amount)}
        />
      </TableCell>
      <TableCell className="text-center">
        <StatusBadge
          planned={Number(item.planned_amount)}
          actual={Number(item.actual_amount)}
        />
      </TableCell>
      <TableCell className="w-20 p-1">
        <div className="flex items-center justify-end gap-0.5">
          {onUpdateNote && (
            <ItemNotePopover
              itemId={item.id}
              notes={item.notes}
              onSave={onUpdateNote}
            />
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100 text-[#94A3B8] hover:text-red-400"
            onClick={() => onDeleteItem(item.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}
