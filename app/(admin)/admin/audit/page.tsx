import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { AuditLogTable } from "@/components/AuditLogTable"

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; studentId?: string; sectionId?: string; action?: string; from?: string; to?: string }>
}) {
  const session = await auth()
  if (!session) redirect("/login")

  const { page: pageStr, studentId, sectionId, action, from, to } = await searchParams
  const page = parseInt(pageStr ?? "1")
  const limit = 50

  const where: Record<string, unknown> = {}
  if (studentId) where.actorId = studentId
  if (sectionId) where.enrollment = { sectionId }
  if (action) where.action = action
  if (from || to) {
    where.at = {}
    if (from) (where.at as Record<string, Date>).gte = new Date(from)
    if (to) (where.at as Record<string, Date>).lte = new Date(to)
  }

  const [logs, total, students, sections] = await Promise.all([
    db.auditLog.findMany({
      where,
      include: { actor: true, enrollment: { include: { section: { include: { course: true } } } } },
      orderBy: { at: "desc" },
      take: limit,
      skip: (page - 1) * limit,
    }),
    db.auditLog.count({ where }),
    db.user.findMany({
      where: { role: "STUDENT" },
      select: { id: true, name: true, studentId: true },
      orderBy: { name: "asc" },
      take: 200,
    }),
    db.section.findMany({
      include: { course: true, term: true },
      orderBy: [{ term: { startDate: "desc" } }, { course: { code: "asc" } }],
      take: 200,
    }),
  ])

  const data = logs.map(l => ({
    id: l.id,
    actorName: l.actor.name,
    action: l.action,
    fromState: l.fromState,
    toState: l.toState,
    courseCode: l.enrollment?.section?.course?.code ?? null,
    at: l.at.toISOString(),
  }))

  return (
    <div>
      <h1 style={{ fontSize: "20px", fontWeight: 510, color: "var(--text-primary)", marginBottom: "24px" }}>Audit Log</h1>
      <AuditLogTable
        logs={data}
        total={total}
        page={page}
        limit={limit}
        students={students.map((student) => ({ id: student.id, label: `${student.name} (${student.studentId ?? "No ID"})` }))}
        sections={sections.map((section) => ({
          id: section.id,
          label: `${section.course.code} - ${section.term.label}${section.groupLabel ? ` - ${section.groupLabel}` : ""}`,
        }))}
        filters={{ studentId: studentId ?? "", sectionId: sectionId ?? "", action: action ?? "", from: from ?? "", to: to ?? "" }}
      />
    </div>
  )
}
