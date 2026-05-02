import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function Home() {
  const session = await auth()
  if (!session) redirect("/login")

  const role = session.user.role
  if (role === "STUDENT") redirect("/student/dashboard")
  if (role === "ADVISOR") redirect("/advisor/overrides")
  if (role === "INSTRUCTOR") redirect("/instructor/roster")
  redirect("/admin/dashboard")
}
