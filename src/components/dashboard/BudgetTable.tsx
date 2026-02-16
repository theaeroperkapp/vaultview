"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCurrency } from "@/lib/utils/currency"
import { DifferenceDisplay } from "@/components/shared/CurrencyDisplay"
import { StatusBadge } from "@/components/shared/StatusBadge"
import type { BudgetCategory, BudgetItem } from "@/lib/supabase/types"
import React from "react"

interface BudgetTableProps {
  categories: BudgetCategory[]
  items: BudgetItem[]
}

export function BudgetTable({ categories, items }: BudgetTableProps) {
  return (
    <Card className="border-[#2A2D3A] bg-[#1A1D27]">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-white">Budget Items</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-[#2A2D3A] hover:bg-transparent">
              <TableHead className="text-[#94A3B8]">Item</TableHead>
              <TableHead className="text-right text-[#94A3B8]">Planned</TableHead>
              <TableHead className="text-right text-[#94A3B8]">Actual</TableHead>
              <TableHead className="text-right text-[#94A3B8]">Difference</TableHead>
              <TableHead className="text-center text-[#94A3B8]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => {
              const catItems = items
                .filter((i) => i.category_id === category.id)
                .sort((a, b) => a.sort_order - b.sort_order)

              if (catItems.length === 0) return null

              const subtotalPlanned = catItems.reduce((s, i) => s + Number(i.planned_amount), 0)
              const subtotalActual = catItems.reduce((s, i) => s + Number(i.actual_amount), 0)

              return (
                <React.Fragment key={category.id}>
                  <TableRow className="border-[#2A2D3A] bg-[#0F1117]/50 hover:bg-[#0F1117]/50">
                    <TableCell colSpan={5} className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: category.color || '#6366F1' }}
                        />
                        <span className="text-sm font-semibold text-white">{category.name}</span>
                        <span className="ml-auto text-xs tabular-nums text-[#94A3B8]">
                          {formatCurrency(subtotalActual)} / {formatCurrency(subtotalPlanned)}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                  {catItems.map((item) => (
                    <TableRow key={item.id} className="border-[#2A2D3A] hover:bg-[#1E2130]">
                      <TableCell className="pl-8 text-sm text-white">{item.name}</TableCell>
                      <TableCell className="text-right tabular-nums text-[#94A3B8]">
                        {formatCurrency(Number(item.planned_amount))}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-white">
                        {formatCurrency(Number(item.actual_amount))}
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
                    </TableRow>
                  ))}
                </React.Fragment>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
