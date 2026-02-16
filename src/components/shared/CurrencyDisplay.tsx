"use client"

import { cn } from "@/lib/utils"
import { formatCurrency, getDifferenceColor, getDifferenceIcon } from "@/lib/utils/currency"

interface CurrencyDisplayProps {
  amount: number
  className?: string
  showSign?: boolean
}

export function CurrencyDisplay({ amount, className, showSign }: CurrencyDisplayProps) {
  return (
    <span className={cn("tabular-nums", className)}>
      {showSign && amount > 0 ? "+" : ""}
      {formatCurrency(amount)}
    </span>
  )
}

interface DifferenceDisplayProps {
  planned: number
  actual: number
  className?: string
}

export function DifferenceDisplay({ planned, actual, className }: DifferenceDisplayProps) {
  const diff = planned - actual
  const color = getDifferenceColor(planned, actual)
  const icon = getDifferenceIcon(planned, actual)

  return (
    <span className={cn("tabular-nums inline-flex items-center gap-1", color, className)}>
      <span className="text-xs">{icon}</span>
      {formatCurrency(Math.abs(diff))}
    </span>
  )
}
