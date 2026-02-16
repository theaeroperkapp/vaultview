"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils/currency"
import type { BudgetCategory, BudgetItem } from "@/lib/supabase/types"

interface PlannedVsActualBarProps {
  categories: BudgetCategory[]
  items: BudgetItem[]
}

export function PlannedVsActualBar({ categories, items }: PlannedVsActualBarProps) {
  const data = categories
    .map((cat) => {
      const catItems = items.filter((i) => i.category_id === cat.id)
      const planned = catItems.reduce((s, i) => s + Number(i.planned_amount), 0)
      const actual = catItems.reduce((s, i) => s + Number(i.actual_amount), 0)
      return { name: cat.name, planned, actual }
    })
    .filter((d) => d.planned > 0 || d.actual > 0)

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-[#2A2D3A] bg-[#1A1D27] px-3 py-2 shadow-lg">
          <p className="mb-1 text-sm font-medium text-white">{label}</p>
          {payload.map((p: any) => (
            <p key={p.name} className="text-xs" style={{ color: p.color }}>
              {p.name}: {formatCurrency(p.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <Card className="border-[#2A2D3A] bg-[#1A1D27]">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-white">Planned vs Actual</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2D3A" />
            <XAxis dataKey="name" tick={{ fill: "#94A3B8", fontSize: 11 }} angle={-30} textAnchor="end" height={60} />
            <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ color: "#94A3B8", fontSize: 12 }} />
            <Bar dataKey="planned" fill="#6366F1" name="Planned" radius={[4, 4, 0, 0]} />
            <Bar dataKey="actual" fill="#10B981" name="Actual" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
