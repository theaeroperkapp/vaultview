"use client"

import { use } from "react"
import { MonthSelector } from "@/components/dashboard/MonthSelector"
import { BalanceCard } from "@/components/dashboard/BalanceCard"
import { SummaryCards } from "@/components/dashboard/SummaryCards"
import { CategoryDonut } from "@/components/dashboard/CategoryDonut"
import { BudgetProgress } from "@/components/dashboard/BudgetProgress"
import { ActivityFeed } from "@/components/dashboard/ActivityFeed"
import { useBudgetPeriod } from "@/hooks/useBudgetPeriod"
import { useBudgetRealtime } from "@/hooks/useBudgetRealtime"
import { useHousehold } from "@/hooks/useHousehold"
import { useAllPeriods } from "@/hooks/useAllPeriods"
import { useBudgetStore, useBudgetTotals } from "@/stores/budgetStore"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, Upload } from "lucide-react"

export default function DashboardPage({ params }: { params: Promise<{ year: string; month: string }> }) {
  const resolvedParams = use(params)
  const month = parseInt(resolvedParams.month)
  const year = parseInt(resolvedParams.year)

  const { household } = useHousehold()
  useBudgetPeriod(month, year)
  const { period, categories, items, isLoading } = useBudgetStore()
  useBudgetRealtime(period?.id)

  const totals = useBudgetTotals()
  const { data: allPeriods } = useAllPeriods()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 animate-shimmer rounded-lg" />
        <div className="h-40 w-full animate-shimmer rounded-xl" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 animate-shimmer rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <MonthSelector month={month} year={year} />
        <div className="flex items-center gap-2">
          <Link href="/budget/import">
            <Button variant="outline" size="sm" className="border-[#2A2D3A] bg-transparent text-[#94A3B8] hover:bg-[#1A1D27] hover:text-white">
              <Upload className="mr-2 h-4 w-4" /> Import CSV
            </Button>
          </Link>
          <Link href="/budget">
            <Button size="sm" className="bg-emerald-500 text-white hover:bg-emerald-600">
              <Plus className="mr-2 h-4 w-4" /> Edit Budget
            </Button>
          </Link>
        </div>
      </div>

      {/* Balance Hero — Full Width + glow-border */}
      <BalanceCard
        balance={totals.balance}
        income={totals.income}
        expenses={totals.totalActual}
        trendData={allPeriods}
      />

      {/* Summary Cards x4 — glassmorphism + sparklines */}
      <SummaryCards
        totalPlanned={totals.totalPlanned}
        totalActual={totals.totalActual}
        totalDifference={totals.totalDifference}
        income={totals.income}
        trendData={allPeriods}
      />

      {/* Budget Progress (2/3) + Category Donut (1/3) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <BudgetProgress categories={categories} items={items} />
        </div>
        <CategoryDonut categories={categories} items={items} />
      </div>

      {/* Activity Feed — compact, full width */}
      <ActivityFeed householdId={household?.id} />
    </div>
  )
}
