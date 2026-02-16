"use client"

import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getMonthName, getPreviousMonth, getNextMonth } from "@/lib/utils/dates"

interface MonthSelectorProps {
  month: number
  year: number
}

export function MonthSelector({ month, year }: MonthSelectorProps) {
  const router = useRouter()

  const prev = getPreviousMonth(month, year)
  const next = getNextMonth(month, year)

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="ghost"
        size="icon"
        className="text-[#94A3B8] hover:text-white"
        onClick={() => router.push(`/dashboard/${prev.year}/${prev.month}`)}
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <h2 className="min-w-[180px] text-center text-xl font-semibold text-white" style={{ fontFamily: 'var(--font-playfair)' }}>
        {getMonthName(month)} {year}
      </h2>
      <Button
        variant="ghost"
        size="icon"
        className="text-[#94A3B8] hover:text-white"
        onClick={() => router.push(`/dashboard/${next.year}/${next.month}`)}
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  )
}
