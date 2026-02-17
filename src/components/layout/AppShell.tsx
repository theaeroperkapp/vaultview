"use client"

import { Sidebar } from "@/components/layout/Sidebar"
import { TopBar } from "@/components/layout/TopBar"
import { ChatDrawer } from "@/components/layout/ChatDrawer"
import { useSidebarStore } from "@/stores/sidebarStore"
import { cn } from "@/lib/utils"

export function AppShell({ children }: { children: React.ReactNode }) {
  const collapsed = useSidebarStore((s) => s.collapsed)

  return (
    <div className="min-h-screen bg-[#0F1117]">
      <Sidebar />
      <div
        className={cn(
          "transition-all duration-300 ease-in-out",
          "ml-0",
          collapsed ? "md:ml-[72px]" : "md:ml-64"
        )}
      >
        <TopBar />
        <main className="p-3 md:p-6 pb-20 md:pb-6">
          {children}
        </main>
      </div>
      <ChatDrawer />
    </div>
  )
}
