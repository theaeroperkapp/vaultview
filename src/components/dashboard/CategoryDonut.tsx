"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils/currency"
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

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { color: string } }> }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-[#2A2D3A] bg-[#1A1D27] px-3 py-2 shadow-lg">
          <p className="text-sm font-medium text-white">{payload[0].name}</p>
          <p className="text-sm tabular-nums text-[#94A3B8]">{formatCurrency(payload[0].value)}</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="border-[#2A2D3A] bg-[#1A1D27]">
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
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={index} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {data.map((entry) => (
                <div key={entry.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-[#94A3B8]">{entry.name}</span>
                  </div>
                  <span className="tabular-nums text-white">{formatCurrency(entry.value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
