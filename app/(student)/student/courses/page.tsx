import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { CourseBrowser } from "./browser"

export default async function CoursesPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const term = await db.term.findFirst({ where: { isActive: true } })
  const departments = await db.department.findMany({ orderBy: { code: "asc" } })

  const sections = term ? await db.section.findMany({
    where: { termId: term.id },
    include: {
      course: { include: { department: true, prerequisites: { include: { requiredCourse: true } } } },
      instructor: true,
      enrollments: { where: { state: "ENROLLED" } },
    },
    take: 200,
  }) : []

  const myEnrollments = term ? await db.enrollment.findMany({
    where: { studentId: session.user.id, section: { termId: term.id } },
    take: 50,
  }) : []

  const sectionData = sections.map(s => ({
    id: s.id,
    courseCode: s.course.code,
    courseTitle: s.course.title,
    creditHours: s.course.creditHours,
    level: s.course.level,
    departmentId: s.course.departmentId,
    departmentCode: s.course.department.code,
    instructor: s.instructorName ?? s.instructor?.name ?? null,
    groupLabel: s.groupLabel ?? null,
    capacity: s.capacity,
    enrolled: s.enrollments.length,
    scheduleJson: s.scheduleJson,
    prerequisites: s.course.prerequisites.map(p => ({ code: p.requiredCourse.code, title: p.requiredCourse.title })),
  }))

  const enrollmentMap: Record<string, { state: string; id: string; waitlistPos: number | null }> = {}
  for (const e of myEnrollments) {
    enrollmentMap[e.sectionId] = { state: e.state, id: e.id, waitlistPos: e.waitlistPos }
  }

  return <CourseBrowser sections={sectionData} departments={departments} enrollmentMap={enrollmentMap} />
}
