"use client"

import React, { useState } from "react"
import { TableCell, TableRow } from "@/components/ui/table"
import { InlineEditCell } from "./InlineEditCell"
import { AddItemRow } from "./AddItemRow"
import { SortableItemRow } from "./SortableItemRow"
import { SortableCategoryHeader } from "./SortableCategoryHeader"
import { DifferenceDisplay } from "@/components/shared/CurrencyDisplay"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { formatCurrency } from "@/lib/utils/currency"
import { Trash2, ChevronDown, ChevronRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ItemNotePopover } from "./ItemNotePopover"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import type { BudgetCategory, BudgetItem } from "@/lib/supabase/types"

interface CategoryGroupProps {
  category: BudgetCategory
  items: BudgetItem[]
  onUpdateItem: (id: string, field: "planned_amount" | "actual_amount", value: number) => void
  onAddItem: (categoryId: string, name: string) => void
  onDeleteItem: (id: string) => void
  onToggleComplete: (id: string, completed: boolean) => void
  onUpdateNote?: (id: string, notes: string) => void
}

export function CategoryGroup({ category, items, onUpdateItem, onAddItem, onDeleteItem, onToggleComplete, onUpdateNote }: CategoryGroupProps) {
  const [collapsed, setCollapsed] = useState(true)
  const subtotalPlanned = items.reduce((s, i) => s + Number(i.planned_amount), 0)
  const subtotalActual = items.reduce((s, i) => s + Number(i.actual_amount), 0)
  const pct = subtotalPlanned > 0 ? (subtotalActual / subtotalPlanned) * 100 : 0

  return (
    <>
      <SortableCategoryHeader
        category={category}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        subtotalPlanned={subtotalPlanned}
        subtotalActual={subtotalActual}
        pct={pct}
      />

      {!collapsed && (
        <>
          <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
            {items.map((item) => (
              <SortableItemRow
                key={item.id}
                item={item}
                categoryColor={category.color || "#6366F1"}
                onUpdateItem={onUpdateItem}
                onDeleteItem={onDeleteItem}
                onToggleComplete={onToggleComplete}
                onUpdateNote={onUpdateNote}
              />
            ))}
          </SortableContext>

          <TableRow className="border-[#2A2D3A] hover:bg-transparent">
            <TableCell colSpan={6} className="p-0">
              <AddItemRow onAdd={(name) => onAddItem(category.id, name)} />
            </TableCell>
          </TableRow>
        </>
      )}
    </>
  )
}
