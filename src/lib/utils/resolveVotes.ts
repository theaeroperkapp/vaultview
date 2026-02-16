import { createClient } from "@/lib/supabase/client"
import { useRequestStore } from "@/stores/requestStore"
import type { PurchaseRequest } from "@/lib/supabase/types"

export async function checkAndResolveRequest(
  requestId: string,
  householdId: string
) {
  const supabase = createClient()

  // Fetch the request
  const { data: request } = await supabase
    .from("purchase_requests")
    .select("*")
    .eq("id", requestId)
    .single()

  if (!request || request.status !== "pending") return

  // Fetch all votes for this request
  const { data: votes } = await supabase
    .from("request_votes")
    .select("*")
    .eq("request_id", requestId)

  // Fetch household member count
  const { count: memberCount } = await supabase
    .from("household_members")
    .select("*", { count: "exact", head: true })
    .eq("household_id", householdId)

  if (!memberCount) return

  const totalVoters = memberCount - 1 // Exclude requester
  const currentVotes = votes || []
  const yesCount = currentVotes.filter((v) => v.vote === "yes").length
  const noCount = currentVotes.filter((v) => v.vote === "no").length
  const allVoted = currentVotes.length >= totalVoters
  const deadlinePassed =
    new Date(request.vote_deadline).getTime() <= Date.now()

  let newStatus: "approved" | "denied" | null = null

  if (allVoted) {
    // All eligible members voted: 100% yes = approved
    newStatus = noCount === 0 && yesCount === totalVoters ? "approved" : "denied"
  } else if (deadlinePassed) {
    // Deadline passed: need 100% yes of ALL members (not just who voted)
    newStatus = yesCount === totalVoters ? "approved" : "denied"
  } else if (noCount > 0) {
    // Any no vote means it can never reach 100% yes → deny immediately
    newStatus = "denied"
  }

  if (!newStatus) return

  // Update request status
  const { error } = await supabase
    .from("purchase_requests")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", requestId)

  if (error) return

  // Update local store
  useRequestStore.getState().updateRequest(requestId, { status: newStatus })

  // Notify all household members
  const { data: members } = await supabase
    .from("household_members")
    .select("user_id")
    .eq("household_id", householdId)

  if (members) {
    const notifType =
      newStatus === "approved" ? "request_approved" : "request_denied"
    const notifications = members.map((m) => ({
      household_id: householdId,
      user_id: m.user_id,
      type: notifType as "request_approved" | "request_denied",
      title: `Request ${newStatus}: "${(request as PurchaseRequest).title}"`,
      body: `The purchase request for $${Number(request.amount).toFixed(2)} was ${newStatus}`,
      reference_id: requestId,
    }))

    await supabase.from("notifications").insert(notifications)
  }
}
