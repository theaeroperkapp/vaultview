"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useHousehold } from "./useHousehold"

export interface PeriodSummary {
  month: number
  year: number
  income: number
  totalPlanned: number
  totalActual: number
  balance: number
  cumulativeNetWorth: number
}

export function useAllPeriods() {
  const { household } = useHousehold()
  const [data, setData] = useState<PeriodSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!household) return

    const supabase = createClient()

    const fetchAll = async () => {
      setIsLoading(true)

      const { data: periods } = await supabase
        .from("budget_periods")
        .select("*")
        .eq("household_id", household.id)

      const allPeriods = (periods || []) as Array<{
        id: string
        month: number
        year: number
        total_income: number
      }>

      if (allPeriods.length === 0) {
        setData([])
        setIsLoading(false)
        return
      }

      allPeriods.sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year
        return a.month - b.month
      })

      const summaries: PeriodSummary[] = []
      let cumulative = 0

      for (const period of allPeriods) {
        const { data: itemData } = await supabase
          .from("budget_items")
          .select("planned_amount, actual_amount")
          .eq("period_id", period.id)

        const items = (itemData || []) as Array<{
          planned_amount: number
          actual_amount: number
        }>

        const totalPlanned = items.reduce((s, i) => s + Number(i.planned_amount), 0)
        const totalActual = items.reduce((s, i) => s + Number(i.actual_amount), 0)
        const income = Number(period.total_income)
        const balance = income - totalActual
        cumulative += balance

        summaries.push({
          month: period.month,
          year: period.year,
          income,
          totalPlanned,
          totalActual,
          balance,
          cumulativeNetWorth: cumulative,
        })
      }

      setData(summaries)
      setIsLoading(false)
    }

    fetchAll()
  }, [household])

  return { data, isLoading }
}
