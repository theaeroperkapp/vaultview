"use client"

import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartTooltip } from "@/components/shared/ChartTooltip"
import { getMonthName } from "@/lib/utils/dates"
import type { PeriodSummary } from "@/hooks/useAllPeriods"

interface NetWorthChartProps {
  data: PeriodSummary[]
}

export function NetWorthChart({ data }: NetWorthChartProps) {
  const chartData = data.map((d) => ({
    name: `${getMonthName(d.month).slice(0, 3)} ${d.year}`,
    netWorth: d.cumulativeNetWorth,
    cumulativeIncome: data.slice(0, data.indexOf(d) + 1).reduce((s, p) => s + p.income, 0),
    cumulativeExpenses: data.slice(0, data.indexOf(d) + 1).reduce((s, p) => s + p.totalActual, 0),
  }))

  if (data.length === 0) {
    return (
      <div className="glass-card glow-border p-6">
        <h3 className="text-base font-semibold text-white mb-4">Net Worth Over Time</h3>
        <div className="flex h-[300px] items-center justify-center text-sm text-[#94A3B8]">
          No data available yet
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card glow-border p-6">
      <h3 className="text-base font-semibold text-white mb-4">Net Worth Over Time</h3>
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="nwGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#2A2D3A" />
          <XAxis dataKey="name" tick={{ fill: "#94A3B8", fontSize: 11 }} />
          <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`} />
          <Tooltip content={<ChartTooltip />} />
          <Area
            type="monotone"
            dataKey="netWorth"
            stroke="#10B981"
            strokeWidth={2.5}
            fill="url(#nwGrad)"
            name="Net Worth"
            dot={{ fill: "#10B981", r: 4 }}
          />
          <Area
            type="monotone"
            dataKey="cumulativeIncome"
            stroke="#6366F1"
            strokeWidth={1.5}
            strokeDasharray="5 5"
            fill="transparent"
            name="Cumulative Income"
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="cumulativeExpenses"
            stroke="#EF4444"
            strokeWidth={1.5}
            strokeDasharray="5 5"
            fill="transparent"
            name="Cumulative Expenses"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
