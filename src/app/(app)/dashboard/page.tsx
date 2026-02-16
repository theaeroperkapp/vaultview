import { redirect } from "next/navigation"

export default function DashboardRedirect() {
  const now = new Date()
  redirect(`/dashboard/${now.getFullYear()}/${now.getMonth() + 1}`)
}
