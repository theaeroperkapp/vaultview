"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils/currency"
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

  if (data.length === 0) {
    return (
      <Card className="border-[#2A2D3A] bg-[#1A1D27]">
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
    <Card className="border-[#2A2D3A] bg-[#1A1D27]">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-white">Spending Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2D3A" />
            <XAxis dataKey="name" tick={{ fill: "#94A3B8", fontSize: 11 }} />
            <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="expenses" stroke="#10B981" strokeWidth={2} dot={{ fill: "#10B981", r: 4 }} name="Expenses" />
            <Line type="monotone" dataKey="income" stroke="#6366F1" strokeWidth={2} dot={{ fill: "#6366F1", r: 4 }} name="Income" strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
