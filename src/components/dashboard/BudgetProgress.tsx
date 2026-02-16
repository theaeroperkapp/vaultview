"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils/currency"
import type { BudgetCategory, BudgetItem } from "@/lib/supabase/types"

interface BudgetProgressProps {
  categories: BudgetCategory[]
  items: BudgetItem[]
}

export function BudgetProgress({ categories, items }: BudgetProgressProps) {
  const data = categories
    .map((cat) => {
      const catItems = items.filter((i) => i.category_id === cat.id)
      const planned = catItems.reduce((s, i) => s + Number(i.planned_amount), 0)
      const actual = catItems.reduce((s, i) => s + Number(i.actual_amount), 0)
      return {
        name: cat.name,
        color: cat.color || "#6366F1",
        planned,
        actual,
        pct: planned > 0 ? (actual / planned) * 100 : 0,
      }
    })
    .filter((d) => d.planned > 0 || d.actual > 0)

  const getBarColor = (pct: number) => {
    if (pct > 100) return "from-red-500 to-red-400"
    if (pct >= 80) return "from-amber-500 to-amber-400"
    return "from-emerald-500 to-emerald-400"
  }

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-white">Budget Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center text-sm text-[#94A3B8]">
            No budget data yet
          </div>
        ) : (
          data.map((item) => (
            <div key={item.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-[#94A3B8]">{item.name}</span>
                </div>
                <span className="tabular-nums text-white">
                  {formatCurrency(item.actual)}{" "}
                  <span className="text-[#94A3B8]">/ {formatCurrency(item.planned)}</span>
                </span>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-[#2A2D3A]">
                <div
                  className={`absolute left-0 top-0 h-full rounded-full bg-gradient-to-r ${getBarColor(item.pct)} transition-all duration-500`}
                  style={{ width: `${Math.min(item.pct, 100)}%` }}
                />
                {item.pct > 100 && (
                  <div
                    className="absolute top-0 h-full rounded-full bg-red-500/30"
                    style={{ left: '100%', width: `${Math.min(item.pct - 100, 50)}%`, transform: 'translateX(-100%)' }}
                  />
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
