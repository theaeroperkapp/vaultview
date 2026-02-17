"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useBudgetStore } from "@/stores/budgetStore"
import { useTemplateStore } from "@/stores/templateStore"
import { formatCurrency } from "@/lib/utils/currency"
import { toast } from "sonner"
import { FileText, AlertTriangle } from "lucide-react"
import type { BudgetTemplate } from "@/lib/supabase/types"

interface ApplyTemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  householdId: string
  month: number
  year: number
}

export function ApplyTemplateDialog({ open, onOpenChange, householdId, month, year }: ApplyTemplateDialogProps) {
  const [selected, setSelected] = useState<BudgetTemplate | null>(null)
  const [applying, setApplying] = useState(false)
  const templates = useTemplateStore((s) => s.templates)
  const { period, items } = useBudgetStore()

  const handleApply = async () => {
    if (!selected) return
    setApplying(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Get or create period
    let periodId = period?.id
    if (!periodId) {
      const { data: newPeriod, error: periodError } = await supabase
        .from("budget_periods")
        .insert({
          household_id: householdId,
          month,
          year,
          total_income: selected.total_income,
        })
        .select()
        .single()

      if (periodError || !newPeriod) {
        toast.error("Failed to create budget period")
        setApplying(false)
        return
      }
      periodId = newPeriod.id
      useBudgetStore.getState().setPeriod(newPeriod)
    }

    // Fetch template items
    const { data: templateItems, error: fetchError } = await supabase
      .from("budget_template_items")
      .select("*")
      .eq("template_id", selected.id)

    if (fetchError || !templateItems) {
      toast.error("Failed to load template items")
      setApplying(false)
      return
    }

    // Insert budget items from template
    const newItems = templateItems.map((ti) => ({
      period_id: periodId!,
      category_id: ti.category_id,
      name: ti.name,
      planned_amount: ti.planned_amount,
      actual_amount: 0,
      sort_order: ti.sort_order,
      created_by: user?.id,
    }))

    if (newItems.length > 0) {
      const { data: inserted, error: insertError } = await supabase
        .from("budget_items")
        .insert(newItems)
        .select()

      if (insertError) {
        toast.error("Failed to apply template: " + insertError.message)
        setApplying(false)
        return
      }

      if (inserted) {
        const store = useBudgetStore.getState()
        inserted.forEach((item) => store.addItem(item))
      }
    }

    toast.success(`Template "${selected.name}" applied`)
    setApplying(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-[#2A2D3A] bg-[#1A1D27] text-white max-w-lg">
        <DialogHeader>
          <DialogTitle>Apply Template</DialogTitle>
        </DialogHeader>

        {items.length > 0 && (
          <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2">
            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
            <span className="text-sm text-amber-300">
              This period already has items. Template items will be added alongside existing ones.
            </span>
          </div>
        )}

        <div className="max-h-[300px] space-y-2 overflow-y-auto py-2">
          {templates.length === 0 ? (
            <div className="py-8 text-center text-sm text-[#94A3B8]">
              No templates saved yet
            </div>
          ) : (
            templates.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelected(t)}
                className={`flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left transition-colors ${
                  selected?.id === t.id
                    ? "border-emerald-500 bg-emerald-500/10"
                    : "border-[#2A2D3A] hover:bg-[#0F1117]"
                }`}
              >
                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-[#94A3B8]" />
                <div>
                  <p className="text-sm font-medium text-white">{t.name}</p>
                  {t.description && (
                    <p className="text-xs text-[#94A3B8]">{t.description}</p>
                  )}
                  <p className="mt-1 text-xs text-[#64748B]">
                    Income: {formatCurrency(Number(t.total_income))}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            className="text-[#94A3B8]"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="bg-emerald-500 text-white hover:bg-emerald-600"
            onClick={handleApply}
            disabled={!selected || applying}
          >
            {applying ? "Applying..." : "Apply Template"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
