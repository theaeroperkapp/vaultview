"use client"

import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils/currency"
import { Target, Receipt, PiggyBank, DollarSign } from "lucide-react"

interface SummaryCardsProps {
  totalPlanned: number
  totalActual: number
  totalDifference: number
  income: number
}

export function SummaryCards({ totalPlanned, totalActual, totalDifference, income }: SummaryCardsProps) {
  const cards = [
    {
      label: "Total Planned",
      value: totalPlanned,
      icon: Target,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Total Actual",
      value: totalActual,
      icon: Receipt,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
    },
    {
      label: "Difference",
      value: totalDifference,
      icon: PiggyBank,
      color: totalDifference >= 0 ? "text-emerald-400" : "text-red-400",
      bgColor: totalDifference >= 0 ? "bg-emerald-500/10" : "bg-red-500/10",
    },
    {
      label: "Income",
      value: income,
      icon: DollarSign,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label} className="border-[#2A2D3A] bg-[#1A1D27]">
          <CardContent className="flex items-center gap-4 p-4">
            <div className={`rounded-lg p-2.5 ${card.bgColor}`}>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
            <div>
              <p className="text-xs font-medium text-[#94A3B8]">{card.label}</p>
              <p className={`text-lg font-bold tabular-nums ${card.color}`}>
                {formatCurrency(card.value)}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
