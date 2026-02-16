import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  className?: string
  children?: React.ReactNode
}

export function EmptyState({ icon: Icon, title, description, className, children }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
      <Icon className="mb-4 h-12 w-12 text-[#94A3B8]" />
      <h3 className="mb-1 text-lg font-semibold text-white">{title}</h3>
      <p className="mb-4 max-w-sm text-sm text-[#94A3B8]">{description}</p>
      {children}
    </div>
  )
}
