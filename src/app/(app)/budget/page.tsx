"use client"

import { useCallback } from "react"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CategoryGroup } from "@/components/budget/CategoryGroup"
import { useBudgetPeriod } from "@/hooks/useBudgetPeriod"
import { useBudgetRealtime } from "@/hooks/useBudgetRealtime"
import { useHousehold } from "@/hooks/useHousehold"
import { useBudgetStore, useBudgetTotals } from "@/stores/budgetStore"
import { createClient } from "@/lib/supabase/client"
import { formatCurrency } from "@/lib/utils/currency"
import { Skeleton } from "@/components/ui/skeleton"
import { MonthSelector } from "@/components/dashboard/MonthSelector"
import { getCurrentMonth, getCurrentYear } from "@/lib/utils/dates"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { DollarSign } from "lucide-react"
import { useState } from "react"

export default function BudgetPage() {
  const [month, setMonth] = useState(getCurrentMonth())
  const [year, setYear] = useState(getCurrentYear())
  const { household } = useHousehold()

  useBudgetPeriod(month, year)
  const { period, categories, items, isLoading, updateItem, addItem: addItemToStore, removeItem } = useBudgetStore()
  useBudgetRealtime(period?.id)

  const totals = useBudgetTotals()
  const [editingIncome, setEditingIncome] = useState(false)
  const [incomeValue, setIncomeValue] = useState("")

  const handleUpdateItem = useCallback(async (id: string, field: "planned_amount" | "actual_amount", value: number) => {
    // Optimistic update
    updateItem(id, { [field]: value })

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from("budget_items")
      .update({ [field]: value, updated_by: user?.id, updated_at: new Date().toISOString() })
      .eq("id", id)

    if (error) {
      toast.error("Failed to update: " + error.message)
    }
  }, [updateItem])

  const handleAddItem = useCallback(async (categoryId: string, name: string) => {
    if (!period) return

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const categoryItems = items.filter((i) => i.category_id === categoryId)
    const maxSort = categoryItems.length > 0
      ? Math.max(...categoryItems.map((i) => i.sort_order)) + 1
      : 0

    const { data, error } = await supabase
      .from("budget_items")
      .insert({
        period_id: period.id,
        category_id: categoryId,
        name,
        planned_amount: 0,
        actual_amount: 0,
        sort_order: maxSort,
        created_by: user?.id,
      })
      .select()
      .single()

    if (error) {
      toast.error("Failed to add item: " + error.message)
      return
    }

    if (data) {
      addItemToStore(data)
      toast.success(`Added "${name}"`)
    }
  }, [period, items, addItemToStore])

  const handleDeleteItem = useCallback(async (id: string) => {
    removeItem(id)

    const supabase = createClient()
    const { error } = await supabase.from("budget_items").delete().eq("id", id)

    if (error) {
      toast.error("Failed to delete: " + error.message)
    }
  }, [removeItem])

  const handleIncomeUpdate = async () => {
    if (!period) return
    const num = parseFloat(incomeValue.replace(/[$,]/g, ""))
    if (isNaN(num)) { setEditingIncome(false); return }

    const supabase = createClient()
    const { error } = await supabase
      .from("budget_periods")
      .update({ total_income: num })
      .eq("id", period.id)

    if (error) {
      toast.error("Failed to update income")
    } else {
      useBudgetStore.getState().setPeriod({ ...period, total_income: num })
      toast.success("Income updated")
    }
    setEditingIncome(false)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64 bg-[#1A1D27]" />
        <Skeleton className="h-[600px] w-full bg-[#1A1D27]" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <MonthSelector month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y) }} />
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-[#2A2D3A] bg-[#1A1D27] px-3 py-2">
            <DollarSign className="h-4 w-4 text-emerald-400" />
            <span className="text-sm text-[#94A3B8]">Income:</span>
            {editingIncome ? (
              <Input
                autoFocus
                value={incomeValue}
                onChange={(e) => setIncomeValue(e.target.value)}
                onBlur={handleIncomeUpdate}
                onKeyDown={(e) => { if (e.key === "Enter") handleIncomeUpdate(); if (e.key === "Escape") setEditingIncome(false) }}
                className="h-7 w-32 border-emerald-500 bg-[#0F1117] text-right text-sm text-white"
              />
            ) : (
              <button
                onClick={() => { setIncomeValue(String(totals.income)); setEditingIncome(true) }}
                className="text-sm font-semibold tabular-nums text-emerald-400 hover:underline"
              >
                {formatCurrency(totals.income)}
              </button>
            )}
          </div>
        </div>
      </div>

      <Card className="border-[#2A2D3A] bg-[#1A1D27]">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-white">Budget Editor</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-[#2A2D3A] hover:bg-transparent">
                <TableHead className="text-[#94A3B8]">Item</TableHead>
                <TableHead className="w-36 text-right text-[#94A3B8]">Planned</TableHead>
                <TableHead className="w-36 text-right text-[#94A3B8]">Actual</TableHead>
                <TableHead className="text-right text-[#94A3B8]">Difference</TableHead>
                <TableHead className="text-center text-[#94A3B8]">Status</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => {
                const catItems = items
                  .filter((i) => i.category_id === category.id)
                  .sort((a, b) => a.sort_order - b.sort_order)

                return (
                  <CategoryGroup
                    key={category.id}
                    category={category}
                    items={catItems}
                    onUpdateItem={handleUpdateItem}
                    onAddItem={handleAddItem}
                    onDeleteItem={handleDeleteItem}
                  />
                )
              })}

              {/* Totals row */}
              <TableRow className="border-[#2A2D3A] bg-[#0F1117] font-semibold hover:bg-[#0F1117]">
                <TableCell className="text-white">TOTAL</TableCell>
                <TableCell className="text-right tabular-nums text-[#94A3B8]">
                  {formatCurrency(totals.totalPlanned)}
                </TableCell>
                <TableCell className="text-right tabular-nums text-white">
                  {formatCurrency(totals.totalActual)}
                </TableCell>
                <TableCell className={`text-right tabular-nums ${totals.totalDifference >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {formatCurrency(Math.abs(totals.totalDifference))}
                </TableCell>
                <TableCell />
                <TableCell />
              </TableRow>

              {/* Balance row */}
              <TableRow className="border-[#2A2D3A] bg-[#0F1117] hover:bg-[#0F1117]">
                <TableCell className="text-sm font-semibold text-emerald-400">BALANCE (Income - Actual)</TableCell>
                <TableCell />
                <TableCell className={`text-right text-lg font-bold tabular-nums ${totals.balance >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {formatCurrency(totals.balance)}
                </TableCell>
                <TableCell />
                <TableCell />
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
