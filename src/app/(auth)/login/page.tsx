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

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      toast.error(error.message)
      setIsLoading(false)
      return
    }

    sessionStorage.setItem("just-logged-in", "1")
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
          <CardTitle className="text-2xl text-white">Welcome back</CardTitle>
          <CardDescription className="text-[#94A3B8]">
            Sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
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
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-emerald-500 text-white hover:bg-emerald-600"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-[#94A3B8]">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-emerald-500 hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
