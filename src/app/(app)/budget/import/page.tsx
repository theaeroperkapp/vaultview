"use client"

import { CsvImporter } from "@/components/budget/CsvImporter"
import { useHousehold } from "@/hooks/useHousehold"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ImportPage() {
  const { household, isLoading } = useHousehold()

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full bg-[#1A1D27]" />
  }

  if (!household) {
    return (
      <div className="text-center text-[#94A3B8]">
        <p>No household found. Please create one first.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center gap-4">
        <Link href="/budget">
          <Button variant="ghost" size="icon" className="text-[#94A3B8] hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-playfair)' }}>
            Import CSV
          </h1>
          <p className="text-sm text-[#94A3B8]">Upload your budget spreadsheet</p>
        </div>
      </div>
      <CsvImporter householdId={household.id} />
    </div>
  )
}
