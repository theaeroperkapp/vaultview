"use client"

import { useState } from "react"
import { Zap, ThumbsUp, ThumbsDown, Calendar, Clock, ShieldCheck } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/utils/currency"
import { createClient } from "@/lib/supabase/client"
import { useRequestStore } from "@/stores/requestStore"
import { VoteProgress } from "@/components/requests/VoteProgress"
import { checkAndResolveRequest } from "@/lib/utils/resolveVotes"
import { toast } from "sonner"
import type { PurchaseRequest, Profile, RequestVote } from "@/lib/supabase/types"

interface RequestCardProps {
  request: PurchaseRequest
  votes: RequestVote[]
  members: Profile[]
  currentUserId: string
  householdId: string
  isAdmin?: boolean
}

const STATUS_STYLES: Record<PurchaseRequest["status"], string> = {
  pending: "bg-amber-500/20 text-amber-400",
  approved: "bg-emerald-500/20 text-emerald-400",
  denied: "bg-red-500/20 text-red-400",
  cancelled: "bg-[#2A2D3A] text-[#94A3B8]",
}

function getCountdown(deadline: string): string {
  const diff = new Date(deadline).getTime() - Date.now()
  if (diff <= 0) return "Voting closed"
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h left`
  return `${hours}h ${minutes}m left`
}

export function RequestCard({
  request,
  votes,
  members,
  currentUserId,
  householdId,
  isAdmin,
}: RequestCardProps) {
  const [voting, setVoting] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [approving, setApproving] = useState(false)
  const { addVote, updateRequest } = useRequestStore()

  const isRequester = request.requester_id === currentUserId
  const hasVoted = votes.some((v) => v.voter_id === currentUserId)
  const canVote = !isRequester && !hasVoted && request.status === "pending"
  const deadlinePassed = new Date(request.vote_deadline).getTime() <= Date.now()
  const requester = members.find((m) => m.id === request.requester_id)

  const handleVote = async (vote: "yes" | "no") => {
    setVoting(true)
    const supabase = createClient()

    const { data, error } = await supabase
      .from("request_votes")
      .insert({
        request_id: request.id,
        voter_id: currentUserId,
        vote,
      })
      .select()
      .single()

    if (error) {
      toast.error("Failed to vote: " + error.message)
      setVoting(false)
      return
    }

    if (data) {
      addVote(data as RequestVote)

      // Notify requester
      await supabase.from("notifications").insert({
        household_id: householdId,
        user_id: request.requester_id,
        type: "request_vote",
        title: `Vote on "${request.title}"`,
        body: `Someone voted ${vote} on your purchase request`,
        reference_id: request.id,
      })

      // Check if all votes are in
      await checkAndResolveRequest(request.id, householdId)
    }

    setVoting(false)
  }

  const handleCancel = async () => {
    setCancelling(true)
    const supabase = createClient()

    const { error } = await supabase
      .from("purchase_requests")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("id", request.id)

    if (error) {
      toast.error("Failed to cancel: " + error.message)
    } else {
      updateRequest(request.id, { status: "cancelled" })
      toast.success("Request cancelled")
    }
    setCancelling(false)
  }

  const handleExecutiveApprove = async () => {
    setApproving(true)
    const supabase = createClient()

    const { error } = await supabase
      .from("purchase_requests")
      .update({ status: "approved", updated_at: new Date().toISOString() })
      .eq("id", request.id)

    if (error) {
      toast.error("Failed to approve: " + error.message)
    } else {
      updateRequest(request.id, { status: "approved" })
      toast.success("Request approved (executive decision)")

      // Notify other household members (exclude the admin who approved)
      const { data: memberRows } = await supabase
        .from("household_members")
        .select("user_id")
        .eq("household_id", householdId)
        .neq("user_id", currentUserId)

      if (memberRows && memberRows.length > 0) {
        const notifications = memberRows.map((m) => ({
          household_id: householdId,
          user_id: m.user_id,
          type: "request_approved" as const,
          title: `Request approved: "${request.title}"`,
          body: `Admin approved this $${Number(request.amount).toFixed(2)} request (executive decision)`,
          reference_id: request.id,
        }))

        await supabase.from("notifications").insert(notifications)
      }
    }
    setApproving(false)
  }

  return (
    <div className="glass-card space-y-4 p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-semibold text-white">
              {request.title}
            </h3>
            {request.is_emergency && (
              <Badge className="gap-1 bg-red-500/20 text-red-400 hover:bg-red-500/30">
                <Zap className="h-3 w-3" />
                Emergency
              </Badge>
            )}
          </div>
          <p className="mt-0.5 text-xl font-bold tabular-nums text-emerald-400">
            {formatCurrency(Number(request.amount))}
          </p>
        </div>
        <Badge className={cn("shrink-0 capitalize", STATUS_STYLES[request.status])}>
          {request.status}
        </Badge>
      </div>

      {/* Requester */}
      <div className="flex items-center gap-2">
        <Avatar className="h-6 w-6">
          <AvatarImage src={requester?.avatar_url || undefined} />
          <AvatarFallback className="bg-emerald-500/20 text-emerald-500 text-[10px]">
            {requester?.display_name?.charAt(0)?.toUpperCase() || "?"}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm text-[#94A3B8]">
          {requester?.display_name || "Unknown"}
        </span>
      </div>

      {/* Description */}
      {request.description && (
        <p className="text-sm text-[#94A3B8]">{request.description}</p>
      )}

      {/* Dates */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-[#64748B]">
        <span className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          Purchase: {new Date(request.purchase_date).toLocaleDateString()}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {request.status === "pending"
            ? getCountdown(request.vote_deadline)
            : `Deadline: ${new Date(request.vote_deadline).toLocaleString()}`}
        </span>
      </div>

      {/* Vote Progress */}
      <VoteProgress
        votes={votes}
        members={members}
        requesterId={request.requester_id}
      />

      {/* Actions */}
      {request.status === "pending" && (
        <div className="flex items-center gap-2 pt-1">
          {canVote && !deadlinePassed && (
            <>
              <Button
                size="sm"
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                disabled={voting}
                onClick={() => handleVote("yes")}
              >
                <ThumbsUp className="h-3.5 w-3.5" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="gap-1.5"
                disabled={voting}
                onClick={() => handleVote("no")}
              >
                <ThumbsDown className="h-3.5 w-3.5" />
                Deny
              </Button>
            </>
          )}
          {isRequester && isAdmin && (
            <Button
              size="sm"
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
              disabled={approving}
              onClick={handleExecutiveApprove}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              {approving ? "Approving..." : "Approve"}
            </Button>
          )}
          {isRequester && (
            <Button
              size="sm"
              variant="ghost"
              className="ml-auto text-[#94A3B8] hover:text-white"
              disabled={cancelling}
              onClick={handleCancel}
            >
              Cancel Request
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
