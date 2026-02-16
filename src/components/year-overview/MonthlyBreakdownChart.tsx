"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartTooltip } from "@/components/shared/ChartTooltip"
import { getMonthName } from "@/lib/utils/dates"
import type { PeriodSummary } from "@/hooks/useAllPeriods"

interface MonthlyBreakdownChartProps {
  data: PeriodSummary[]
}

export function MonthlyBreakdownChart({ data }: MonthlyBreakdownChartProps) {
  const chartData = data.map((d) => ({
    name: getMonthName(d.month).slice(0, 3),
    income: d.income,
    expenses: d.totalActual,
  }))

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-white">Monthly Income vs Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-sm text-[#94A3B8]">
            No data for this year
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <defs>
                <linearGradient id="yearIncGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34D399" />
                  <stop offset="100%" stopColor="#10B981" />
                </linearGradient>
                <linearGradient id="yearExpGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F87171" />
                  <stop offset="100%" stopColor="#EF4444" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2D3A" />
              <XAxis dataKey="name" tick={{ fill: "#94A3B8", fontSize: 11 }} />
              <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ color: "#94A3B8", fontSize: 12 }} />
              <Bar dataKey="income" fill="url(#yearIncGrad)" name="Income" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" fill="url(#yearExpGrad)" name="Expenses" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
