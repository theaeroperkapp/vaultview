"use client"

import { useState } from "react"
import { useAllPeriods } from "@/hooks/useAllPeriods"
import { YearSummaryHero } from "@/components/year-overview/YearSummaryHero"
import { MonthlyBreakdownChart } from "@/components/year-overview/MonthlyBreakdownChart"
import { AnnualCategoryBreakdown } from "@/components/year-overview/AnnualCategoryBreakdown"
import { SavingsProgressCard } from "@/components/year-overview/SavingsProgressCard"
import { getCurrentYear } from "@/lib/utils/dates"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function YearOverviewPage() {
  const [year, setYear] = useState(getCurrentYear())
  const { data: allPeriods, isLoading } = useAllPeriods()

  const yearData = allPeriods.filter((d) => d.year === year)

  // Get unique years for navigation
  const years = [...new Set(allPeriods.map((d) => d.year))].sort()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 animate-shimmer rounded-lg" />
        <div className="h-36 animate-shimmer rounded-xl" />
        <div className="h-[350px] animate-shimmer rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Year selector */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="text-[#94A3B8] hover:text-white"
          onClick={() => setYear(year - 1)}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2
          className="min-w-[100px] text-center text-xl font-semibold text-white"
          style={{ fontFamily: 'var(--font-playfair)' }}
        >
          {year}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          className="text-[#94A3B8] hover:text-white"
          onClick={() => setYear(year + 1)}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <YearSummaryHero data={yearData} year={year} />

      <MonthlyBreakdownChart data={yearData} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AnnualCategoryBreakdown data={yearData} year={year} />
        </div>
        <SavingsProgressCard data={yearData} />
      </div>
    </div>
  )
}
