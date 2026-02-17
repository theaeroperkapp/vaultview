"use client"

import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useTemplateStore } from "@/stores/templateStore"

export function useTemplates(householdId: string | undefined) {
  const setTemplates = useTemplateStore((s) => s.setTemplates)

  useEffect(() => {
    if (!householdId) return

    const supabase = createClient()
    const fetchTemplates = async () => {
      const { data } = await supabase
        .from("budget_templates")
        .select("*")
        .eq("household_id", householdId)
        .order("created_at", { ascending: false })

      if (data) setTemplates(data)
    }
    fetchTemplates()
  }, [householdId, setTemplates])
}
