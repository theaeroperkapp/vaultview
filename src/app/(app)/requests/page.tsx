"use client"

import { useEffect, useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useHousehold } from "@/hooks/useHousehold"
import { useRequests } from "@/hooks/useRequests"
import { useRequestRealtime } from "@/hooks/useRequestRealtime"
import { useRequestStore } from "@/stores/requestStore"
import { RequestCard } from "@/components/requests/RequestCard"
import { NewRequestForm } from "@/components/requests/NewRequestForm"
import { checkAndResolveRequest } from "@/lib/utils/resolveVotes"
import { createClient } from "@/lib/supabase/client"
import type { Profile } from "@/lib/supabase/types"

export default function RequestsPage() {
  const { household } = useHousehold()
  const [userId, setUserId] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [members, setMembers] = useState<Profile[]>([])
  const [showNewForm, setShowNewForm] = useState(false)
  const [activeTab, setActiveTab] = useState<"active" | "history">("active")

  useRequests(household?.id)
  useRequestRealtime(household?.id)

  const { requests, votes, isLoading } = useRequestStore()

  // Fetch current user and household members
  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()

      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)

      if (!household?.id) return

      const { data: memberRows } = await supabase
        .from("household_members")
        .select("user_id")
        .eq("household_id", household.id)

      if (memberRows) {
        const userIds = memberRows.map((m) => m.user_id)
        const { data: profiles } = await supabase
          .from("profiles")
          .select("*")
          .in("id", userIds)

        if (profiles) setMembers(profiles as Profile[])

        // Check if current user is admin
        if (user) {
          const { data: myMembership } = await supabase
            .from("household_members")
            .select("role")
            .eq("household_id", household!.id)
            .eq("user_id", user.id)
            .single()

          if (myMembership?.role === "admin") setIsAdmin(true)
        }
      }
    }

    fetchData()
  }, [household?.id])

  // Resolve any pending requests that may have expired
  useEffect(() => {
    if (!household?.id) return
    const pendingRequests = requests.filter((r) => r.status === "pending")
    for (const req of pendingRequests) {
      if (new Date(req.vote_deadline).getTime() <= Date.now()) {
        checkAndResolveRequest(req.id, household.id)
      }
    }
  }, [requests, household?.id])

  const activeRequests = requests.filter((r) => r.status === "pending")
  const historyRequests = requests.filter((r) => r.status !== "pending")

  const displayedRequests =
    activeTab === "active" ? activeRequests : historyRequests

  if (isLoading) {
    return (
      <div className="space-y-4 animate-slide-in">
        <div className="h-10 w-64 animate-shimmer rounded-lg" />
        <div className="h-48 w-full animate-shimmer rounded-xl" />
        <div className="h-48 w-full animate-shimmer rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 rounded-lg bg-[#1A1D27] p-1">
          <button
            onClick={() => setActiveTab("active")}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              activeTab === "active"
                ? "bg-emerald-500/20 text-emerald-400"
                : "text-[#94A3B8] hover:text-white"
            }`}
          >
            Active ({activeRequests.length})
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              activeTab === "history"
                ? "bg-emerald-500/20 text-emerald-400"
                : "text-[#94A3B8] hover:text-white"
            }`}
          >
            History ({historyRequests.length})
          </button>
        </div>

        <Button
          className="gap-2 bg-emerald-600 hover:bg-emerald-700"
          onClick={() => setShowNewForm(true)}
        >
          <Plus className="h-4 w-4" />
          New Request
        </Button>
      </div>

      {/* Request List */}
      {displayedRequests.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center py-16 text-center">
          <p className="text-lg font-medium text-white">
            {activeTab === "active"
              ? "No active requests"
              : "No request history yet"}
          </p>
          <p className="mt-1 text-sm text-[#94A3B8]">
            {activeTab === "active"
              ? "Submit a new purchase request for your household to vote on"
              : "Completed requests will appear here"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {displayedRequests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              votes={votes[request.id] || []}
              members={members}
              currentUserId={userId || ""}
              householdId={household?.id || ""}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}

      {/* New Request Dialog */}
      {household?.id && userId && (
        <NewRequestForm
          open={showNewForm}
          onOpenChange={setShowNewForm}
          householdId={household.id}
          userId={userId}
        />
      )}
    </div>
  )
}
