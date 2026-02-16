"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useChatStore } from "@/stores/chatStore"
import { ChatPanel } from "@/components/chat/ChatPanel"

export function ChatDrawer() {
  const { isDrawerOpen, setDrawerOpen } = useChatStore()

  return (
    <Sheet open={isDrawerOpen} onOpenChange={setDrawerOpen}>
      <SheetContent className="w-[400px] border-[#2A2D3A] bg-[#0F1117] p-0 sm:w-[440px]">
        <SheetHeader className="border-b border-[#2A2D3A] px-4 py-3">
          <SheetTitle className="text-white">Household Chat</SheetTitle>
        </SheetHeader>
        <ChatPanel isDrawer />
      </SheetContent>
    </Sheet>
  )
}
