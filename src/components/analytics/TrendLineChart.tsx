"use client"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartTooltip } from "@/components/shared/ChartTooltip"
import { getMonthName } from "@/lib/utils/dates"

interface TrendData {
  month: number
  year: number
  totalActual: number
  totalPlanned: number
  income: number
}

interface TrendLineChartProps {
  data: TrendData[]
}

export function TrendLineChart({ data }: TrendLineChartProps) {
  const chartData = data.map((d) => ({
    name: `${getMonthName(d.month).slice(0, 3)} ${d.year}`,
    expenses: d.totalActual,
    planned: d.totalPlanned,
    income: d.income,
  }))

  if (data.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-white">Spending Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[250px] items-center justify-center text-sm text-[#94A3B8]">
            Need more months of data to show trends
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-white">Spending Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="trendExpGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="trendIncGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366F1" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2D3A" />
            <XAxis dataKey="name" tick={{ fill: "#94A3B8", fontSize: 11 }} />
            <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`} />
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="monotone"
              dataKey="expenses"
              stroke="#10B981"
              strokeWidth={2}
              fill="url(#trendExpGrad)"
              name="Expenses"
              dot={{ fill: "#10B981", r: 3 }}
            />
            <Area
              type="monotone"
              dataKey="income"
              stroke="#6366F1"
              strokeWidth={2}
              strokeDasharray="5 5"
              fill="url(#trendIncGrad)"
              name="Income"
              dot={{ fill: "#6366F1", r: 3 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
