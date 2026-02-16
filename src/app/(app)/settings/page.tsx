"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase/client"
import { useHousehold } from "@/hooks/useHousehold"
import { toast } from "sonner"
import { Copy, RefreshCw } from "lucide-react"
import type { Profile } from "@/lib/supabase/types"

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [displayName, setDisplayName] = useState("")
  const [householdName, setHouseholdName] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const { household } = useHousehold()

  useEffect(() => {
    const supabase = createClient()
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
        if (data) {
          setProfile(data)
          setDisplayName(data.display_name)
        }
      }
    }
    fetchProfile()
  }, [])

  useEffect(() => {
    if (household) setHouseholdName(household.name)
  }, [household])

  const handleSaveProfile = async () => {
    if (!profile) return
    setIsSaving(true)
    const supabase = createClient()
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName, updated_at: new Date().toISOString() })
      .eq("id", profile.id)

    if (error) toast.error(error.message)
    else toast.success("Profile updated!")
    setIsSaving(false)
  }

  const handleSaveHousehold = async () => {
    if (!household) return
    const supabase = createClient()
    const { error } = await supabase
      .from("households")
      .update({ name: householdName })
      .eq("id", household.id)

    if (error) toast.error(error.message)
    else toast.success("Household updated!")
  }

  const handleCopyInvite = () => {
    if (!household) return
    const link = `${window.location.origin}/join/${household.invite_code}`
    navigator.clipboard.writeText(link)
    toast.success("Invite link copied!")
  }

  const handleRegenInvite = async () => {
    if (!household) return
    const supabase = createClient()
    const newCode = Math.random().toString(36).substring(2, 14)
    const { error } = await supabase
      .from("households")
      .update({ invite_code: newCode })
      .eq("id", household.id)

    if (error) toast.error(error.message)
    else {
      toast.success("Invite code regenerated!")
      window.location.reload()
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-slide-in">
      <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-playfair)' }}>
        Settings
      </h1>

      {/* Profile */}
      <Card className="border-[#2A2D3A] bg-[#1A1D27]">
        <CardHeader>
          <CardTitle className="text-white">Profile</CardTitle>
          <CardDescription className="text-[#94A3B8]">Manage your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-emerald-500/20 text-emerald-500 text-xl">
                {profile?.display_name?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-white">{profile?.display_name}</p>
              <p className="text-sm text-[#94A3B8]">{profile?.email}</p>
            </div>
          </div>
          <Separator className="bg-[#2A2D3A]" />
          <div className="space-y-2">
            <Label className="text-[#F1F5F9]">Display Name</Label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="border-[#2A2D3A] bg-[#0F1117] text-white"
            />
          </div>
          <Button onClick={handleSaveProfile} disabled={isSaving} className="bg-emerald-500 text-white hover:bg-emerald-600">
            {isSaving ? "Saving..." : "Save Profile"}
          </Button>
        </CardContent>
      </Card>

      {/* Household */}
      <Card className="border-[#2A2D3A] bg-[#1A1D27]">
        <CardHeader>
          <CardTitle className="text-white">Household</CardTitle>
          <CardDescription className="text-[#94A3B8]">Manage your household settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[#F1F5F9]">Household Name</Label>
            <div className="flex gap-2">
              <Input
                value={householdName}
                onChange={(e) => setHouseholdName(e.target.value)}
                className="border-[#2A2D3A] bg-[#0F1117] text-white"
              />
              <Button onClick={handleSaveHousehold} className="bg-emerald-500 text-white hover:bg-emerald-600">
                Save
              </Button>
            </div>
          </div>
          <Separator className="bg-[#2A2D3A]" />
          <div className="space-y-2">
            <Label className="text-[#F1F5F9]">Invite Link</Label>
            <div className="flex gap-2">
              <Input
                readOnly
                value={household ? `${typeof window !== 'undefined' ? window.location.origin : ''}/join/${household.invite_code}` : ''}
                className="border-[#2A2D3A] bg-[#0F1117] text-[#94A3B8]"
              />
              <Button variant="outline" size="icon" className="border-[#2A2D3A] text-[#94A3B8] hover:text-white" onClick={handleCopyInvite}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="border-[#2A2D3A] text-[#94A3B8] hover:text-white" onClick={handleRegenInvite}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-[#94A3B8]">Share this link to invite members to your household</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
