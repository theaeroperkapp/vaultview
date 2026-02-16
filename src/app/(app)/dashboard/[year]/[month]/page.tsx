"use client"

import { use } from "react"
import { MonthSelector } from "@/components/dashboard/MonthSelector"
import { BalanceCard } from "@/components/dashboard/BalanceCard"
import { SummaryCards } from "@/components/dashboard/SummaryCards"
import { CategoryDonut } from "@/components/dashboard/CategoryDonut"
import { BudgetTable } from "@/components/dashboard/BudgetTable"
import { ActivityFeed } from "@/components/dashboard/ActivityFeed"
import { useBudgetPeriod } from "@/hooks/useBudgetPeriod"
import { useBudgetRealtime } from "@/hooks/useBudgetRealtime"
import { useHousehold } from "@/hooks/useHousehold"
import { useBudgetStore } from "@/stores/budgetStore"
import { Skeleton } from "@/components/ui/skeleton"
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

  const totals = useBudgetStore((s) => s.getTotals())

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64 bg-[#1A1D27]" />
        <Skeleton className="h-32 w-full bg-[#1A1D27]" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 bg-[#1A1D27]" />
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

      {/* Balance Hero */}
      <BalanceCard
        balance={totals.balance}
        income={totals.income}
        expenses={totals.totalActual}
      />

      {/* Summary Cards */}
      <SummaryCards
        totalPlanned={totals.totalPlanned}
        totalActual={totals.totalActual}
        totalDifference={totals.totalDifference}
        income={totals.income}
      />

      {/* Charts + Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CategoryDonut categories={categories} items={items} />
        <ActivityFeed householdId={household?.id} />
      </div>

      {/* Budget Table */}
      <BudgetTable categories={categories} items={items} />
    </div>
  )
}
