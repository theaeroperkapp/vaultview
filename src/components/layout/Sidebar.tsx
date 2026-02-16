"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Table2,
  BarChart3,
  MessageCircle,
  Settings,
  LogOut,
  Vault,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useChatStore } from "@/stores/chatStore"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/budget", label: "Budget", icon: Table2 },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/chat", label: "Chat", icon: MessageCircle },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const unreadCount = useChatStore((s) => s.unreadCount)

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-[#2A2D3A] bg-[#0D0F15]">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 px-6">
        <Vault className="h-7 w-7 text-emerald-500" />
        <span className="text-xl font-bold tracking-tight text-white">
          Vault<span className="text-emerald-500">View</span>
        </span>
      </div>

      <Separator className="bg-[#2A2D3A]" />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "text-[#94A3B8] hover:bg-[#1A1D27] hover:text-white"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
              {item.label === "Chat" && unreadCount > 0 && (
                <Badge className="ml-auto bg-emerald-500 text-xs text-white hover:bg-emerald-600">
                  {unreadCount}
                </Badge>
              )}
            </Link>
          )
        })}
      </nav>

      <Separator className="bg-[#2A2D3A]" />

      {/* Sign Out */}
      <div className="p-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-[#94A3B8] hover:bg-[#1A1D27] hover:text-white"
          onClick={handleSignOut}
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </aside>
  )
}
