"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Household } from "@/lib/supabase/types"

export function useHousehold() {
  const [household, setHousehold] = useState<Household | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    const fetchHousehold = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setIsLoading(false)
        return
      }

      const { data: membership } = await supabase
        .from("household_members")
        .select("household_id")
        .eq("user_id", user.id)
        .limit(1)
        .single()

      if (membership) {
        const { data: householdData } = await supabase
          .from("households")
          .select("*")
          .eq("id", membership.household_id)
          .single()

        setHousehold(householdData)
      }

      setIsLoading(false)
    }

    fetchHousehold()
  }, [])

  return { household, isLoading }
}
