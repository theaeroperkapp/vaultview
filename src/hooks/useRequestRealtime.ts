"use client"

import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRequestStore } from "@/stores/requestStore"
import type { PurchaseRequest, RequestVote } from "@/lib/supabase/types"

export function useRequestRealtime(householdId: string | undefined) {
  const { addRequest, updateRequest, addVote } = useRequestStore()

  useEffect(() => {
    if (!householdId) return

    const supabase = createClient()

    const channel = supabase
      .channel("purchase-requests")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "purchase_requests",
          filter: `household_id=eq.${householdId}`,
        },
        (payload) => {
          addRequest(payload.new as PurchaseRequest)
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "purchase_requests",
          filter: `household_id=eq.${householdId}`,
        },
        (payload) => {
          const updated = payload.new as PurchaseRequest
          updateRequest(updated.id, updated)
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "request_votes",
        },
        (payload) => {
          addVote(payload.new as RequestVote)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [householdId, addRequest, updateRequest, addVote])
}
