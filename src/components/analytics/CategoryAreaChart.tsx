"use client"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils/currency"

interface CategoryAreaChartProps {
  data: Array<Record<string, any>>
  categories: Array<{ name: string; color: string }>
}

export function CategoryAreaChart({ data, categories }: CategoryAreaChartProps) {
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
          <CardTitle className="text-base font-semibold text-white">Category Spending</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[250px] items-center justify-center text-sm text-[#94A3B8]">
            Need more months of data to show category trends
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-[#2A2D3A] bg-[#1A1D27]">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-white">Category Spending Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2D3A" />
            <XAxis dataKey="name" tick={{ fill: "#94A3B8", fontSize: 11 }} />
            <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`} />
            <Tooltip content={<CustomTooltip />} />
            {categories.map((cat) => (
              <Area
                key={cat.name}
                type="monotone"
                dataKey={cat.name}
                stackId="1"
                stroke={cat.color}
                fill={cat.color}
                fillOpacity={0.3}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
