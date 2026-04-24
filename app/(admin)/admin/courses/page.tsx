import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { CoursesClient } from "./client"

export default async function CoursesPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const courses = await db.course.findMany({
    include: { department: true, prerequisites: { include: { requiredCourse: true } } },
    orderBy: { code: "asc" },
    take: 100,
  })
  const departments = await db.department.findMany({ orderBy: { code: "asc" } })

  const data = courses.map(c => ({
    id: c.id, code: c.code, title: c.title, creditHours: c.creditHours, level: c.level,
    departmentId: c.departmentId, departmentCode: c.department.code,
    prerequisites: c.prerequisites.map(p => ({ id: p.requiredCourseId, code: p.requiredCourse.code })),
  }))

  return (
    <div>
      <h1 style={{ fontSize: "20px", fontWeight: 510, color: "var(--text-primary)", marginBottom: "24px" }}>Courses</h1>
      <CoursesClient courses={data} departments={departments.map(d => ({ id: d.id, code: d.code, name: d.name }))} />
    </div>
  )
}
