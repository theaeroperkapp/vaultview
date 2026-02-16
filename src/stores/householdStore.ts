import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { Household } from '@/lib/supabase/types'

interface HouseholdState {
  household: Household | null
  isLoading: boolean
  hasFetched: boolean
  fetch: () => Promise<void>
}

export const useHouseholdStore = create<HouseholdState>((set, get) => ({
  household: null,
  isLoading: false,
  hasFetched: false,

  fetch: async () => {
    // Skip if already fetched or currently fetching
    if (get().hasFetched || get().isLoading) return

    set({ isLoading: true })
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      set({ isLoading: false, hasFetched: true })
      return
    }

    const { data: membership } = await supabase
      .from('household_members')
      .select('household_id')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle()

    if (membership) {
      const { data: householdData } = await supabase
        .from('households')
        .select('*')
        .eq('id', membership.household_id)
        .maybeSingle()

      set({ household: householdData, isLoading: false, hasFetched: true })
    } else {
      set({ isLoading: false, hasFetched: true })
    }
  },
}))
