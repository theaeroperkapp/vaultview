"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useRequestStore } from "@/stores/requestStore"
import { useBudgetStore } from "@/stores/budgetStore"
import { toast } from "sonner"
import type { PurchaseRequest } from "@/lib/supabase/types"

interface NewRequestFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  householdId: string
  userId: string
}

export function NewRequestForm({
  open,
  onOpenChange,
  householdId,
  userId,
}: NewRequestFormProps) {
  const [title, setTitle] = useState("")
  const [amount, setAmount] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [description, setDescription] = useState("")
  const [purchaseDate, setPurchaseDate] = useState("")
  const [isEmergency, setIsEmergency] = useState(false)
  const [emergencyUsed, setEmergencyUsed] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const { addRequest } = useRequestStore()
  const categories = useBudgetStore((s) => s.categories)

  // Fetch emergency count for current year
  useEffect(() => {
    if (!open) return
    const fetchEmergencyCount = async () => {
      const supabase = createClient()
      const year = new Date().getFullYear()
      const { count } = await supabase
        .from("purchase_requests")
        .select("*", { count: "exact", head: true })
        .eq("requester_id", userId)
        .eq("is_emergency", true)
        .gte("created_at", `${year}-01-01`)
        .lt("created_at", `${year + 1}-01-01`)

      setEmergencyUsed(count || 0)
    }
    fetchEmergencyCount()
  }, [open, userId])

  const resetForm = () => {
    setTitle("")
    setAmount("")
    setCategoryId("")
    setDescription("")
    setPurchaseDate("")
    setIsEmergency(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const numAmount = parseFloat(amount)
    if (!title.trim()) {
      toast.error("Title is required")
      return
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Amount must be greater than 0")
      return
    }
    if (!purchaseDate) {
      toast.error("Purchase date is required")
      return
    }

    const purchaseDateObj = new Date(purchaseDate + "T00:00:00")
    const now = new Date()

    if (purchaseDateObj <= now) {
      toast.error("Purchase date must be in the future")
      return
    }

    const hoursUntilPurchase =
      (purchaseDateObj.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (!isEmergency && hoursUntilPurchase < 48) {
      toast.error(
        "Regular requests must be submitted 48+ hours before purchase date. Use emergency if urgent."
      )
      return
    }

    if (isEmergency && emergencyUsed >= 6) {
      toast.error("You've used all 6 emergency requests this year")
      return
    }

    // Calculate vote deadline
    let voteDeadline: Date
    if (isEmergency) {
      // Emergency: created_at + 2h or purchase_date - 1h, whichever is later
      const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000)
      const oneHourBeforePurchase = new Date(
        purchaseDateObj.getTime() - 1 * 60 * 60 * 1000
      )
      voteDeadline =
        twoHoursFromNow > oneHourBeforePurchase
          ? twoHoursFromNow
          : oneHourBeforePurchase
    } else {
      // Regular: purchase_date - 24h
      voteDeadline = new Date(
        purchaseDateObj.getTime() - 24 * 60 * 60 * 1000
      )
    }

    setSubmitting(true)
    const supabase = createClient()

    const { data, error } = await supabase
      .from("purchase_requests")
      .insert({
        household_id: householdId,
        requester_id: userId,
        title: title.trim(),
        description: description.trim() || null,
        amount: numAmount,
        category_id: categoryId || null,
        is_emergency: isEmergency,
        purchase_date: purchaseDate,
        vote_deadline: voteDeadline.toISOString(),
      })
      .select()
      .single()

    if (error) {
      toast.error("Failed to create request: " + error.message)
      setSubmitting(false)
      return
    }

    if (data) {
      addRequest(data as PurchaseRequest)

      // Notify all other household members
      const { data: members } = await supabase
        .from("household_members")
        .select("user_id")
        .eq("household_id", householdId)
        .neq("user_id", userId)

      if (members) {
        const notifications = members.map((m) => ({
          household_id: householdId,
          user_id: m.user_id,
          type: "request_new" as const,
          title: `New purchase request: "${title.trim()}"`,
          body: `$${numAmount.toFixed(2)}${isEmergency ? " (Emergency)" : ""}`,
          reference_id: data.id,
        }))

        if (notifications.length > 0) {
          await supabase.from("notifications").insert(notifications)
        }
      }

      toast.success("Request submitted!")
      resetForm()
      onOpenChange(false)
    }

    setSubmitting(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-[#2A2D3A] bg-[#0F1117] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white">New Purchase Request</DialogTitle>
          <DialogDescription className="text-[#94A3B8]">
            Submit a purchase for household approval
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <Label className="text-[#94A3B8]">Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What do you want to purchase?"
              className="border-[#2A2D3A] bg-[#1A1D27] text-white placeholder:text-[#64748B]"
            />
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <Label className="text-[#94A3B8]">Amount ($)</Label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="border-[#2A2D3A] bg-[#1A1D27] text-white placeholder:text-[#64748B]"
            />
          </div>

          {/* Category (optional) */}
          {categories.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-[#94A3B8]">Category (optional)</Label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-[#2A2D3A] bg-[#1A1D27] px-3 py-2 text-sm text-white"
              >
                <option value="">No category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-[#94A3B8]">Reason / Description</Label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Why is this purchase needed?"
              rows={3}
              className="flex w-full rounded-md border border-[#2A2D3A] bg-[#1A1D27] px-3 py-2 text-sm text-white placeholder:text-[#64748B] focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Purchase Date */}
          <div className="space-y-1.5">
            <Label className="text-[#94A3B8]">Purchase Date</Label>
            <Input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="border-[#2A2D3A] bg-[#1A1D27] text-white"
            />
          </div>

          {/* Emergency Toggle */}
          <div className="flex items-center justify-between rounded-lg border border-[#2A2D3A] bg-[#1A1D27] p-3">
            <div className="flex items-center gap-2">
              <Zap className={cn("h-4 w-4", isEmergency ? "text-red-400" : "text-[#64748B]")} />
              <div>
                <p className="text-sm font-medium text-white">Emergency Request</p>
                <p className="text-xs text-[#64748B]">
                  {6 - emergencyUsed} of 6 emergency requests left this year
                </p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isEmergency}
              onClick={() => setIsEmergency(!isEmergency)}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors",
                isEmergency ? "bg-red-500" : "bg-[#2A2D3A]"
              )}
            >
              <span
                className={cn(
                  "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
                  isEmergency ? "translate-x-[22px]" : "translate-x-0.5"
                )}
                style={{ marginTop: "2px" }}
              />
            </button>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              className="text-[#94A3B8] hover:text-white"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {submitting ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
