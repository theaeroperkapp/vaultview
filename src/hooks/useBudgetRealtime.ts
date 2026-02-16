"use client"

import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useBudgetStore } from "@/stores/budgetStore"
import type { BudgetItem } from "@/lib/supabase/types"

export function useBudgetRealtime(periodId: string | undefined) {
  const { updateItem, addItem, removeItem } = useBudgetStore()

  useEffect(() => {
    if (!periodId) return

    const supabase = createClient()

    const channel = supabase
      .channel("budget-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "budget_items",
          filter: `period_id=eq.${periodId}`,
        },
        (payload) => {
          addItem(payload.new as BudgetItem)
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "budget_items",
          filter: `period_id=eq.${periodId}`,
        },
        (payload) => {
          updateItem(payload.new.id, payload.new as BudgetItem)
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "budget_items",
          filter: `period_id=eq.${periodId}`,
        },
        (payload) => {
          removeItem(payload.old.id)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [periodId, updateItem, addItem, removeItem])
}
