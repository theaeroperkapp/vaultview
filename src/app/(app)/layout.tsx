"use client"

import { Sidebar } from "@/components/layout/Sidebar"
import { TopBar } from "@/components/layout/TopBar"
import { ChatDrawer } from "@/components/layout/ChatDrawer"
import { useSidebarStore } from "@/stores/sidebarStore"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const collapsed = useSidebarStore((s) => s.collapsed)

  return (
    <div className="min-h-screen bg-[#0F1117]">
      <Sidebar />
      <div
        className="transition-all duration-300 ease-in-out"
        style={{ marginLeft: collapsed ? '72px' : '256px' }}
      >
        <TopBar />
        <main className="p-6">
          {children}
        </main>
      </div>
      <ChatDrawer />
    </div>
  )
}
