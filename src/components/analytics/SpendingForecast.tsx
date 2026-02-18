"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InfoTip } from "@/components/shared/InfoTip"
import { formatCurrency } from "@/lib/utils/currency"
import { getMonthName } from "@/lib/utils/dates"
import { TrendingUp, TrendingDown } from "lucide-react"

interface TrendData {
  month: number
  year: number
  totalActual: number
  totalPlanned: number
  income: number
}

interface SpendingForecastProps {
  trendData: TrendData[]
}

function linearRegression(values: number[]): { slope: number; intercept: number } {
  const n = values.length
  if (n < 2) return { slope: 0, intercept: values[0] || 0 }
  const sumX = values.reduce((s, _, i) => s + i, 0)
  const sumY = values.reduce((s, v) => s + v, 0)
  const sumXY = values.reduce((s, v, i) => s + i * v, 0)
  const sumX2 = values.reduce((s, _, i) => s + i * i, 0)
  const denom = n * sumX2 - sumX * sumX
  if (denom === 0) return { slope: 0, intercept: sumY / n }
  const slope = (n * sumXY - sumX * sumY) / denom
  const intercept = (sumY - slope * sumX) / n
  return { slope, intercept }
}

function getNextMonth(month: number, year: number): { month: number; year: number } {
  if (month === 12) return { month: 1, year: year + 1 }
  return { month: month + 1, year }
}

export function SpendingForecast({ trendData }: SpendingForecastProps) {
  if (trendData.length < 3) {
    return (
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-white">
            Spending Forecast
            <InfoTip text="Projected spending for next month based on your historical trends. Requires at least 3 months of data." />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[140px] items-center justify-center text-sm text-[#94A3B8]">
            Need at least 3 months of data for forecasting
          </div>
        </CardContent>
      </Card>
    )
  }

  const expenses = trendData.map((d) => d.totalActual)
  const incomes = trendData.map((d) => d.income)

  const expReg = linearRegression(expenses)
  const projectedExpenses = Math.max(0, expReg.intercept + expReg.slope * trendData.length)

  // Income projection: average of last 3 months
  const recentIncomes = incomes.slice(-3)
  const projectedIncome = recentIncomes.reduce((a, b) => a + b, 0) / recentIncomes.length

  const projectedSavings = projectedIncome - projectedExpenses

  const lastEntry = trendData[trendData.length - 1]
  const nextM = getNextMonth(lastEntry.month, lastEntry.year)
  const nextLabel = `${getMonthName(nextM.month)} ${nextM.year}`

  const expenseTrend = expReg.slope
  const currentExpenses = lastEntry.totalActual
  const expenseChange = currentExpenses > 0
    ? ((projectedExpenses - currentExpenses) / currentExpenses) * 100
    : 0

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-white">
          Spending Forecast
          <InfoTip text="Projected spending for next month based on your historical trends." />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-xs text-[#64748B]">Projection for {nextLabel}</p>

        <div className="space-y-4">
          {/* Projected Expenses */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[#94A3B8]">Projected Expenses</p>
              <p className="text-lg font-bold tabular-nums text-white">
                {formatCurrency(projectedExpenses)}
              </p>
            </div>
            <div className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
              expenseTrend > 0
                ? "bg-red-500/10 text-red-400"
                : "bg-emerald-500/10 text-emerald-400"
            }`}>
              {expenseTrend > 0 ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" />
              )}
              {Math.abs(expenseChange).toFixed(1)}%
            </div>
          </div>

          {/* Projected Income */}
          <div>
            <p className="text-xs text-[#94A3B8]">Projected Income</p>
            <p className="text-lg font-bold tabular-nums text-white">
              {formatCurrency(projectedIncome)}
            </p>
          </div>

          {/* Projected Savings */}
          <div className="border-t border-[#2A2D3A] pt-3">
            <p className="text-xs text-[#94A3B8]">Projected Savings</p>
            <p className={`text-xl font-bold tabular-nums ${projectedSavings >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {formatCurrency(projectedSavings)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
