"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getMonthName, getPreviousMonth, getNextMonth, getCurrentMonth, getCurrentYear } from "@/lib/utils/dates"
import { MONTH_NAMES } from "@/lib/constants"

interface MonthSelectorProps {
  month: number
  year: number
  onChange?: (month: number, year: number) => void
}

export function MonthSelector({ month, year, onChange }: MonthSelectorProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [gridYear, setGridYear] = useState(year)
  const popoverRef = useRef<HTMLDivElement>(null)

  const prev = getPreviousMonth(month, year)
  const next = getNextMonth(month, year)

  const navigate = (m: number, y: number) => {
    if (onChange) {
      onChange(m, y)
    } else {
      router.push(`/dashboard/${y}/${m}`)
    }
  }

  const handleToday = () => {
    navigate(getCurrentMonth(), getCurrentYear())
    setOpen(false)
  }

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open])

  return (
    <div className="relative flex items-center gap-3">
      <Button
        variant="ghost"
        size="icon"
        className="text-[#94A3B8] hover:text-white"
        onClick={() => navigate(prev.month, prev.year)}
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      <button
        onClick={() => { setGridYear(year); setOpen(!open) }}
        className="flex min-w-[180px] items-center justify-center gap-2 text-xl font-semibold text-white hover:text-emerald-400 transition-colors"
        style={{ fontFamily: 'var(--font-playfair)' }}
      >
        {getMonthName(month)} {year}
      </button>

      <Button
        variant="ghost"
        size="icon"
        className="text-[#94A3B8] hover:text-white"
        onClick={() => navigate(next.month, next.year)}
      >
        <ChevronRight className="h-5 w-5" />
      </Button>

      {/* Month grid popover */}
      {open && (
        <div
          ref={popoverRef}
          className="absolute left-1/2 top-full z-50 mt-2 w-72 -translate-x-1/2 glass-card p-4 shadow-xl"
        >
          <div className="mb-3 flex items-center justify-between">
            <Button variant="ghost" size="icon" className="h-7 w-7 text-[#94A3B8]" onClick={() => setGridYear(gridYear - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-semibold text-white">{gridYear}</span>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-[#94A3B8]" onClick={() => setGridYear(gridYear + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {MONTH_NAMES.map((name, i) => {
              const m = i + 1
              const isCurrent = m === month && gridYear === year
              return (
                <button
                  key={name}
                  className={`rounded-lg px-2 py-1.5 text-sm transition-colors ${
                    isCurrent
                      ? "bg-emerald-500/20 text-emerald-400 font-medium"
                      : "text-[#94A3B8] hover:bg-[#2A2D3A] hover:text-white"
                  }`}
                  onClick={() => { navigate(m, gridYear); setOpen(false) }}
                >
                  {name.slice(0, 3)}
                </button>
              )
            })}
          </div>
          <div className="mt-3 border-t border-[#2A2D3A] pt-3">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
              onClick={handleToday}
            >
              <CalendarDays className="mr-2 h-4 w-4" />
              Today
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
