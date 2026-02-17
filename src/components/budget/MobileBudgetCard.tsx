"use client"

import { InlineEditCell } from "./InlineEditCell"
import { ItemNotePopover } from "./ItemNotePopover"
import { Check, Trash2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils/currency"
import { cn } from "@/lib/utils"
import type { BudgetItem } from "@/lib/supabase/types"

interface MobileBudgetCardProps {
  item: BudgetItem
  categoryColor: string
  onUpdateItem: (id: string, field: "planned_amount" | "actual_amount", value: number) => void
  onDeleteItem: (id: string) => void
  onToggleComplete: (id: string, completed: boolean) => void
  onUpdateNote?: (id: string, notes: string) => void
}

export function MobileBudgetCard({ item, categoryColor, onUpdateItem, onDeleteItem, onToggleComplete, onUpdateNote }: MobileBudgetCardProps) {
  const planned = Number(item.planned_amount)
  const actual = Number(item.actual_amount)
  const diff = planned - actual
  const pct = planned > 0 ? (actual / planned) * 100 : 0

  return (
    <div
      className={cn(
        "group rounded-xl border border-[#2A2D3A] bg-[#1A1D27]/60 p-3 transition-colors",
        item.is_completed && "opacity-60"
      )}
      style={{ borderLeftWidth: 3, borderLeftColor: categoryColor }}
    >
      {/* Top row: checkbox + name + actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onToggleComplete(item.id, !item.is_completed)}
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
            item.is_completed
              ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
              : "border-[#2A2D3A]"
          )}
        >
          {item.is_completed && <Check className="h-3 w-3" />}
        </button>
        <span className={cn("flex-1 text-sm font-medium text-white", item.is_completed && "line-through text-[#94A3B8]")}>
          {item.name}
        </span>
        <div className="flex items-center gap-1">
          {onUpdateNote && (
            <ItemNotePopover itemId={item.id} notes={item.notes} onSave={onUpdateNote} />
          )}
          <button
            onClick={() => onDeleteItem(item.id)}
            className="flex h-7 w-7 items-center justify-center rounded text-[#94A3B8] transition-colors hover:text-red-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#2A2D3A]">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.min(pct, 100)}%`,
            backgroundColor: pct > 100 ? '#EF4444' : pct >= 80 ? '#F59E0B' : categoryColor,
          }}
        />
      </div>

      {/* Amounts row */}
      <div className="mt-2.5 grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[#64748B]">Planned</p>
          <div className="mt-0.5">
            <InlineEditCell
              value={planned}
              onSave={(v) => onUpdateItem(item.id, "planned_amount", v)}
              className="text-[#94A3B8] text-xs"
            />
          </div>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[#64748B]">Actual</p>
          <div className="mt-0.5">
            <InlineEditCell
              value={actual}
              onSave={(v) => onUpdateItem(item.id, "actual_amount", v)}
              className="text-white text-xs"
            />
          </div>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[#64748B]">Diff</p>
          <p className={cn(
            "mt-0.5 text-xs font-semibold tabular-nums",
            diff >= 0 ? "text-emerald-400" : "text-red-400"
          )}>
            {diff >= 0 ? "+" : ""}{formatCurrency(diff)}
          </p>
        </div>
      </div>
    </div>
  )
}
