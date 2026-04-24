import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { ScheduleGrid } from "@/components/ScheduleGrid"

export default async function SchedulePage() {
  const session = await auth()
  if (!session) redirect("/login")

  const term = await db.term.findFirst({ where: { isActive: true } })
  const enrollments = term ? await db.enrollment.findMany({
    where: { studentId: session.user.id, state: { in: ["ENROLLED", "WAITLISTED"] }, section: { termId: term.id } },
    include: { section: { include: { course: true } } },
    take: 50,
  }) : []

  const data = enrollments.map(e => ({
    id: e.id,
    courseCode: e.section.course.code,
    courseTitle: e.section.course.title,
    instructor: e.section.instructorName ?? null,
    groupLabel: e.section.groupLabel ?? null,
    state: e.state as "ENROLLED" | "WAITLISTED",
    scheduleJson: e.section.scheduleJson,
  }))

  const dropClosesAt = term?.dropClosesAt?.toISOString() ?? null

  return (
    <div>
      <h1 style={{ fontSize: "20px", fontWeight: 510, color: "var(--text-primary)", marginBottom: "20px" }}>My Schedule</h1>
      <ScheduleGrid enrollments={data} dropClosesAt={dropClosesAt} />
    </div>
  )
}
