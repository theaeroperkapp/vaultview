"use client"

import { useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useBudgetStore } from "@/stores/budgetStore"
import { useHousehold } from "./useHousehold"

export function useBudgetPeriod(month: number, year: number) {
  const { household } = useHousehold()
  const {
    setPeriod,
    setCategories,
    setItems,
    setLoading,
    setError,
  } = useBudgetStore()

  const fetchBudgetData = useCallback(async () => {
    if (!household) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    const supabase = createClient()

    try {
      // Fetch or create period
      let { data: period } = await supabase
        .from("budget_periods")
        .select("*")
        .eq("household_id", household.id)
        .eq("month", month)
        .eq("year", year)
        .single()

      if (!period) {
        const { data: newPeriod, error: createError } = await supabase
          .from("budget_periods")
          .insert({ household_id: household.id, month, year })
          .select()
          .single()

        if (createError) throw createError
        period = newPeriod
      }

      setPeriod(period)

      // Fetch categories
      const { data: categories } = await supabase
        .from("budget_categories")
        .select("*")
        .eq("household_id", household.id)
        .order("sort_order")

      setCategories(categories || [])

      // Fetch items
      const { data: items } = await supabase
        .from("budget_items")
        .select("*")
        .eq("period_id", period!.id)
        .order("sort_order")

      setItems(items || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load budget data")
    } finally {
      setLoading(false)
    }
  }, [household, month, year, setPeriod, setCategories, setItems, setLoading, setError])

  useEffect(() => {
    fetchBudgetData()
  }, [fetchBudgetData])

  return { refetch: fetchBudgetData }
}
