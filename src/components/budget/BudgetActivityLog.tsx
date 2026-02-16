"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, PenLine, Plus, Trash2, DollarSign, Type, Activity } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useBudgetAuditLog, type AuditLogEntry } from "@/hooks/useBudgetAuditLog"
import { formatCurrency } from "@/lib/utils/currency"

function relativeTime(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffSec = Math.floor((now - then) / 1000)

  if (diffSec < 60) return "just now"
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHrs = Math.floor(diffMin / 60)
  if (diffHrs < 24) return `${diffHrs}h ago`
  const diffDays = Math.floor(diffHrs / 24)
  if (diffDays < 30) return `${diffDays}d ago`
  return new Date(dateStr).toLocaleDateString()
}

const ACTION_CONFIG: Record<string, { icon: typeof PenLine; label: string; color: string }> = {
  update_planned: { icon: PenLine, label: "Updated planned", color: "text-blue-400" },
  update_actual:  { icon: PenLine, label: "Updated actual", color: "text-violet-400" },
  update_income:  { icon: DollarSign, label: "Changed income", color: "text-emerald-400" },
  add_item:       { icon: Plus, label: "Added", color: "text-emerald-400" },
  delete_item:    { icon: Trash2, label: "Removed", color: "text-red-400" },
  rename_item:    { icon: Type, label: "Renamed", color: "text-amber-400" },
}

function EntryRow({ entry }: { entry: AuditLogEntry }) {
  const config = ACTION_CONFIG[entry.action] ?? { icon: Activity, label: entry.action, color: "text-[#94A3B8]" }
  const Icon = config.icon

  const showValues = entry.old_value != null && entry.new_value != null
  const isMonetary = ["update_planned", "update_actual", "update_income"].includes(entry.action)

  const formatVal = (v: string) => {
    if (isMonetary) {
      const n = parseFloat(v)
      return isNaN(n) ? v : formatCurrency(n)
    }
    return v
  }

  return (
    <div className="flex items-start gap-3 px-4 py-2.5 border-b border-[#2A2D3A]/50 last:border-b-0">
      <div className={`mt-0.5 ${config.color}`}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[#94A3B8]">
          <span className="font-medium text-white">{entry.display_name}</span>
          {" "}
          <span className={config.color}>{config.label}</span>
          {entry.item_name && (
            <span className="text-white"> &quot;{entry.item_name}&quot;</span>
          )}
          {showValues && (
            <span>
              : <span className="text-[#64748B] line-through">{formatVal(entry.old_value!)}</span>
              {" → "}
              <span className="text-white">{formatVal(entry.new_value!)}</span>
            </span>
          )}
        </p>
      </div>
      <span className="text-xs text-[#64748B] whitespace-nowrap mt-0.5">
        {relativeTime(entry.created_at)}
      </span>
    </div>
  )
}

export function BudgetActivityLog({ periodId }: { periodId: string | undefined }) {
  const [isOpen, setIsOpen] = useState(false)
  const { entries, isLoading, refetch } = useBudgetAuditLog(periodId)

  const handleToggle = () => {
    const next = !isOpen
    setIsOpen(next)
    if (next) refetch()
  }

  return (
    <div className="glass-card overflow-hidden">
      <button
        onClick={handleToggle}
        className="flex w-full items-center gap-2 px-4 py-3 text-left transition-colors hover:bg-white/[0.02]"
      >
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-[#94A3B8]" />
        ) : (
          <ChevronRight className="h-4 w-4 text-[#94A3B8]" />
        )}
        <Activity className="h-4 w-4 text-[#94A3B8]" />
        <span className="text-sm font-medium text-[#94A3B8]">Activity Log</span>
        {entries.length > 0 && isOpen && (
          <span className="text-xs text-[#64748B]">({entries.length})</span>
        )}
      </button>

      {isOpen && (
        <div className="border-t border-[#2A2D3A]/50">
          {isLoading ? (
            <div className="space-y-1 p-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-8 w-full animate-shimmer rounded" />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-[#64748B]">
              No changes recorded yet
            </p>
          ) : (
            <ScrollArea className="max-h-80">
              {entries.map((entry) => (
                <EntryRow key={entry.id} entry={entry} />
              ))}
            </ScrollArea>
          )}
        </div>
      )}
    </div>
  )
}
