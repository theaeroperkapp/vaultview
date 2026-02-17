"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { MobileBudgetCard } from "./MobileBudgetCard"
import { AddItemRow } from "./AddItemRow"
import { formatCurrency } from "@/lib/utils/currency"
import type { BudgetCategory, BudgetItem } from "@/lib/supabase/types"

interface MobileCategoryGroupProps {
  category: BudgetCategory
  items: BudgetItem[]
  onUpdateItem: (id: string, field: "planned_amount" | "actual_amount", value: number) => void
  onAddItem: (categoryId: string, name: string) => void
  onDeleteItem: (id: string) => void
  onToggleComplete: (id: string, completed: boolean) => void
  onUpdateNote?: (id: string, notes: string) => void
}

export function MobileCategoryGroup({ category, items, onUpdateItem, onAddItem, onDeleteItem, onToggleComplete, onUpdateNote }: MobileCategoryGroupProps) {
  const [collapsed, setCollapsed] = useState(false)
  const subtotalPlanned = items.reduce((s, i) => s + Number(i.planned_amount), 0)
  const subtotalActual = items.reduce((s, i) => s + Number(i.actual_amount), 0)
  const pct = subtotalPlanned > 0 ? (subtotalActual / subtotalPlanned) * 100 : 0

  return (
    <div className="overflow-hidden rounded-xl border border-[#2A2D3A] bg-[#0F1117]/40">
      {/* Category header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex w-full items-center gap-2.5 px-3.5 py-3 active:bg-[#1A1D27]"
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4 text-[#94A3B8]" />
        ) : (
          <ChevronDown className="h-4 w-4 text-[#94A3B8]" />
        )}
        <div
          className="h-3.5 w-1.5 rounded-full"
          style={{ backgroundColor: category.color || "#6366F1" }}
        />
        <span className="flex-1 text-left text-sm font-semibold text-white">{category.name}</span>

        {/* Mini amounts */}
        <div className="text-right">
          <p className="text-xs tabular-nums text-white">
            {formatCurrency(subtotalActual)}
            <span className="text-[#64748B]"> / {formatCurrency(subtotalPlanned)}</span>
          </p>
          {/* Mini progress */}
          <div className="mt-1 h-1 w-16 overflow-hidden rounded-full bg-[#2A2D3A]">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(pct, 100)}%`,
                backgroundColor: pct > 100 ? '#EF4444' : pct >= 80 ? '#F59E0B' : (category.color || '#10B981'),
              }}
            />
          </div>
        </div>
      </button>

      {/* Items */}
      {!collapsed && (
        <div className="space-y-2 px-3 pb-3">
          {items.map((item) => (
            <MobileBudgetCard
              key={item.id}
              item={item}
              categoryColor={category.color || "#6366F1"}
              onUpdateItem={onUpdateItem}
              onDeleteItem={onDeleteItem}
              onToggleComplete={onToggleComplete}
              onUpdateNote={onUpdateNote}
            />
          ))}
          <AddItemRow onAdd={(name) => onAddItem(category.id, name)} />
        </div>
      )}
    </div>
  )
}
