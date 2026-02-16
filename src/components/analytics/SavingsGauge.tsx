"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils/currency"

interface SavingsGaugeProps {
  income: number
  expenses: number
}

export function SavingsGauge({ income, expenses }: SavingsGaugeProps) {
  const savings = income - expenses
  const savingsRate = income > 0 ? (savings / income) * 100 : 0
  const isPositive = savings >= 0

  // SVG radial gauge
  const radius = 70
  const circumference = 2 * Math.PI * radius
  const pct = Math.min(Math.abs(savingsRate), 100)
  const offset = circumference - (pct / 100) * circumference

  const gaugeColor = isPositive
    ? savingsRate >= 20 ? "#10B981" : "#F59E0B"
    : "#EF4444"

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-white">Savings Rate</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        {/* SVG Radial Gauge */}
        <div className="relative">
          <svg width="180" height="180" viewBox="0 0 180 180">
            <defs>
              <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={gaugeColor} stopOpacity={1} />
                <stop offset="100%" stopColor={gaugeColor} stopOpacity={0.5} />
              </linearGradient>
            </defs>
            {/* Background circle */}
            <circle
              cx="90"
              cy="90"
              r={radius}
              fill="none"
              stroke="#2A2D3A"
              strokeWidth="12"
              strokeLinecap="round"
            />
            {/* Value arc */}
            <circle
              cx="90"
              cy="90"
              r={radius}
              fill="none"
              stroke="url(#gaugeGrad)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              transform="rotate(-90 90 90)"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p
              className={`text-3xl font-bold tabular-nums ${isPositive ? "text-emerald-400" : "text-red-400"}`}
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              {savingsRate.toFixed(1)}%
            </p>
            <p className="text-xs text-[#94A3B8]">
              {isPositive ? "saved" : "over budget"}
            </p>
          </div>
        </div>

        <div className="grid w-full grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-xs text-[#94A3B8]">Income</p>
            <p className="font-semibold tabular-nums text-emerald-400">{formatCurrency(income)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-[#94A3B8]">Expenses</p>
            <p className="font-semibold tabular-nums text-red-400">{formatCurrency(expenses)}</p>
          </div>
        </div>

        <div className="w-full rounded-lg bg-[#0F1117]/60 p-3 text-center">
          <p className="text-xs text-[#94A3B8]">Net Savings</p>
          <p className={`text-xl font-bold tabular-nums ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
            {isPositive ? "+" : ""}{formatCurrency(savings)}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
