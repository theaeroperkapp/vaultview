"use client"

import { useEffect, useState } from "react"
import { formatCurrency } from "@/lib/utils/currency"
import { TrendingUp, TrendingDown } from "lucide-react"
import { LineChart, Line, ResponsiveContainer } from "recharts"
import type { PeriodSummary } from "@/hooks/useAllPeriods"

interface BalanceCardProps {
  balance: number
  income: number
  expenses: number
  trendData?: PeriodSummary[]
}

export function BalanceCard({ balance, income, expenses, trendData }: BalanceCardProps) {
  const [displayBalance, setDisplayBalance] = useState(0)
  const isPositive = balance >= 0
  const savingsRate = income > 0 ? ((income - expenses) / income * 100) : 0

  useEffect(() => {
    const duration = 600
    const steps = 30
    const stepDuration = duration / steps
    const increment = balance / steps
    let current = 0
    let step = 0

    const timer = setInterval(() => {
      step++
      current += increment
      if (step >= steps) {
        current = balance
        clearInterval(timer)
      }
      setDisplayBalance(current)
    }, stepDuration)

    return () => clearInterval(timer)
  }, [balance])

  // Last 6 months for sparkline
  const sparkData = (trendData || []).slice(-6).map((d) => ({
    value: d.balance,
  }))

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500/10 via-[#1A1D27] to-[#1E2130] p-6 glow-border">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-[#94A3B8]">Monthly Balance</p>
          <div className="flex items-center gap-3">
            <p
              className={`animate-count-up text-5xl font-bold tabular-nums ${isPositive ? "text-emerald-400" : "text-red-400"}`}
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              {formatCurrency(displayBalance)}
            </p>
            {isPositive ? (
              <TrendingUp className="h-7 w-7 text-emerald-400" />
            ) : (
              <TrendingDown className="h-7 w-7 text-red-400" />
            )}
          </div>
        </div>

        {/* Sparkline */}
        {sparkData.length > 1 && (
          <div className="h-16 w-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparkData}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 3-column footer */}
      <div className="mt-5 grid grid-cols-3 gap-4 border-t border-[#2A2D3A]/50 pt-4">
        <div>
          <p className="text-xs text-[#94A3B8]">Income</p>
          <p className="text-lg font-semibold tabular-nums text-emerald-400">{formatCurrency(income)}</p>
        </div>
        <div>
          <p className="text-xs text-[#94A3B8]">Expenses</p>
          <p className="text-lg font-semibold tabular-nums text-red-400">{formatCurrency(expenses)}</p>
        </div>
        <div>
          <p className="text-xs text-[#94A3B8]">Savings Rate</p>
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-sm font-semibold ${
            savingsRate >= 20
              ? "bg-emerald-500/10 text-emerald-400"
              : savingsRate >= 0
              ? "bg-amber-500/10 text-amber-400"
              : "bg-red-500/10 text-red-400"
          }`}>
            {savingsRate.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  )
}
