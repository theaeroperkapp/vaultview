"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase/client"
import { useHousehold } from "@/hooks/useHousehold"
import { toast } from "sonner"
import { Copy, RefreshCw, Camera, Loader2, Bell } from "lucide-react"
import { cn } from "@/lib/utils"
import { useNotificationStore } from "@/stores/notificationStore"
import type { Profile } from "@/lib/supabase/types"

const NOTIF_TYPE_LABELS: Record<string, string> = {
  request_new: "New purchase requests",
  request_vote: "Request votes",
  request_approved: "Requests approved",
  request_denied: "Requests denied",
  budget_add: "Budget items added",
  budget_edit: "Budget items edited",
  budget_remove: "Budget items removed",
  budget_overspend: "Budget overspend alerts",
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
        checked ? "bg-emerald-500" : "bg-[#2A2D3A]"
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 rounded-full bg-white transition-transform",
          checked ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  )
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [displayName, setDisplayName] = useState("")
  const [householdName, setHouseholdName] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { household } = useHousehold()
  const { preferences, setPreference, loadPreferences } = useNotificationStore()

  useEffect(() => {
    loadPreferences()
  }, [loadPreferences])

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
      setIsLoading(false)
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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile) return

    // Validate file
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB")
      return
    }

    setIsUploading(true)
    const supabase = createClient()

    const ext = file.name.split(".").pop()
    const filePath = `${profile.id}/avatar.${ext}`

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true })

    if (uploadError) {
      toast.error("Upload failed: " + uploadError.message)
      setIsUploading(false)
      return
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath)

    // Add cache-bust to force refresh
    const avatarUrl = `${publicUrl}?t=${Date.now()}`

    // Update profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
      .eq("id", profile.id)

    if (updateError) {
      toast.error("Failed to update profile: " + updateError.message)
    } else {
      setProfile({ ...profile, avatar_url: avatarUrl })
      toast.success("Profile picture updated!")
    }
    setIsUploading(false)

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = ""
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

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="glass-card p-6 space-y-4">
          <div className="h-5 w-20 animate-shimmer rounded" />
          <div className="h-3 w-40 animate-shimmer rounded" />
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full animate-shimmer shrink-0" />
            <div className="space-y-2">
              <div className="h-4 w-32 animate-shimmer rounded" />
              <div className="h-3 w-48 animate-shimmer rounded" />
            </div>
          </div>
          <div className="h-px bg-[#2A2D3A]" />
          <div className="h-4 w-28 animate-shimmer rounded" />
          <div className="h-10 w-full animate-shimmer rounded-md" />
          <div className="h-10 w-28 animate-shimmer rounded-md" />
        </div>
        <div className="glass-card p-6 space-y-4">
          <div className="h-5 w-24 animate-shimmer rounded" />
          <div className="h-3 w-44 animate-shimmer rounded" />
          <div className="h-10 w-full animate-shimmer rounded-md" />
          <div className="h-px bg-[#2A2D3A]" />
          <div className="h-10 w-full animate-shimmer rounded-md" />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-slide-in">
      {/* Profile */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white">Profile</CardTitle>
          <CardDescription className="text-[#94A3B8]">Manage your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-emerald-500/20 text-emerald-500 text-xl">
                  {profile?.display_name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 transition-opacity group-hover:opacity-100"
              >
                {isUploading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                ) : (
                  <Camera className="h-5 w-5 text-white" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>
            <div>
              <p className="font-semibold text-white">{profile?.display_name}</p>
              <p className="text-sm text-[#94A3B8]">{profile?.email}</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Change photo
              </button>
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
      <Card className="glass-card">
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
              <Button variant="outline" size="icon" className="border-[#2A2D3A] text-[#94A3B8] hover:text-white hover:border-emerald-500/20" onClick={handleCopyInvite}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="border-[#2A2D3A] text-[#94A3B8] hover:text-white hover:border-emerald-500/20" onClick={handleRegenInvite}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-[#94A3B8]">Share this link to invite members to your household</p>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Bell className="h-5 w-5 text-emerald-400" />
            Notifications
          </CardTitle>
          <CardDescription className="text-[#94A3B8]">Choose which notifications you receive</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {Object.entries(NOTIF_TYPE_LABELS).map(([type, label]) => (
              <div
                key={type}
                className="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-[#1A1D27]"
              >
                <span className="text-sm text-[#F1F5F9]">{label}</span>
                <Toggle
                  checked={preferences[type] !== false}
                  onChange={(v) => setPreference(type, v)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
