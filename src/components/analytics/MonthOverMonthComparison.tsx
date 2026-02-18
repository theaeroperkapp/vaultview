"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InfoTip } from "@/components/shared/InfoTip"
import { formatCurrency } from "@/lib/utils/currency"
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react"

interface TrendData {
  month: number
  year: number
  totalActual: number
  totalPlanned: number
  income: number
}

interface MonthOverMonthComparisonProps {
  trendData: TrendData[]
  currentMonth: number
  currentYear: number
}

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null
  return ((current - previous) / previous) * 100
}

interface MetricRowProps {
  label: string
  value: number
  change: number | null
  invertColor?: boolean // true = up is bad (for expenses)
}

function MetricRow({ label, value, change, invertColor }: MetricRowProps) {
  const isPositive = change !== null && change > 0
  const isNegative = change !== null && change < 0
  const isNeutral = change === null || change === 0

  // For expenses: up is red, down is green (inverted)
  const goodUp = invertColor ? false : true
  const colorClass = isNeutral
    ? "text-[#94A3B8] bg-[#1A1D27]"
    : (isPositive === goodUp)
      ? "text-emerald-400 bg-emerald-500/10"
      : "text-red-400 bg-red-500/10"

  return (
    <div className="flex items-center justify-between py-2.5">
      <div>
        <p className="text-xs text-[#94A3B8]">{label}</p>
        <p className="text-base font-semibold tabular-nums text-white">
          {formatCurrency(value)}
        </p>
      </div>
      <div className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${colorClass}`}>
        {isNeutral ? (
          <>
            <Minus className="h-3.5 w-3.5" />
            N/A
          </>
        ) : isPositive ? (
          <>
            <ArrowUpRight className="h-3.5 w-3.5" />
            +{Math.abs(change!).toFixed(1)}%
          </>
        ) : (
          <>
            <ArrowDownRight className="h-3.5 w-3.5" />
            -{Math.abs(change!).toFixed(1)}%
          </>
        )}
      </div>
    </div>
  )
}

export function MonthOverMonthComparison({ trendData, currentMonth, currentYear }: MonthOverMonthComparisonProps) {
  const current = trendData.find((d) => d.month === currentMonth && d.year === currentYear)

  // Find previous month
  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1
  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear
  const previous = trendData.find((d) => d.month === prevMonth && d.year === prevYear)

  if (!current || !previous) {
    return (
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-white">
            Month over Month
            <InfoTip text="Compare this month's performance against the previous month." />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[140px] items-center justify-center text-sm text-[#94A3B8]">
            Need current and previous month data to compare
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentSavings = current.income - current.totalActual
  const previousSavings = previous.income - previous.totalActual

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-white">
          Month over Month
          <InfoTip text="Compare this month's performance against the previous month." />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-[#2A2D3A]/50">
          <MetricRow
            label="Income"
            value={current.income}
            change={pctChange(current.income, previous.income)}
          />
          <MetricRow
            label="Expenses"
            value={current.totalActual}
            change={pctChange(current.totalActual, previous.totalActual)}
            invertColor
          />
          <MetricRow
            label="Savings"
            value={currentSavings}
            change={pctChange(currentSavings, previousSavings)}
          />
        </div>
      </CardContent>
    </Card>
  )
}
