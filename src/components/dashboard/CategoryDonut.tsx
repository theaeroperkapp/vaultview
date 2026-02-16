"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils/currency"
import { ChartTooltip } from "@/components/shared/ChartTooltip"
import type { BudgetCategory, BudgetItem } from "@/lib/supabase/types"

interface CategoryDonutProps {
  categories: BudgetCategory[]
  items: BudgetItem[]
}

export function CategoryDonut({ categories, items }: CategoryDonutProps) {
  const data = categories
    .map((cat) => {
      const catItems = items.filter((i) => i.category_id === cat.id)
      const total = catItems.reduce((sum, i) => sum + Number(i.actual_amount), 0)
      return {
        name: cat.name,
        value: total,
        color: cat.color || "#6366F1",
      }
    })
    .filter((d) => d.value > 0)

  const totalSpending = data.reduce((s, d) => s + d.value, 0)

  const CenterLabel = () => (
    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central">
      <tspan x="50%" dy="-0.4em" className="text-xs" fill="#94A3B8">Total</tspan>
      <tspan x="50%" dy="1.4em" className="text-sm font-bold" fill="white">
        {formatCurrency(totalSpending)}
      </tspan>
    </text>
  )

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-white">Spending by Category</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center text-sm text-[#94A3B8]">
            No spending data yet
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={220}>
              <PieChart>
                <defs>
                  {data.map((entry, i) => (
                    <linearGradient key={i} id={`grad-${i}`} x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                      <stop offset="100%" stopColor={entry.color} stopOpacity={0.6} />
                    </linearGradient>
                  ))}
                </defs>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {data.map((_, index) => (
                    <Cell key={index} fill={`url(#grad-${index})`} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <CenterLabel />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2.5">
              {data.map((entry) => {
                const pct = totalSpending > 0 ? ((entry.value / totalSpending) * 100).toFixed(0) : "0"
                return (
                  <div key={entry.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-[#94A3B8]">{entry.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="tabular-nums text-white">{formatCurrency(entry.value)}</span>
                      <span className="rounded-full bg-[#2A2D3A] px-1.5 py-0.5 text-[10px] tabular-nums text-[#94A3B8]">
                        {pct}%
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
