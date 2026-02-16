"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils/currency"
import { TrendingUp, TrendingDown } from "lucide-react"

interface BalanceCardProps {
  balance: number
  income: number
  expenses: number
}

export function BalanceCard({ balance, income, expenses }: BalanceCardProps) {
  const [displayBalance, setDisplayBalance] = useState(0)
  const isPositive = balance >= 0

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

  return (
    <Card className="border-[#2A2D3A] bg-gradient-to-br from-[#1A1D27] to-[#1E2130]">
      <CardContent className="p-6">
        <p className="mb-1 text-sm font-medium text-[#94A3B8]">Monthly Balance</p>
        <div className="flex items-center gap-3">
          <p
            className={`animate-count-up text-4xl font-bold tabular-nums ${isPositive ? "text-emerald-400" : "text-red-400"}`}
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            {formatCurrency(displayBalance)}
          </p>
          {isPositive ? (
            <TrendingUp className="h-6 w-6 text-emerald-400" />
          ) : (
            <TrendingDown className="h-6 w-6 text-red-400" />
          )}
        </div>
        <div className="mt-3 flex gap-6 text-sm">
          <div>
            <span className="text-[#94A3B8]">Income: </span>
            <span className="font-medium text-emerald-400 tabular-nums">{formatCurrency(income)}</span>
          </div>
          <div>
            <span className="text-[#94A3B8]">Expenses: </span>
            <span className="font-medium text-red-400 tabular-nums">{formatCurrency(expenses)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
