"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useChatStore } from "@/stores/chatStore"
import { ChatPanel } from "@/components/chat/ChatPanel"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ChatDrawer() {
  const { isDrawerOpen, setDrawerOpen } = useChatStore()

  return (
    <Sheet open={isDrawerOpen} onOpenChange={setDrawerOpen}>
      <SheetContent className="w-full sm:w-[400px] md:w-[440px] border-[#2A2D3A] bg-[#0F1117] p-0 sm:max-w-[440px] [&>button:first-child]:hidden">
        <SheetHeader className="border-b border-[#2A2D3A] px-4 py-3">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-white">Household Chat</SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-8 w-8 text-[#94A3B8] hover:text-white"
              onClick={() => setDrawerOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </SheetHeader>
        <ChatPanel isDrawer />
      </SheetContent>
    </Sheet>
  )
}
