"use client"

import { useEffect, useState } from "react"
import { PlannedVsActualBar } from "@/components/analytics/PlannedVsActualBar"
import { SavingsGauge } from "@/components/analytics/SavingsGauge"
import { TrendLineChart } from "@/components/analytics/TrendLineChart"
import { CategoryAreaChart } from "@/components/analytics/CategoryAreaChart"
import { useBudgetPeriod } from "@/hooks/useBudgetPeriod"
import { useHousehold } from "@/hooks/useHousehold"
import { useBudgetStore, useBudgetTotals } from "@/stores/budgetStore"
import { createClient } from "@/lib/supabase/client"
import { getCurrentMonth, getCurrentYear, getMonthName } from "@/lib/utils/dates"
import { formatCurrency } from "@/lib/utils/currency"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingDown } from "lucide-react"
import { MonthSelector } from "@/components/dashboard/MonthSelector"

interface TrendData {
  month: number
  year: number
  totalActual: number
  totalPlanned: number
  income: number
}

export default function AnalyticsPage() {
  const [month, setMonth] = useState(getCurrentMonth())
  const [year, setYear] = useState(getCurrentYear())
  const { household } = useHousehold()

  useBudgetPeriod(month, year)
  const { categories, items, isLoading } = useBudgetStore()
  const totals = useBudgetTotals()

  const [trendData, setTrendData] = useState<TrendData[]>([])

  useEffect(() => {
    if (!household) return

    const supabase = createClient()
    const fetchTrends = async () => {
      const { data } = await supabase
        .from("budget_periods")
        .select("*")
        .eq("household_id", household.id)

      const allPeriods = (data || []) as Array<{ id: string; month: number; year: number; total_income: number }>
      if (allPeriods.length === 0) return

      allPeriods.sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year
        return a.month - b.month
      })

      const trends: TrendData[] = []
      for (const period of allPeriods) {
        const { data: itemData } = await supabase
          .from("budget_items")
          .select("*")
          .eq("period_id", period.id)

        const periodItems = (itemData || []) as Array<{ actual_amount: number; planned_amount: number }>
        let totalActual = 0
        let totalPlanned = 0
        for (const item of periodItems) {
          totalActual += Number(item.actual_amount)
          totalPlanned += Number(item.planned_amount)
        }

        trends.push({
          month: period.month,
          year: period.year,
          totalActual,
          totalPlanned,
          income: Number(period.total_income),
        })
      }

      setTrendData(trends)
    }

    fetchTrends()
  }, [household])

  // Top overspend items
  const overspendItems = items
    .filter((i) => Number(i.actual_amount) > Number(i.planned_amount) && Number(i.planned_amount) > 0)
    .map((i) => ({
      name: i.name,
      planned: Number(i.planned_amount),
      actual: Number(i.actual_amount),
      overspend: Number(i.actual_amount) - Number(i.planned_amount),
    }))
    .sort((a, b) => b.overspend - a.overspend)

  // Budget adherence
  const itemsWithBudget = items.filter((i) => Number(i.planned_amount) > 0)
  const onBudgetCount = itemsWithBudget.filter((i) => Number(i.actual_amount) <= Number(i.planned_amount)).length
  const adherenceRate = itemsWithBudget.length > 0 ? (onBudgetCount / itemsWithBudget.length) * 100 : 100

  // Category area chart data
  const categoryAreaData = trendData.map((t) => {
    const point: Record<string, any> = { name: `${getMonthName(t.month).slice(0, 3)} ${t.year}` }
    // We only have current month item-level data, so show single point for now
    return point
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48 bg-[#1A1D27]" />
        <div className="grid grid-cols-2 gap-6">
          <Skeleton className="h-[350px] bg-[#1A1D27]" />
          <Skeleton className="h-[350px] bg-[#1A1D27]" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <MonthSelector month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y) }} />
      </div>

      {/* Top row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PlannedVsActualBar categories={categories} items={items} />
        </div>
        <SavingsGauge income={totals.income} expenses={totals.totalActual} />
      </div>

      {/* Trend chart */}
      <TrendLineChart data={trendData} />

      {/* Bottom row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Budget Adherence */}
        <Card className="border-[#2A2D3A] bg-[#1A1D27]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-white">Budget Adherence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <p
                className={`text-5xl font-bold tabular-nums ${adherenceRate >= 80 ? "text-emerald-400" : adherenceRate >= 60 ? "text-amber-400" : "text-red-400"}`}
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                {adherenceRate.toFixed(0)}%
              </p>
              <p className="mt-2 text-sm text-[#94A3B8]">
                {onBudgetCount} of {itemsWithBudget.length} items within budget
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Top Overspend */}
        <Card className="border-[#2A2D3A] bg-[#1A1D27]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-white">Top Overspend Items</CardTitle>
          </CardHeader>
          <CardContent>
            {overspendItems.length === 0 ? (
              <div className="flex h-[120px] items-center justify-center text-sm text-[#94A3B8]">
                All items within budget!
              </div>
            ) : (
              <div className="space-y-3">
                {overspendItems.slice(0, 5).map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-red-400" />
                      <span className="text-sm text-white">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-red-500/30 text-red-400 text-xs">
                        +{formatCurrency(item.overspend)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
