import { Sidebar } from "@/components/layout/Sidebar"
import { TopBar } from "@/components/layout/TopBar"
import { ChatDrawer } from "@/components/layout/ChatDrawer"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#0F1117]">
      <Sidebar />
      <div className="ml-64">
        <TopBar />
        <main className="p-6">
          {children}
        </main>
      </div>
      <ChatDrawer />
    </div>
  )
}
