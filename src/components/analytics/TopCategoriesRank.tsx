"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils/currency"
import { InfoTip } from "@/components/shared/InfoTip"
import type { BudgetCategory, BudgetItem } from "@/lib/supabase/types"

interface TopCategoriesRankProps {
  categories: BudgetCategory[]
  items: BudgetItem[]
}

export function TopCategoriesRank({ categories, items }: TopCategoriesRankProps) {
  const data = categories
    .map((cat) => {
      const catItems = items.filter((i) => i.category_id === cat.id)
      const total = catItems.reduce((s, i) => s + Number(i.actual_amount), 0)
      return {
        name: cat.name,
        value: total,
        color: cat.color || "#6366F1",
      }
    })
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value)

  const maxValue = data.length > 0 ? data[0].value : 1

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-white flex items-center gap-2">Top Categories <InfoTip text="Your highest spending categories ranked by actual amount spent." /></CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.length === 0 ? (
          <div className="flex h-[120px] items-center justify-center text-sm text-[#94A3B8]">
            No spending data yet
          </div>
        ) : (
          data.slice(0, 6).map((item, i) => (
            <div key={item.name} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#94A3B8] w-4">#{i + 1}</span>
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-white">{item.name}</span>
                </div>
                <span className="tabular-nums text-[#94A3B8]">{formatCurrency(item.value)}</span>
              </div>
              <div className="relative ml-6 h-1.5 w-full overflow-hidden rounded-full bg-[#2A2D3A]">
                <div
                  className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${(item.value / maxValue) * 100}%`,
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
