"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { formatCurrency } from "@/lib/utils/currency"

interface SavingsGaugeProps {
  income: number
  expenses: number
}

export function SavingsGauge({ income, expenses }: SavingsGaugeProps) {
  const savings = income - expenses
  const savingsRate = income > 0 ? (savings / income) * 100 : 0
  const isPositive = savings >= 0

  return (
    <Card className="border-[#2A2D3A] bg-[#1A1D27]">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-white">Savings Rate</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p
            className={`text-4xl font-bold tabular-nums ${isPositive ? "text-emerald-400" : "text-red-400"}`}
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            {savingsRate.toFixed(1)}%
          </p>
          <p className="mt-1 text-sm text-[#94A3B8]">
            {isPositive ? "of income saved" : "over budget"}
          </p>
        </div>

        <Progress
          value={Math.min(Math.abs(savingsRate), 100)}
          className="h-3 bg-[#2A2D3A]"
        />

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="text-center">
            <p className="text-xs text-[#94A3B8]">Income</p>
            <p className="font-semibold tabular-nums text-emerald-400">{formatCurrency(income)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-[#94A3B8]">Expenses</p>
            <p className="font-semibold tabular-nums text-red-400">{formatCurrency(expenses)}</p>
          </div>
        </div>

        <div className="rounded-lg bg-[#0F1117] p-3 text-center">
          <p className="text-xs text-[#94A3B8]">Net Savings</p>
          <p className={`text-xl font-bold tabular-nums ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
            {isPositive ? "+" : ""}{formatCurrency(savings)}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
