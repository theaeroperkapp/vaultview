"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils/currency"
import { createClient } from "@/lib/supabase/client"
import { useHousehold } from "@/hooks/useHousehold"
import type { PeriodSummary } from "@/hooks/useAllPeriods"

interface AnnualCategoryBreakdownProps {
  data: PeriodSummary[]
  year: number
}

interface CatSpend {
  name: string
  color: string
  total: number
}

export function AnnualCategoryBreakdown({ data, year }: AnnualCategoryBreakdownProps) {
  const { household } = useHousehold()
  const [catData, setCatData] = useState<CatSpend[]>([])

  useEffect(() => {
    if (!household || data.length === 0) return

    const supabase = createClient()
    const fetchCatSpend = async () => {
      // Get periods for this year up to current month
      const now = new Date()
      const currentYear = now.getFullYear()
      const currentMonth = now.getMonth() + 1

      let query = supabase
        .from("budget_periods")
        .select("id, month")
        .eq("household_id", household.id)
        .eq("year", year)

      // If viewing the current year, exclude future months
      if (year >= currentYear) {
        query = query.lte("month", currentMonth)
      }

      const { data: periods } = await query

      if (!periods || periods.length === 0) return

      const periodIds = periods.map((p) => p.id)

      // Get categories
      const { data: cats } = await supabase
        .from("budget_categories")
        .select("*")
        .eq("household_id", household.id)
        .order("sort_order")

      if (!cats) return

      // Get all items for these periods
      const { data: items } = await supabase
        .from("budget_items")
        .select("category_id, actual_amount")
        .in("period_id", periodIds)

      if (!items) return

      const result: CatSpend[] = cats.map((cat) => {
        const total = items
          .filter((i) => i.category_id === cat.id)
          .reduce((s, i) => s + Number(i.actual_amount), 0)
        return { name: cat.name, color: cat.color || "#6366F1", total }
      }).filter((c) => c.total > 0).sort((a, b) => b.total - a.total)

      setCatData(result)
    }

    fetchCatSpend()
  }, [household, data, year])

  const maxValue = catData.length > 0 ? catData[0].total : 1

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-white">Annual Spending by Category</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {catData.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center text-sm text-[#94A3B8]">
            No category data for this year
          </div>
        ) : (
          catData.map((item) => (
            <div key={item.name} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-white">{item.name}</span>
                </div>
                <span className="tabular-nums text-[#94A3B8]">{formatCurrency(item.total)}</span>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-[#2A2D3A]">
                <div
                  className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${(item.total / maxValue) * 100}%`,
                    background: `linear-gradient(90deg, ${item.color}, ${item.color}80)`,
                  }}
                />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
