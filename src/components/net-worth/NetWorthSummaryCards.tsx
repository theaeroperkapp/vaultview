"use client"

import { formatCurrency } from "@/lib/utils/currency"
import type { PeriodSummary } from "@/hooks/useAllPeriods"

interface NetWorthSummaryCardsProps {
  data: PeriodSummary[]
}

export function NetWorthSummaryCards({ data }: NetWorthSummaryCardsProps) {
  const latest = data.length > 0 ? data[data.length - 1] : null
  const previous = data.length > 1 ? data[data.length - 2] : null

  const currentNetWorth = latest?.cumulativeNetWorth || 0
  const monthlyChange = latest ? latest.balance : 0
  const monthlyChangePct = previous && previous.cumulativeNetWorth !== 0
    ? ((monthlyChange / Math.abs(previous.cumulativeNetWorth)) * 100)
    : 0

  const totalIncome = data.reduce((s, d) => s + d.income, 0)
  const totalExpenses = data.reduce((s, d) => s + d.totalActual, 0)
  const cumulativeSavingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100) : 0

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {/* Current Net Worth */}
      <div className="glow-border glass-card p-5 animate-fade-in-up" style={{ animationDelay: "0ms" }}>
        <p className="text-xs font-medium text-[#94A3B8]">Current Net Worth</p>
        <p
          className={`mt-1 text-3xl font-bold tabular-nums ${currentNetWorth >= 0 ? "text-emerald-400" : "text-red-400"}`}
          style={{ fontFamily: 'var(--font-playfair)' }}
        >
          {formatCurrency(currentNetWorth)}
        </p>
      </div>

      {/* Monthly Change */}
      <div className="glass-card p-5 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
        <p className="text-xs font-medium text-[#94A3B8]">Monthly Change</p>
        <div className="mt-1 flex items-baseline gap-2">
          <p className={`text-2xl font-bold tabular-nums ${monthlyChange >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {monthlyChange >= 0 ? "+" : ""}{formatCurrency(monthlyChange)}
          </p>
          {monthlyChangePct !== 0 && (
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              monthlyChangePct >= 0
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-red-500/10 text-red-400"
            }`}>
              {monthlyChangePct >= 0 ? "+" : ""}{monthlyChangePct.toFixed(1)}%
            </span>
          )}
        </div>
      </div>

      {/* Cumulative Savings Rate */}
      <div className="glass-card p-5 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
        <p className="text-xs font-medium text-[#94A3B8]">Cumulative Savings Rate</p>
        <p className={`mt-1 text-2xl font-bold tabular-nums ${cumulativeSavingsRate >= 0 ? "text-emerald-400" : "text-red-400"}`}>
          {cumulativeSavingsRate.toFixed(1)}%
        </p>
        <p className="mt-0.5 text-xs text-[#94A3B8]">
          {formatCurrency(totalIncome - totalExpenses)} saved total
        </p>
      </div>
    </div>
  )
}
