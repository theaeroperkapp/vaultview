"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Check, X, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Profile, RequestVote } from "@/lib/supabase/types"

interface VoteProgressProps {
  votes: RequestVote[]
  members: Profile[]
  requesterId: string
}

export function VoteProgress({ votes, members, requesterId }: VoteProgressProps) {
  // Eligible voters = all members except requester
  const voters = members.filter((m) => m.id !== requesterId)
  const totalVoters = voters.length

  const yesCount = votes.filter((v) => v.vote === "yes").length
  const noCount = votes.filter((v) => v.vote === "no").length
  const pendingCount = totalVoters - yesCount - noCount

  const yesPct = totalVoters > 0 ? (yesCount / totalVoters) * 100 : 0
  const noPct = totalVoters > 0 ? (noCount / totalVoters) * 100 : 0

  const voteMap = new Map(votes.map((v) => [v.voter_id, v.vote]))

  return (
    <div className="space-y-2">
      {/* Progress bar */}
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-[#1A1D27]">
        {yesPct > 0 && (
          <div
            className="bg-emerald-500 transition-all duration-300"
            style={{ width: `${yesPct}%` }}
          />
        )}
        {noPct > 0 && (
          <div
            className="bg-red-500 transition-all duration-300"
            style={{ width: `${noPct}%` }}
          />
        )}
      </div>

      {/* Vote counts */}
      <div className="flex items-center gap-3 text-xs text-[#94A3B8]">
        <span className="text-emerald-400">{yesCount} yes</span>
        <span className="text-red-400">{noCount} no</span>
        <span>{pendingCount} pending</span>
      </div>

      {/* Voter avatars */}
      <div className="flex flex-wrap gap-1.5">
        {voters.map((member) => {
          const memberVote = voteMap.get(member.id)
          return (
            <div key={member.id} className="relative">
              <Avatar className="h-7 w-7">
                <AvatarImage src={member.avatar_url || undefined} />
                <AvatarFallback className="bg-[#1A1D27] text-[10px] text-[#94A3B8]">
                  {member.display_name?.charAt(0)?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  "absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full",
                  memberVote === "yes" && "bg-emerald-500",
                  memberVote === "no" && "bg-red-500",
                  !memberVote && "bg-[#2A2D3A]"
                )}
              >
                {memberVote === "yes" && <Check className="h-2 w-2 text-white" />}
                {memberVote === "no" && <X className="h-2 w-2 text-white" />}
                {!memberVote && <Clock className="h-2 w-2 text-[#94A3B8]" />}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
