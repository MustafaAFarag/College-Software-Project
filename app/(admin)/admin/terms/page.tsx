import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { TermsClient } from "./client"

export default async function TermsPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const terms = await db.term.findMany({ orderBy: { startDate: "desc" }, take: 50 })
  const data = terms.map(t => ({
    id: t.id, code: t.code, label: t.label, isActive: t.isActive,
    startDate: t.startDate.toISOString(),
    endDate: t.endDate.toISOString(),
    regOpensAt: t.regOpensAt.toISOString(),
    regClosesAt: t.regClosesAt.toISOString(),
    dropClosesAt: t.dropClosesAt.toISOString(),
  }))

  return (
    <div>
      <h1 style={{ fontSize: "20px", fontWeight: 510, color: "var(--text-primary)", marginBottom: "24px" }}>Terms</h1>
      <TermsClient terms={data} />
    </div>
  )
}
