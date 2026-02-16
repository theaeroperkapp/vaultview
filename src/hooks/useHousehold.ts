"use client"

import { useEffect } from "react"
import { useHouseholdStore } from "@/stores/householdStore"

export function useHousehold() {
  const household = useHouseholdStore((s) => s.household)
  const isLoading = useHouseholdStore((s) => s.isLoading)
  const fetch = useHouseholdStore((s) => s.fetch)

  useEffect(() => {
    fetch()
  }, [fetch])

  return { household, isLoading }
}
