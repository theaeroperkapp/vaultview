import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardRedirect() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    // Find latest period with data
    const { data: membership } = await supabase
      .from("household_members")
      .select("household_id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle()

    if (membership) {
      const { data: latestPeriod } = await supabase
        .from("budget_periods")
        .select("month, year")
        .eq("household_id", membership.household_id)
        .order("year", { ascending: false })
        .order("month", { ascending: false })
        .limit(1)
        .maybeSingle()

      if (latestPeriod) {
        redirect(`/dashboard/${latestPeriod.year}/${latestPeriod.month}`)
      }
    }
  }

  // Fallback to current month
  const now = new Date()
  redirect(`/dashboard/${now.getFullYear()}/${now.getMonth() + 1}`)
}
