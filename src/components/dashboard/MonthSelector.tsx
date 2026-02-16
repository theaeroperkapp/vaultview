"use client"

import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getMonthName, getPreviousMonth, getNextMonth } from "@/lib/utils/dates"

interface MonthSelectorProps {
  month: number
  year: number
  onChange?: (month: number, year: number) => void
}

export function MonthSelector({ month, year, onChange }: MonthSelectorProps) {
  const router = useRouter()

  const prev = getPreviousMonth(month, year)
  const next = getNextMonth(month, year)

  const handlePrev = () => {
    if (onChange) {
      onChange(prev.month, prev.year)
    } else {
      router.push(`/dashboard/${prev.year}/${prev.month}`)
    }
  }

  const handleNext = () => {
    if (onChange) {
      onChange(next.month, next.year)
    } else {
      router.push(`/dashboard/${next.year}/${next.month}`)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="ghost"
        size="icon"
        className="text-[#94A3B8] hover:text-white"
        onClick={handlePrev}
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
        onClick={handleNext}
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  )
}
