"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Table2,
  BarChart3,
  MessageCircle,
  LogOut,
  Vault,
  TrendingUp,
  CalendarRange,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useChatStore } from "@/stores/chatStore"
import { useRequestCounts } from "@/stores/requestStore"
import { useSidebarStore } from "@/stores/sidebarStore"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/budget", label: "Budget", icon: Table2 },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/net-worth", label: "Net Worth", icon: TrendingUp },
  { href: "/year-overview", label: "Year Overview", icon: CalendarRange },
  { href: "/requests", label: "Requests", icon: ShoppingCart },
  { href: "/chat", label: "Chat", icon: MessageCircle },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const unreadCount = useChatStore((s) => s.unreadCount)
  const { pendingCount } = useRequestCounts()
  const { collapsed, toggle, mobileOpen, setMobileOpen } = useSidebarStore()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  const handleNavClick = () => {
    setMobileOpen(false)
  }

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-[#2A2D3A] bg-[#0D0F15] transition-all duration-300 ease-in-out",
          // Desktop
          "hidden md:flex",
          collapsed ? "md:w-[72px]" : "md:w-64",
          // Mobile — slide-in drawer
          mobileOpen && "!flex w-[280px]"
        )}
      >
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 px-4">
        <Vault className="h-7 w-7 shrink-0 text-emerald-500" />
        {!collapsed && (
          <span className="text-xl font-bold tracking-tight text-white">
            Vault<span className="text-emerald-500">View</span>
          </span>
        )}
      </div>

      <Separator className="bg-[#2A2D3A]" />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)

          const linkContent = (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNavClick}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                collapsed && "justify-center px-0",
                isActive
                  ? "border-l-2 border-emerald-500 bg-gradient-to-r from-emerald-500/15 to-transparent text-emerald-400"
                  : "border-l-2 border-transparent text-[#94A3B8] hover:bg-[#1A1D27] hover:text-white"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && (
                <>
                  <span>{item.label}</span>
                  {item.label === "Chat" && unreadCount > 0 && (
                    <Badge className="ml-auto bg-emerald-500 text-xs text-white hover:bg-emerald-600">
                      {unreadCount}
                    </Badge>
                  )}
                  {item.label === "Requests" && pendingCount > 0 && (
                    <Badge className="ml-auto bg-amber-500 text-xs text-white hover:bg-amber-600">
                      {pendingCount}
                    </Badge>
                  )}
                </>
              )}
              {collapsed && item.label === "Chat" && unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-emerald-500" />
              )}
              {collapsed && item.label === "Requests" && pendingCount > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-amber-500" />
              )}
            </Link>
          )

          if (collapsed) {
            return (
              <Tooltip key={item.href} delayDuration={0}>
                <TooltipTrigger asChild>
                  <div className="relative">{linkContent}</div>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-[#1A1D27] text-white border-[#2A2D3A]">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            )
          }

          return <div key={item.href}>{linkContent}</div>
        })}
      </nav>

      <Separator className="bg-[#2A2D3A]" />

      {/* Bottom section */}
      <div className="space-y-1 p-2">
        {collapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-full text-[#94A3B8] hover:bg-[#1A1D27] hover:text-white"
                onClick={handleSignOut}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-[#1A1D27] text-white border-[#2A2D3A]">
              Sign Out
            </TooltipContent>
          </Tooltip>
        ) : (
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-[#94A3B8] hover:bg-[#1A1D27] hover:text-white"
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </Button>
        )}

        {/* Collapse toggle */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "w-full text-[#94A3B8] hover:bg-[#1A1D27] hover:text-white",
            !collapsed && "justify-end"
          )}
          onClick={toggle}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
    </aside>
    </>
  )
}
