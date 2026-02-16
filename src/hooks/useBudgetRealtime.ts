"use client"

import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useBudgetStore } from "@/stores/budgetStore"
import type { BudgetItem } from "@/lib/supabase/types"

async function notifyHouseholdMembers(
  supabase: ReturnType<typeof createClient>,
  type: "budget_add" | "budget_edit" | "budget_remove",
  title: string,
  body: string
) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Get user's household
  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle()

  if (!membership) return

  // Get other members
  const { data: members } = await supabase
    .from("household_members")
    .select("user_id")
    .eq("household_id", membership.household_id)
    .neq("user_id", user.id)

  if (!members || members.length === 0) return

  const notifications = members.map((m) => ({
    household_id: membership.household_id,
    user_id: m.user_id,
    type,
    title,
    body,
  }))

  await supabase.from("notifications").insert(notifications)
}

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
          const item = payload.new as BudgetItem
          addItem(item)
          notifyHouseholdMembers(
            supabase,
            "budget_add",
            `Budget item added: "${item.name}"`,
            `$${Number(item.planned_amount).toFixed(2)} planned`
          )
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
          const item = payload.new as BudgetItem
          updateItem(payload.new.id, item)
          notifyHouseholdMembers(
            supabase,
            "budget_edit",
            `Budget item updated: "${item.name}"`,
            `$${Number(item.actual_amount).toFixed(2)} actual / $${Number(item.planned_amount).toFixed(2)} planned`
          )
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
          notifyHouseholdMembers(
            supabase,
            "budget_remove",
            "Budget item removed",
            `A budget item was deleted`
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [periodId, updateItem, addItem, removeItem])
}
