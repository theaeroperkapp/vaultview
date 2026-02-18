"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  MessageCircle,
  DollarSign,
  Plus,
  PenLine,
  Trash2,
  ShoppingCart,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils/currency"
import type { Profile } from "@/lib/supabase/types"

interface ActivityFeedProps {
  householdId: string | undefined
}

type ActivityType =
  | "chat"
  | "budget_add"
  | "budget_edit"
  | "budget_delete"
  | "budget_income"
  | "request_new"
  | "request_approved"
  | "request_denied"

interface ActivityItem {
  id: string
  type: ActivityType
  description: string
  actorName: string
  timestamp: string
}

const ACTIVITY_CONFIG: Record<ActivityType, { icon: React.ElementType; color: string; bg: string }> = {
  chat:             { icon: MessageCircle, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  budget_add:       { icon: Plus,          color: "text-emerald-400", bg: "bg-emerald-500/10" },
  budget_edit:      { icon: PenLine,       color: "text-blue-400",    bg: "bg-blue-500/10" },
  budget_delete:    { icon: Trash2,        color: "text-red-400",     bg: "bg-red-500/10" },
  budget_income:    { icon: DollarSign,    color: "text-amber-400",   bg: "bg-amber-500/10" },
  request_new:      { icon: ShoppingCart,  color: "text-violet-400",  bg: "bg-violet-500/10" },
  request_approved: { icon: CheckCircle2,  color: "text-emerald-400", bg: "bg-emerald-500/10" },
  request_denied:   { icon: XCircle,       color: "text-red-400",     bg: "bg-red-500/10" },
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return "just now"
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  return date.toLocaleDateString()
}

function mapAuditAction(action: string): ActivityType {
  switch (action) {
    case "add_item": return "budget_add"
    case "delete_item": return "budget_delete"
    case "update_income": return "budget_income"
    default: return "budget_edit"
  }
}

function describeAuditAction(action: string, itemName: string | null, oldValue: string | null, newValue: string | null): string {
  switch (action) {
    case "add_item":
      return `added "${itemName}"`
    case "delete_item":
      return `removed "${itemName}"`
    case "update_income":
      return `updated income to ${formatCurrency(Number(newValue || 0))}`
    case "update_planned":
      return `set "${itemName}" planned to ${formatCurrency(Number(newValue || 0))}`
    case "update_actual":
      return `set "${itemName}" actual to ${formatCurrency(Number(newValue || 0))}`
    case "rename_item":
      return `renamed "${oldValue}" to "${newValue}"`
    default:
      return `updated "${itemName}"`
  }
}

export function ActivityFeed({ householdId }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!householdId) return

    const supabase = createClient()

    const fetchActivity = async () => {
      setIsLoading(true)

      // Fetch all 3 sources + profiles in parallel
      const [messagesRes, periodsRes, requestsRes] = await Promise.all([
        supabase
          .from("messages")
          .select("*")
          .eq("household_id", householdId)
          .in("message_type", ["text", "image"])
          .order("created_at", { ascending: false })
          .limit(10),
        supabase
          .from("budget_periods")
          .select("id")
          .eq("household_id", householdId),
        supabase
          .from("purchase_requests")
          .select("*")
          .eq("household_id", householdId)
          .order("created_at", { ascending: false })
          .limit(10),
      ])

      // Fetch audit log entries for the household's periods
      const periodIds = (periodsRes.data || []).map((p) => p.id)
      let auditData: Array<{
        id: string; user_id: string; action: string;
        item_name: string | null; old_value: string | null;
        new_value: string | null; created_at: string
      }> = []

      if (periodIds.length > 0) {
        const { data } = await supabase
          .from("budget_audit_log")
          .select("*")
          .in("period_id", periodIds)
          .order("created_at", { ascending: false })
          .limit(10)
        auditData = (data || []) as typeof auditData
      }

      // Collect all user IDs for profile lookup
      const userIds = new Set<string>()
      for (const msg of messagesRes.data || []) {
        if (msg.sender_id) userIds.add(msg.sender_id)
      }
      for (const entry of auditData) {
        userIds.add(entry.user_id)
      }
      for (const req of requestsRes.data || []) {
        userIds.add(req.requester_id)
      }

      const profileMap: Record<string, Profile> = {}
      if (userIds.size > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("*")
          .in("id", [...userIds])
        for (const p of profiles || []) {
          profileMap[p.id] = p as Profile
        }
      }

      // Build unified activity list
      const items: ActivityItem[] = []

      // Messages
      for (const msg of messagesRes.data || []) {
        const content = msg.content.length > 50 ? msg.content.slice(0, 50) + "..." : msg.content
        items.push({
          id: `msg-${msg.id}`,
          type: "chat",
          description: content,
          actorName: profileMap[msg.sender_id]?.display_name || "Someone",
          timestamp: msg.created_at,
        })
      }

      // Audit log
      for (const entry of auditData) {
        items.push({
          id: `audit-${entry.id}`,
          type: mapAuditAction(entry.action),
          description: describeAuditAction(entry.action, entry.item_name, entry.old_value, entry.new_value),
          actorName: profileMap[entry.user_id]?.display_name || "Someone",
          timestamp: entry.created_at,
        })
      }

      // Purchase requests
      for (const req of requestsRes.data || []) {
        const statusType: ActivityType =
          req.status === "approved" ? "request_approved" :
          req.status === "denied" ? "request_denied" : "request_new"
        const statusLabel =
          req.status === "approved" ? "approved" :
          req.status === "denied" ? "denied" : "submitted"
        items.push({
          id: `req-${req.id}`,
          type: statusType,
          description: `${statusLabel} "${req.title}" (${formatCurrency(req.amount)})`,
          actorName: profileMap[req.requester_id]?.display_name || "Someone",
          timestamp: req.status === "pending" ? req.created_at : req.updated_at,
        })
      }

      // Sort by timestamp, take 15
      items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      setActivities(items.slice(0, 15))
      setIsLoading(false)
    }

    fetchActivity()
  }, [householdId])

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-white">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[320px]">
          {isLoading ? (
            <div className="space-y-0 px-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-start gap-3 border-b border-[#2A2D3A]/50 py-3 last:border-0">
                  <div className="h-8 w-8 animate-shimmer rounded-full shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 w-3/4 animate-shimmer rounded" />
                    <div className="h-2.5 w-16 animate-shimmer rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : activities.length === 0 ? (
            <div className="flex h-[280px] items-center justify-center text-sm text-[#94A3B8]">
              No activity yet
            </div>
          ) : (
            <div className="space-y-0 px-4">
              {activities.map((activity) => {
                const config = ACTIVITY_CONFIG[activity.type]
                const Icon = config.icon
                return (
                  <div key={activity.id} className="flex items-start gap-3 border-b border-[#2A2D3A]/50 py-3 last:border-0">
                    <div className={`mt-0.5 shrink-0 rounded-full p-1.5 ${config.bg}`}>
                      <Icon className={`h-3.5 w-3.5 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white">
                        <span className="font-medium">{activity.actorName}</span>{" "}
                        <span className="text-[#94A3B8]">{activity.description}</span>
                      </p>
                      <p className="text-xs text-[#64748B]">{formatTime(activity.timestamp)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
