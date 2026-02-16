import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardRedirect() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: membership } = await supabase
      .from("household_members")
      .select("household_id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle()

    if (membership) {
      // Find latest period that has budget items (not empty periods)
      const { data: periods } = await supabase
        .from("budget_periods")
        .select("id, month, year")
        .eq("household_id", membership.household_id)
        .order("year", { ascending: false })
        .order("month", { ascending: false })

      if (periods && periods.length > 0) {
        for (const period of periods) {
          const { count } = await supabase
            .from("budget_items")
            .select("id", { count: "exact", head: true })
            .eq("period_id", period.id)

          if (count && count > 0) {
            redirect(`/dashboard/${period.year}/${period.month}`)
          }
        }

        // If no period has items, fall back to the latest period
        redirect(`/dashboard/${periods[0].year}/${periods[0].month}`)
      }
    }
  }

  // Fallback to current month
  const now = new Date()
  redirect(`/dashboard/${now.getFullYear()}/${now.getMonth() + 1}`)
}
