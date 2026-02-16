"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { useHousehold } from "@/hooks/useHousehold"
import { toast } from "sonner"
import { ArrowLeft, UserMinus } from "lucide-react"
import Link from "next/link"
import type { Profile, HouseholdMember } from "@/lib/supabase/types"

interface MemberWithProfile extends HouseholdMember {
  profile: Profile
}

export default function MembersPage() {
  const [members, setMembers] = useState<MemberWithProfile[]>([])
  const [currentUserId, setCurrentUserId] = useState("")
  const { household } = useHousehold()

  useEffect(() => {
    if (!household) return
    const supabase = createClient()

    const fetchMembers = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setCurrentUserId(user.id)

      const { data: memberData } = await supabase
        .from("household_members")
        .select("*")
        .eq("household_id", household.id)

      if (!memberData) return

      const userIds = memberData.map((m) => m.user_id)
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .in("id", userIds)

      const profileMap: Record<string, Profile> = {}
      for (const p of profiles || []) profileMap[p.id] = p

      setMembers(
        memberData.map((m) => ({ ...m, profile: profileMap[m.user_id] }))
      )
    }

    fetchMembers()
  }, [household])

  const handleRoleChange = async (userId: string, role: string) => {
    if (!household) return
    const supabase = createClient()
    const { error } = await supabase
      .from("household_members")
      .update({ role })
      .eq("household_id", household.id)
      .eq("user_id", userId)

    if (error) toast.error(error.message)
    else {
      setMembers(members.map((m) => m.user_id === userId ? { ...m, role: role as any } : m))
      toast.success("Role updated")
    }
  }

  const handleRemove = async (userId: string) => {
    if (!household) return
    const supabase = createClient()
    const { error } = await supabase
      .from("household_members")
      .delete()
      .eq("household_id", household.id)
      .eq("user_id", userId)

    if (error) toast.error(error.message)
    else {
      setMembers(members.filter((m) => m.user_id !== userId))
      toast.success("Member removed")
    }
  }

  const isAdmin = members.find((m) => m.user_id === currentUserId)?.role === "admin"

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-slide-in">
      <div className="flex items-center gap-4">
        <Link href="/settings">
          <Button variant="ghost" size="icon" className="text-[#94A3B8] hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-playfair)' }}>Members</h1>
          <p className="text-sm text-[#94A3B8]">Manage household members</p>
        </div>
      </div>

      <Card className="border-[#2A2D3A] bg-[#1A1D27]">
        <CardHeader>
          <CardTitle className="text-white">Household Members</CardTitle>
          <CardDescription className="text-[#94A3B8]">
            {members.length} member{members.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {members.map((member) => (
            <div key={member.user_id} className="flex items-center gap-3 rounded-lg border border-[#2A2D3A] bg-[#0F1117] p-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={member.profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-emerald-500/20 text-emerald-500">
                  {member.profile?.display_name?.charAt(0)?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">
                  {member.profile?.display_name}
                  {member.user_id === currentUserId && (
                    <span className="ml-2 text-xs text-[#94A3B8]">(you)</span>
                  )}
                </p>
                <p className="text-xs text-[#94A3B8]">{member.profile?.email}</p>
              </div>
              {isAdmin && member.user_id !== currentUserId ? (
                <div className="flex items-center gap-2">
                  <Select value={member.role} onValueChange={(v) => handleRoleChange(member.user_id, v)}>
                    <SelectTrigger className="w-28 h-8 border-[#2A2D3A] bg-[#1A1D27] text-white text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-[#2A2D3A] bg-[#1A1D27]">
                      <SelectItem value="admin" className="text-white">Admin</SelectItem>
                      <SelectItem value="member" className="text-white">All Access</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-[#94A3B8] hover:text-red-400"
                    onClick={() => handleRemove(member.user_id)}
                  >
                    <UserMinus className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-xs">
                  {member.role === "admin" ? "Admin" : "All Access"}
                </Badge>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
