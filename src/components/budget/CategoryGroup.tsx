"use client"

import React from "react"
import { TableCell, TableRow } from "@/components/ui/table"
import { InlineEditCell } from "./InlineEditCell"
import { AddItemRow } from "./AddItemRow"
import { DifferenceDisplay } from "@/components/shared/CurrencyDisplay"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { formatCurrency } from "@/lib/utils/currency"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { BudgetCategory, BudgetItem } from "@/lib/supabase/types"

interface CategoryGroupProps {
  category: BudgetCategory
  items: BudgetItem[]
  onUpdateItem: (id: string, field: "planned_amount" | "actual_amount", value: number) => void
  onAddItem: (categoryId: string, name: string) => void
  onDeleteItem: (id: string) => void
}

export function CategoryGroup({ category, items, onUpdateItem, onAddItem, onDeleteItem }: CategoryGroupProps) {
  const subtotalPlanned = items.reduce((s, i) => s + Number(i.planned_amount), 0)
  const subtotalActual = items.reduce((s, i) => s + Number(i.actual_amount), 0)

  return (
    <>
      {/* Category header row */}
      <TableRow className="border-[#2A2D3A] bg-[#0F1117]/50 hover:bg-[#0F1117]/50">
        <TableCell colSpan={6} className="px-4 py-2.5">
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: category.color || "#6366F1" }}
            />
            <span className="text-sm font-semibold text-white">{category.name}</span>
            <span className="ml-auto text-xs tabular-nums text-[#94A3B8]">
              {formatCurrency(subtotalActual)} / {formatCurrency(subtotalPlanned)}
            </span>
          </div>
        </TableCell>
      </TableRow>

      {/* Item rows */}
      {items.map((item) => (
        <TableRow key={item.id} className="group border-[#2A2D3A] hover:bg-[#1E2130]">
          <TableCell className="pl-8 text-sm text-white">{item.name}</TableCell>
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
          <TableCell className="w-10 p-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100 text-[#94A3B8] hover:text-red-400"
              onClick={() => onDeleteItem(item.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </TableCell>
        </TableRow>
      ))}

      {/* Add item row */}
      <TableRow className="border-[#2A2D3A] hover:bg-transparent">
        <TableCell colSpan={6} className="p-0">
          <AddItemRow onAdd={(name) => onAddItem(category.id, name)} />
        </TableCell>
      </TableRow>
    </>
  )
}
