import { cn } from "@/lib/utils"
import { getBudgetStatus } from "@/lib/utils/currency"

interface StatusBadgeProps {
  planned: number
  actual: number
}

export function StatusBadge({ planned, actual }: StatusBadgeProps) {
  const status = getBudgetStatus(planned, actual)

  const config = {
    "on-budget": { label: "On Budget", className: "bg-emerald-500/10 text-emerald-400" },
    warning: { label: "Close", className: "bg-amber-500/10 text-amber-400" },
    "over-budget": { label: "Over", className: "bg-red-500/10 text-red-400" },
    neutral: { label: "—", className: "bg-[#1E2130] text-[#94A3B8]" },
  }

  const { label, className } = config[status]

  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", className)}>
      {label}
    </span>
  )
}
