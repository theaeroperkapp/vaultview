"use client"

import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRequestStore } from "@/stores/requestStore"
import type { PurchaseRequest, RequestVote } from "@/lib/supabase/types"

export function useRequests(householdId: string | undefined) {
  const { setRequests, setVotes, setLoading } = useRequestStore()

  useEffect(() => {
    if (!householdId) return

    const fetchRequests = async () => {
      setLoading(true)
      const supabase = createClient()

      const { data: requests } = await supabase
        .from("purchase_requests")
        .select("*")
        .eq("household_id", householdId)
        .order("created_at", { ascending: false })

      if (requests) {
        setRequests(requests as PurchaseRequest[])

        // Fetch all votes for these requests
        const requestIds = requests.map((r) => r.id)
        if (requestIds.length > 0) {
          const { data: votes } = await supabase
            .from("request_votes")
            .select("*")
            .in("request_id", requestIds)

          if (votes) {
            // Group votes by request_id
            const grouped: Record<string, RequestVote[]> = {}
            for (const vote of votes as RequestVote[]) {
              if (!grouped[vote.request_id]) grouped[vote.request_id] = []
              grouped[vote.request_id].push(vote)
            }
            for (const [requestId, requestVotes] of Object.entries(grouped)) {
              setVotes(requestId, requestVotes)
            }
          }
        }
      }

      setLoading(false)
    }

    fetchRequests()
  }, [householdId, setRequests, setVotes, setLoading])
}
