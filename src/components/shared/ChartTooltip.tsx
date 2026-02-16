"use client"

import { formatCurrency } from "@/lib/utils/currency"

interface ChartTooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}

export function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload || !payload.length) return null

  return (
    <div className="glass-card px-3 py-2 shadow-xl">
      {label && (
        <p className="mb-1 text-sm font-medium text-white">{label}</p>
      )}
      {payload.map((p) => (
        <p key={p.name} className="text-xs tabular-nums" style={{ color: p.color }}>
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  )
}
