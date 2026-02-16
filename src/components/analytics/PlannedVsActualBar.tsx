"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartTooltip } from "@/components/shared/ChartTooltip"
import { InfoTip } from "@/components/shared/InfoTip"
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

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-white flex items-center gap-2">Planned vs Actual <InfoTip text="Compares what you budgeted (planned) against what you actually spent per category." /></CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <defs>
              <linearGradient id="gradPlanned" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#818CF8" />
                <stop offset="100%" stopColor="#6366F1" />
              </linearGradient>
              <linearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34D399" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2D3A" />
            <XAxis dataKey="name" tick={{ fill: "#94A3B8", fontSize: 11 }} angle={-30} textAnchor="end" height={60} />
            <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`} />
            <Tooltip content={<ChartTooltip />} />
            <Legend wrapperStyle={{ color: "#94A3B8", fontSize: 12 }} />
            <Bar dataKey="planned" fill="url(#gradPlanned)" name="Planned" radius={[4, 4, 0, 0]} label={{ position: 'top', fill: '#94A3B8', fontSize: 10, formatter: (v) => Number(v) > 0 ? `$${(Number(v)/1000).toFixed(1)}k` : '' }} />
            <Bar dataKey="actual" fill="url(#gradActual)" name="Actual" radius={[4, 4, 0, 0]} label={{ position: 'top', fill: '#94A3B8', fontSize: 10, formatter: (v) => Number(v) > 0 ? `$${(Number(v)/1000).toFixed(1)}k` : '' }} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
