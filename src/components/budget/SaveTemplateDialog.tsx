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
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { useBudgetStore } from "@/stores/budgetStore"
import { useTemplateStore } from "@/stores/templateStore"
import { toast } from "sonner"

interface SaveTemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  householdId: string
}

export function SaveTemplateDialog({ open, onOpenChange, householdId }: SaveTemplateDialogProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { period, items } = useBudgetStore.getState()

    const { data: template, error } = await supabase
      .from("budget_templates")
      .insert({
        household_id: householdId,
        name: name.trim(),
        description: description.trim() || null,
        total_income: period?.total_income || 0,
        created_by: user?.id,
      })
      .select()
      .single()

    if (error || !template) {
      toast.error("Failed to save template: " + (error?.message || "Unknown error"))
      setSaving(false)
      return
    }

    // Save template items
    const templateItems = items.map((item) => ({
      template_id: template.id,
      category_id: item.category_id,
      name: item.name,
      planned_amount: item.planned_amount,
      sort_order: item.sort_order,
    }))

    if (templateItems.length > 0) {
      const { error: itemError } = await supabase
        .from("budget_template_items")
        .insert(templateItems)

      if (itemError) {
        toast.error("Failed to save template items: " + itemError.message)
        setSaving(false)
        return
      }
    }

    useTemplateStore.getState().addTemplate(template)
    toast.success(`Template "${name}" saved`)
    setName("")
    setDescription("")
    setSaving(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-[#2A2D3A] bg-[#1A1D27] text-white">
        <DialogHeader>
          <DialogTitle>Save as Template</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm text-[#94A3B8]">Template Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Monthly Standard"
              className="border-[#2A2D3A] bg-[#0F1117] text-white placeholder:text-[#64748B]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-[#94A3B8]">Description (optional)</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description..."
              className="border-[#2A2D3A] bg-[#0F1117] text-white placeholder:text-[#64748B]"
            />
          </div>
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
            onClick={handleSave}
            disabled={!name.trim() || saving}
          >
            {saving ? "Saving..." : "Save Template"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
