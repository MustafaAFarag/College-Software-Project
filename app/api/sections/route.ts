import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const termId = searchParams.get("termId")
    const departmentId = searchParams.get("departmentId")
    const level = searchParams.get("level")
    const day = searchParams.get("day")
    const availableOnly = searchParams.get("availableOnly") === "true"

    let activeTerm = termId
    if (!activeTerm) {
      const term = await db.term.findFirst({ where: { isActive: true } })
      activeTerm = term?.id ?? ""
    }

    const sections = await db.section.findMany({
      where: { termId: activeTerm },
      include: {
        course: { include: { department: true, prerequisites: { include: { requiredCourse: true } } } },
        instructor: true,
        enrollments: { where: { state: "ENROLLED" } },
      },
      take: 200,
    })

    const filtered = sections
      .filter(s => !departmentId || s.course.departmentId === departmentId)
      .filter(s => !level || s.course.level === parseInt(level))
      .filter(s => {
        if (!day) return true
        const slots = JSON.parse(s.scheduleJson) as { day: string }[]
        return slots.some(slot => slot.day === day)
      })
      .filter(s => !availableOnly || s.enrollments.length < s.capacity)

    const result = filtered.map(s => ({
      id: s.id,
      course: { code: s.course.code, title: s.course.title, creditHours: s.course.creditHours },
      instructor: s.instructor ? { name: s.instructor.name } : null,
      capacity: s.capacity,
      enrolled: s.enrollments.length,
      scheduleJson: s.scheduleJson,
      prerequisites: s.course.prerequisites.map(p => `${p.requiredCourse.code} — ${p.requiredCourse.title}`),
      departmentId: s.course.departmentId,
      level: s.course.level,
    }))

    return NextResponse.json(result)
  } catch (e: unknown) {
    console.error(e)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
