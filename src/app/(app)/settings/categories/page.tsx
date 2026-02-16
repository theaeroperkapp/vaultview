"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useHousehold } from "@/hooks/useHousehold"
import { toast } from "sonner"
import { Plus, Trash2, GripVertical } from "lucide-react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { BudgetCategory } from "@/lib/supabase/types"

export default function CategoriesPage() {
  const [categories, setCategories] = useState<BudgetCategory[]>([])
  const [newName, setNewName] = useState("")
  const [newColor, setNewColor] = useState("#6366F1")
  const { household } = useHousehold()

  useEffect(() => {
    if (!household) return
    const supabase = createClient()
    const fetch = async () => {
      const { data } = await supabase
        .from("budget_categories")
        .select("*")
        .eq("household_id", household.id)
        .order("sort_order")
      setCategories(data || [])
    }
    fetch()
  }, [household])

  const handleAdd = async () => {
    if (!household || !newName.trim()) return
    const supabase = createClient()
    const { data, error } = await supabase
      .from("budget_categories")
      .insert({
        household_id: household.id,
        name: newName.trim(),
        color: newColor,
        sort_order: categories.length,
      })
      .select()
      .single()

    if (error) { toast.error(error.message); return }
    if (data) {
      setCategories([...categories, data])
      setNewName("")
      toast.success(`Added "${data.name}"`)
    }
  }

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from("budget_categories").delete().eq("id", id)
    if (error) { toast.error(error.message); return }
    setCategories(categories.filter((c) => c.id !== id))
    toast.success("Category deleted")
  }

  const handleUpdateColor = async (id: string, color: string) => {
    const supabase = createClient()
    await supabase.from("budget_categories").update({ color }).eq("id", id)
    setCategories(categories.map((c) => c.id === id ? { ...c, color } : c))
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-slide-in">
      <div className="flex items-center gap-4">
        <Link href="/settings">
          <Button variant="ghost" size="icon" className="text-[#94A3B8] hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-playfair)' }}>Categories</h1>
          <p className="text-sm text-[#94A3B8]">Manage your budget categories</p>
        </div>
      </div>

      <Card className="border-[#2A2D3A] bg-[#1A1D27]">
        <CardHeader>
          <CardTitle className="text-white">Budget Categories</CardTitle>
          <CardDescription className="text-[#94A3B8]">Add, edit, or remove categories</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-3 rounded-lg border border-[#2A2D3A] bg-[#0F1117] p-3">
              <GripVertical className="h-4 w-4 text-[#94A3B8] cursor-grab" />
              <input
                type="color"
                value={cat.color || "#6366F1"}
                onChange={(e) => handleUpdateColor(cat.id, e.target.value)}
                className="h-8 w-8 cursor-pointer rounded border-0 bg-transparent"
              />
              <span className="flex-1 text-sm font-medium text-white">{cat.name}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-[#94A3B8] hover:text-red-400"
                onClick={() => handleDelete(cat.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {/* Add new */}
          <div className="flex items-center gap-3 pt-2">
            <input
              type="color"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              className="h-8 w-8 cursor-pointer rounded border-0 bg-transparent"
            />
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="New category name..."
              onKeyDown={(e) => { if (e.key === "Enter") handleAdd() }}
              className="border-[#2A2D3A] bg-[#0F1117] text-white placeholder:text-[#94A3B8]"
            />
            <Button onClick={handleAdd} className="bg-emerald-500 text-white hover:bg-emerald-600" disabled={!newName.trim()}>
              <Plus className="mr-1 h-4 w-4" /> Add
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
