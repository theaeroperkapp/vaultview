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

    // Only show skeleton if we have no data yet (first load)
    const hasData = useBudgetStore.getState().items.length > 0
    if (!hasData) setLoading(true)
    setError(null)
    const supabase = createClient()

    try {
      // Fetch period (use maybeSingle to avoid 406 when no rows)
      const { data: period, error: periodError } = await supabase
        .from("budget_periods")
        .select("*")
        .eq("household_id", household.id)
        .eq("month", month)
        .eq("year", year)
        .maybeSingle()

      if (periodError) throw periodError

      if (!period) {
        // No period for this month — show empty state
        setPeriod(null)
        setCategories([])
        setItems([])
        return
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
