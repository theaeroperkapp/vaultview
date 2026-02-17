"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { TableCell, TableRow } from "@/components/ui/table"
import { GripVertical, ChevronDown, ChevronRight } from "lucide-react"
import { formatCurrency } from "@/lib/utils/currency"
import type { BudgetCategory } from "@/lib/supabase/types"

interface SortableCategoryHeaderProps {
  category: BudgetCategory
  collapsed: boolean
  onToggleCollapse: () => void
  subtotalPlanned: number
  subtotalActual: number
  pct: number
}

export function SortableCategoryHeader({ category, collapsed, onToggleCollapse, subtotalPlanned, subtotalActual, pct }: SortableCategoryHeaderProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className="border-[#2A2D3A] bg-[#0F1117]/50 hover:bg-[#0F1117]/60 cursor-pointer"
      onClick={onToggleCollapse}
    >
      <TableCell colSpan={6} className="px-4 py-2.5">
        <div className="flex items-center gap-2">
          <button
            className="cursor-grab touch-none text-[#94A3B8] hover:text-white"
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          {collapsed ? (
            <ChevronRight className="h-4 w-4 text-[#94A3B8]" />
          ) : (
            <ChevronDown className="h-4 w-4 text-[#94A3B8]" />
          )}
          <div
            className="h-3 w-1 rounded-full"
            style={{ backgroundColor: category.color || "#6366F1" }}
          />
          <span className="text-sm font-semibold text-white">{category.name}</span>

          <div className="ml-4 h-1.5 w-24 overflow-hidden rounded-full bg-[#2A2D3A]">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(pct, 100)}%`,
                backgroundColor: pct > 100 ? '#EF4444' : pct >= 80 ? '#F59E0B' : (category.color || '#10B981'),
              }}
            />
          </div>

          <span className="ml-auto text-xs tabular-nums text-[#94A3B8]">
            {formatCurrency(subtotalActual)} / {formatCurrency(subtotalPlanned)}
          </span>
        </div>
      </TableCell>
    </TableRow>
  )
}
