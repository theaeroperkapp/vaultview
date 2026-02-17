"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils/currency"
import type { PeriodSummary } from "@/hooks/useAllPeriods"

interface SavingsProgressCardProps {
  data: PeriodSummary[]
}

export function SavingsProgressCard({ data }: SavingsProgressCardProps) {
  // Only count months that actually have activity
  const activeMonths = data.filter((d) => d.income > 0 || d.totalActual > 0)
  const totalIncome = activeMonths.reduce((s, d) => s + d.income, 0)
  const totalExpenses = activeMonths.reduce((s, d) => s + d.totalActual, 0)
  const totalSaved = totalIncome - totalExpenses

  // Project annual savings (extrapolate from active months only)
  const monthsWithData = activeMonths.length
  const projectedAnnualSavings = monthsWithData > 0 ? (totalSaved / monthsWithData) * 12 : 0

  // Progress: how far through the year we are vs how much we've saved
  const pct = projectedAnnualSavings > 0 ? (totalSaved / projectedAnnualSavings) * 100 : 0

  // SVG gauge
  const radius = 60
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (Math.min(pct, 100) / 100) * circumference

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-white">Savings Progress</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <div className="relative">
          <svg width="150" height="150" viewBox="0 0 150 150">
            <circle
              cx="75"
              cy="75"
              r={radius}
              fill="none"
              stroke="#2A2D3A"
              strokeWidth="10"
              strokeLinecap="round"
            />
            <circle
              cx="75"
              cy="75"
              r={radius}
              fill="none"
              stroke={totalSaved >= 0 ? "#10B981" : "#EF4444"}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              transform="rotate(-90 75 75)"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className={`text-2xl font-bold tabular-nums ${totalSaved >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {pct.toFixed(0)}%
            </p>
            <p className="text-[10px] text-[#94A3B8]">of projected</p>
          </div>
        </div>

        <div className="w-full space-y-2 text-center">
          <div>
            <p className="text-xs text-[#94A3B8]">Saved So Far</p>
            <p className={`font-semibold tabular-nums ${totalSaved >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {formatCurrency(totalSaved)}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#94A3B8]">Projected Annual</p>
            <p className="font-semibold tabular-nums text-white">
              {formatCurrency(projectedAnnualSavings)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
