"use client"

import { formatCurrency } from "@/lib/utils/currency"
import { Receipt, Target, PiggyBank, Wallet } from "lucide-react"
import { LineChart, Line, ResponsiveContainer } from "recharts"
import { InfoTip } from "@/components/shared/InfoTip"
import type { PeriodSummary } from "@/hooks/useAllPeriods"

interface SummaryCardsProps {
  totalPlanned: number
  totalActual: number
  totalDifference: number
  income: number
  trendData?: PeriodSummary[]
}

export function SummaryCards({ totalPlanned, totalActual, totalDifference, income, trendData }: SummaryCardsProps) {
  const saved = income - totalActual
  const trends = trendData || []
  const prevMonth = trends.length >= 2 ? trends[trends.length - 2] : null

  const getMoM = (current: number, previous: number | undefined) => {
    if (!previous || previous === 0) return null
    return ((current - previous) / previous * 100)
  }

  const cards = [
    {
      label: "Spent",
      value: totalActual,
      icon: Receipt,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      sparkKey: "totalActual" as const,
      moM: prevMonth ? getMoM(totalActual, prevMonth.totalActual) : null,
      tip: "Total actual spending across all budget categories this month.",
    },
    {
      label: "Budget",
      value: totalPlanned,
      icon: Target,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      sparkKey: "totalPlanned" as const,
      moM: prevMonth ? getMoM(totalPlanned, prevMonth.totalPlanned) : null,
      tip: "Total planned budget across all categories for this month.",
    },
    {
      label: "Remaining",
      value: totalDifference,
      icon: PiggyBank,
      color: totalDifference >= 0 ? "text-emerald-400" : "text-red-400",
      bgColor: totalDifference >= 0 ? "bg-emerald-500/10" : "bg-red-500/10",
      sparkKey: "balance" as const,
      moM: prevMonth ? getMoM(totalDifference, prevMonth.totalPlanned - prevMonth.totalActual) : null,
      tip: "Budget minus actual spending. Positive means you're under budget.",
    },
    {
      label: "Saved",
      value: saved,
      icon: Wallet,
      color: saved >= 0 ? "text-emerald-400" : "text-red-400",
      bgColor: saved >= 0 ? "bg-emerald-500/10" : "bg-red-500/10",
      sparkKey: "balance" as const,
      moM: prevMonth ? getMoM(saved, prevMonth.income - prevMonth.totalActual) : null,
      tip: "Income minus actual expenses. This is how much you kept this month.",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, i) => {
        const sparkData = trends.slice(-6).map((t) => ({
          value: card.sparkKey === "balance" ? t.income - t.totalActual : t[card.sparkKey],
        }))

        return (
          <div
            key={card.label}
            className="glass-card p-4 animate-fade-in-up hover:border-emerald-500/20 transition-all duration-300"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`rounded-lg p-2.5 ${card.bgColor}`}>
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                </div>
                <div>
                  <p className="text-xs font-medium text-[#94A3B8] flex items-center gap-1">{card.label} <InfoTip text={card.tip} /></p>
                  <p className={`text-lg font-bold tabular-nums ${card.color}`}>
                    {formatCurrency(card.value)}
                  </p>
                </div>
              </div>
              {sparkData.length > 1 && (
                <div className="h-8 w-16">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sparkData}>
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke={card.color.includes("emerald") ? "#10B981" : card.color.includes("purple") ? "#A78BFA" : card.color.includes("blue") ? "#60A5FA" : "#F87171"}
                        strokeWidth={1.5}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
            {card.moM !== null && (
              <div className="mt-2 text-xs">
                <span className={card.moM >= 0 ? "text-emerald-400" : "text-red-400"}>
                  {card.moM >= 0 ? "+" : ""}{card.moM.toFixed(1)}%
                </span>
                <span className="text-[#94A3B8]"> vs last month</span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
