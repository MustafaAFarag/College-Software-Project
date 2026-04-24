import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { SectionsClient } from "./client"

export default async function SectionsPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const term = await db.term.findFirst({ where: { isActive: true } })
  const terms = await db.term.findMany({ orderBy: { startDate: "desc" }, take: 20 })
  const courses = await db.course.findMany({ orderBy: { code: "asc" }, take: 100 })
  const instructors = await db.user.findMany({
    where: { role: "INSTRUCTOR" },
    orderBy: { name: "asc" },
    take: 50,
  })

  const sections = await db.section.findMany({
    include: {
      course: true,
      term: true,
      instructor: true,
      enrollments: { where: { state: "ENROLLED" } },
    },
    orderBy: [{ term: { startDate: "desc" } }, { course: { code: "asc" } }],
    take: 200,
  })

  const sectionData = sections.map(s => ({
    id: s.id,
    termId: s.termId,
    courseId: s.courseId,
    courseCode: s.course.code,
    courseTitle: s.course.title,
    termLabel: s.term.label,
    capacity: s.capacity,
    enrolled: s.enrollments.length,
    scheduleJson: s.scheduleJson,
    instructorId: s.instructorId,
    instructorName: s.instructor?.name ?? s.instructorName ?? null,
    groupLabel: s.groupLabel ?? null,
  }))

  return (
    <div>
      <h1 style={{ fontSize: "20px", fontWeight: 510, color: "var(--text-primary)", marginBottom: "24px" }}>Sections</h1>
      <SectionsClient
        sections={sectionData}
        terms={terms.map(t => ({ id: t.id, label: t.label }))}
        courses={courses.map(c => ({ id: c.id, code: c.code, title: c.title }))}
        instructors={instructors.map((instructor) => ({ id: instructor.id, name: instructor.name }))}
        activeTermId={term?.id ?? null}
      />
    </div>
  )
}
