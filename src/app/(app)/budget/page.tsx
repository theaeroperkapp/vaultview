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
import { MonthSelector } from "@/components/dashboard/MonthSelector"
import { getCurrentMonth, getCurrentYear } from "@/lib/utils/dates"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { DollarSign } from "lucide-react"
import { useState } from "react"
import { logBudgetChange } from "@/lib/utils/auditLog"
import { BudgetActivityLog } from "@/components/budget/BudgetActivityLog"

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
    const oldItem = useBudgetStore.getState().items.find((i) => i.id === id)
    const oldValue = oldItem ? Number(oldItem[field]) : 0

    updateItem(id, { [field]: value })

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from("budget_items")
      .update({ [field]: value, updated_by: user?.id, updated_at: new Date().toISOString() })
      .eq("id", id)

    if (error) {
      toast.error("Failed to update: " + error.message)
    } else if (user && period && oldValue !== value) {
      logBudgetChange({
        period_id: period.id,
        user_id: user.id,
        action: field === "planned_amount" ? "update_planned" : "update_actual",
        item_id: id,
        item_name: oldItem?.name ?? null,
        old_value: String(oldValue),
        new_value: String(value),
      })
    }
  }, [updateItem, period])

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
      if (user) {
        logBudgetChange({
          period_id: period.id,
          user_id: user.id,
          action: "add_item",
          item_id: data.id,
          item_name: name,
        })
      }
    }
  }, [period, items, addItemToStore])

  const handleDeleteItem = useCallback(async (id: string) => {
    const deletedItem = useBudgetStore.getState().items.find((i) => i.id === id)
    removeItem(id)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from("budget_items").delete().eq("id", id)

    if (error) {
      toast.error("Failed to delete: " + error.message)
    } else if (user && period) {
      logBudgetChange({
        period_id: period.id,
        user_id: user.id,
        action: "delete_item",
        item_id: id,
        item_name: deletedItem?.name ?? null,
      })
    }
  }, [removeItem, period])

  const handleToggleComplete = useCallback(async (id: string, completed: boolean) => {
    updateItem(id, { is_completed: completed })

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from("budget_items")
      .update({
        is_completed: completed,
        completed_by: completed ? user?.id ?? null : null,
        completed_at: completed ? new Date().toISOString() : null,
        updated_by: user?.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) {
      toast.error("Failed to update: " + error.message)
      updateItem(id, { is_completed: !completed })
    }
  }, [updateItem])

  const handleIncomeUpdate = async () => {
    if (!period) return
    const num = parseFloat(incomeValue.replace(/[$,]/g, ""))
    if (isNaN(num)) { setEditingIncome(false); return }

    const oldIncome = period.total_income

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase
      .from("budget_periods")
      .update({ total_income: num })
      .eq("id", period.id)

    if (error) {
      toast.error("Failed to update income")
    } else {
      useBudgetStore.getState().setPeriod({ ...period, total_income: num })
      toast.success("Income updated")
      if (user && oldIncome !== num) {
        logBudgetChange({
          period_id: period.id,
          user_id: user.id,
          action: "update_income",
          old_value: String(oldIncome),
          new_value: String(num),
        })
      }
    }
    setEditingIncome(false)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-64 animate-shimmer rounded-lg" />
        <div className="h-[600px] w-full animate-shimmer rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <MonthSelector month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y) }} />
        <div className="flex items-center gap-3">
          <div className="glass-card flex items-center gap-2 px-4 py-2.5">
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

      <Card className="glass-card overflow-hidden">
        <CardHeader className="pb-2 bg-gradient-to-r from-emerald-500/5 to-transparent">
          <CardTitle className="text-base font-semibold text-white">Budget Editor</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-[#2A2D3A]/50 hover:bg-transparent">
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
                    onToggleComplete={handleToggleComplete}
                  />
                )
              })}

              {/* Totals row */}
              <TableRow className="border-[#2A2D3A] bg-gradient-to-r from-[#0F1117] to-[#1A1D27] font-semibold hover:bg-[#0F1117]">
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
              <TableRow className="border-[#2A2D3A] bg-gradient-to-r from-emerald-500/5 to-transparent hover:bg-emerald-500/5">
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

      <BudgetActivityLog periodId={period?.id} />
    </div>
  )
}
