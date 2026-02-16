"use client"

import { useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { BudgetAuditLog } from "@/lib/supabase/types"

export interface AuditLogEntry extends BudgetAuditLog {
  display_name: string
}

export function useBudgetAuditLog(periodId: string | undefined) {
  const [entries, setEntries] = useState<AuditLogEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const refetch = useCallback(async () => {
    if (!periodId) return

    setIsLoading(true)
    const supabase = createClient()

    const { data: logs, error } = await supabase
      .from("budget_audit_log")
      .select("*")
      .eq("period_id", periodId)
      .order("created_at", { ascending: false })
      .limit(50)

    if (error || !logs) {
      console.warn("[audit-log]", error?.message)
      setIsLoading(false)
      return
    }

    // Resolve user display names
    const userIds = [...new Set(logs.map((l) => l.user_id))]
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name")
      .in("id", userIds)

    const nameMap = new Map(
      (profiles ?? []).map((p) => [p.id, p.display_name])
    )

    setEntries(
      logs.map((log) => ({
        ...log,
        display_name: nameMap.get(log.user_id) ?? "Unknown",
      }))
    )
    setIsLoading(false)
  }, [periodId])

  return { entries, isLoading, refetch }
}
