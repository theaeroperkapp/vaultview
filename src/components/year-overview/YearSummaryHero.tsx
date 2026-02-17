"use client"

import { formatCurrency } from "@/lib/utils/currency"
import type { PeriodSummary } from "@/hooks/useAllPeriods"

interface YearSummaryHeroProps {
  data: PeriodSummary[]
  year: number
}

export function YearSummaryHero({ data, year }: YearSummaryHeroProps) {
  // Only count months that actually have activity
  const activeMonths = data.filter((d) => d.income > 0 || d.totalActual > 0)
  const annualIncome = activeMonths.reduce((s, d) => s + d.income, 0)
  const annualExpenses = activeMonths.reduce((s, d) => s + d.totalActual, 0)
  const annualSavings = annualIncome - annualExpenses

  // Project full year if we don't have 12 months
  const monthsWithData = activeMonths.length
  const projectedIncome = monthsWithData > 0 ? (annualIncome / monthsWithData) * 12 : 0
  const projectedExpenses = monthsWithData > 0 ? (annualExpenses / monthsWithData) * 12 : 0
  const projectedSavings = projectedIncome - projectedExpenses

  return (
    <div className="glow-border rounded-xl bg-gradient-to-br from-emerald-500/10 via-[#1A1D27] to-[#1E2130] p-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="animate-fade-in-up" style={{ animationDelay: "0ms" }}>
          <p className="text-xs font-medium text-[#94A3B8]">Annual Income</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-emerald-400" style={{ fontFamily: 'var(--font-playfair)' }}>
            {formatCurrency(annualIncome)}
          </p>
          {monthsWithData < 12 && monthsWithData > 0 && (
            <p className="mt-1 text-xs text-[#94A3B8]">
              Projected: {formatCurrency(projectedIncome)}
            </p>
          )}
        </div>

        <div className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <p className="text-xs font-medium text-[#94A3B8]">Annual Expenses</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-red-400" style={{ fontFamily: 'var(--font-playfair)' }}>
            {formatCurrency(annualExpenses)}
          </p>
          {monthsWithData < 12 && monthsWithData > 0 && (
            <p className="mt-1 text-xs text-[#94A3B8]">
              Projected: {formatCurrency(projectedExpenses)}
            </p>
          )}
        </div>

        <div className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <p className="text-xs font-medium text-[#94A3B8]">Annual Savings</p>
          <p className={`mt-1 text-2xl font-bold tabular-nums ${annualSavings >= 0 ? "text-emerald-400" : "text-red-400"}`} style={{ fontFamily: 'var(--font-playfair)' }}>
            {annualSavings >= 0 ? "+" : ""}{formatCurrency(annualSavings)}
          </p>
          {monthsWithData < 12 && monthsWithData > 0 && (
            <p className="mt-1 text-xs text-[#94A3B8]">
              Projected: {projectedSavings >= 0 ? "+" : ""}{formatCurrency(projectedSavings)}
            </p>
          )}
        </div>
      </div>

      <p className="mt-4 text-xs text-[#94A3B8]">
        {monthsWithData} of 12 months in {year}
      </p>
    </div>
  )
}
