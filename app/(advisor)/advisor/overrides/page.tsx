import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { OverrideInbox } from "./inbox"

export default async function AdvisorOverridesPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const overrides = await db.overrideRequest.findMany({
    where: { status: "PENDING" },
    include: { student: true, section: { include: { course: true } } },
    orderBy: { createdAt: "asc" },
    take: 100,
  })

  const data = overrides.map(o => ({
    id: o.id,
    studentName: o.student.name,
    courseCode: o.section.course.code,
    reason: o.reason,
    createdAt: o.createdAt.toISOString(),
  }))

  return (
    <div>
      <h1 style={{ fontSize: "20px", fontWeight: 510, color: "var(--text-primary)", marginBottom: "24px" }}>Override Inbox</h1>
      <OverrideInbox overrides={data} />
    </div>
  )
}
