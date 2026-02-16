"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Vault, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import type { Household } from "@/lib/supabase/types"

export default function JoinPage() {
  const params = useParams()
  const router = useRouter()
  const [household, setHousehold] = useState<Household | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isJoining, setIsJoining] = useState(false)

  useEffect(() => {
    const fetchHousehold = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from("households")
        .select("*")
        .eq("invite_code", params.code as string)
        .single()

      setHousehold(data)
      setIsLoading(false)
    }
    fetchHousehold()
  }, [params.code])

  const handleJoin = async () => {
    if (!household) return
    setIsJoining(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push(`/login?redirect=/join/${params.code}`)
      return
    }

    const { error } = await supabase.from("household_members").insert({
      household_id: household.id,
      user_id: user.id,
      role: "member",
    })

    if (error) {
      if (error.code === "23505") {
        toast.info("You're already a member of this household!")
      } else {
        toast.error(error.message)
      }
    } else {
      toast.success(`Joined ${household.name}!`)
    }

    setIsJoining(false)
    router.push("/dashboard")
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0F1117]">
        <div className="text-[#94A3B8]">Loading...</div>
      </div>
    )
  }

  if (!household) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0F1117]">
        <Card className="w-full max-w-md border-[#2A2D3A] bg-[#1A1D27]">
          <CardHeader className="text-center">
            <CardTitle className="text-white">Invalid Invite</CardTitle>
            <CardDescription className="text-[#94A3B8]">
              This invite link is invalid or has expired.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0F1117] px-4">
      <Card className="w-full max-w-md border-[#2A2D3A] bg-[#1A1D27]">
        <CardHeader className="text-center">
          <div className="mb-2 flex items-center justify-center gap-2">
            <Vault className="h-7 w-7 text-emerald-500" />
          </div>
          <CardTitle className="text-2xl text-white">Join Household</CardTitle>
          <CardDescription className="text-[#94A3B8]">
            You&apos;ve been invited to join a household budget
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4 rounded-lg border border-[#2A2D3A] bg-[#0F1117] p-4">
            <Users className="h-10 w-10 text-emerald-500" />
            <div>
              <p className="font-semibold text-white">{household.name}</p>
              <p className="text-sm text-[#94A3B8]">Household Budget</p>
            </div>
          </div>
          <Button
            className="w-full bg-emerald-500 text-white hover:bg-emerald-600"
            onClick={handleJoin}
            disabled={isJoining}
          >
            {isJoining ? "Joining..." : "Join Household"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
