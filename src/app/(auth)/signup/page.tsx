"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Vault } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export default function SignupPage() {
  const [displayName, setDisplayName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [householdName, setHouseholdName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const supabase = createClient()

    // 1. Sign up user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
      },
    })

    if (authError) {
      toast.error(authError.message)
      setIsLoading(false)
      return
    }

    if (!authData.user) {
      toast.error("Something went wrong")
      setIsLoading(false)
      return
    }

    // 2. Create household
    const { data: household, error: householdError } = await supabase
      .from("households")
      .insert({ name: householdName || "My Household", owner_id: authData.user.id })
      .select()
      .single()

    if (householdError) {
      toast.error("Account created but failed to create household: " + householdError.message)
      setIsLoading(false)
      router.push("/dashboard")
      return
    }

    // 3. Add user as owner member
    await supabase.from("household_members").insert({
      household_id: household.id,
      user_id: authData.user.id,
      role: "owner",
    })

    // 4. Seed with default categories
    const defaultCategories = [
      { name: "Fixed", sort_order: 0, color: "#6366F1", icon: "lock" },
      { name: "Subscriptions", sort_order: 1, color: "#8B5CF6", icon: "tv" },
      { name: "Software", sort_order: 2, color: "#3B82F6", icon: "code" },
      { name: "Health", sort_order: 3, color: "#10B981", icon: "heart-pulse" },
      { name: "Lifestyle", sort_order: 4, color: "#F59E0B", icon: "sparkles" },
      { name: "Wedding Expenses", sort_order: 5, color: "#EC4899", icon: "gem" },
      { name: "Savings Vault", sort_order: 6, color: "#14B8A6", icon: "vault" },
      { name: "Allowance", sort_order: 7, color: "#F97316", icon: "wallet" },
    ]

    await supabase.from("budget_categories").insert(
      defaultCategories.map((c) => ({ ...c, household_id: household.id }))
    )

    toast.success("Account created! Welcome to VaultView.")
    router.push("/dashboard")
    router.refresh()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0F1117] px-4">
      <Card className="w-full max-w-md border-[#2A2D3A] bg-[#1A1D27]">
        <CardHeader className="text-center">
          <div className="mb-2 flex items-center justify-center gap-2">
            <Vault className="h-7 w-7 text-emerald-500" />
            <span className="text-xl font-bold text-white">
              Vault<span className="text-emerald-500">View</span>
            </span>
          </div>
          <CardTitle className="text-2xl text-white">Create your account</CardTitle>
          <CardDescription className="text-[#94A3B8]">
            Set up your household budget in minutes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[#F1F5F9]">Display Name</Label>
              <Input
                id="name"
                placeholder="Your name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="border-[#2A2D3A] bg-[#0F1117] text-white placeholder:text-[#94A3B8]"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#F1F5F9]">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-[#2A2D3A] bg-[#0F1117] text-white placeholder:text-[#94A3B8]"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#F1F5F9]">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-[#2A2D3A] bg-[#0F1117] text-white placeholder:text-[#94A3B8]"
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="household" className="text-[#F1F5F9]">Household Name</Label>
              <Input
                id="household"
                placeholder="e.g. The Smiths"
                value={householdName}
                onChange={(e) => setHouseholdName(e.target.value)}
                className="border-[#2A2D3A] bg-[#0F1117] text-white placeholder:text-[#94A3B8]"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-emerald-500 text-white hover:bg-emerald-600"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-[#94A3B8]">
            Already have an account?{" "}
            <Link href="/login" className="text-emerald-500 hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
