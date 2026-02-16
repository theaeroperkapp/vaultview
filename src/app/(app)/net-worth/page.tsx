"use client"

import { useAllPeriods } from "@/hooks/useAllPeriods"
import { NetWorthChart } from "@/components/net-worth/NetWorthChart"
import { NetWorthSummaryCards } from "@/components/net-worth/NetWorthSummaryCards"
import { NetWorthTable } from "@/components/net-worth/NetWorthTable"

export default function NetWorthPage() {
  const { data, isLoading } = useAllPeriods()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 animate-shimmer rounded-xl" />
          ))}
        </div>
        <div className="h-[380px] animate-shimmer rounded-xl" />
        <div className="h-[300px] animate-shimmer rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-slide-in">
      <NetWorthSummaryCards data={data} />
      <NetWorthChart data={data} />
      <NetWorthTable data={data} />
    </div>
  )
}
