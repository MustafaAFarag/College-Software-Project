import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

async function requireAdmin() {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") return null
  return session
}

export async function GET(req: Request) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    const { searchParams } = new URL(req.url)
    const termId = searchParams.get("termId")

    let activeTerm = termId
    if (!activeTerm) {
      const term = await db.term.findFirst({ where: { isActive: true } })
      activeTerm = term?.id ?? ""
    }

    const sections = await db.section.findMany({
      where: { termId: activeTerm },
      include: {
        course: true, instructor: true,
        enrollments: { where: { state: "ENROLLED" } },
      },
      take: 200,
    })
    return NextResponse.json(sections.map(s => ({ ...s, enrolled: s.enrollments.length })))
  } catch (e: unknown) {
    console.error(e)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    const body = await req.json()
    const parsed = z.object({
      courseId: z.string(),
      termId: z.string(),
      capacity: z.number().int().positive(),
      scheduleJson: z.string(),
      instructorId: z.string().optional(),
    }).safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 })
    const section = await db.section.create({ data: parsed.data })
    return NextResponse.json(section, { status: 201 })
  } catch (e: unknown) {
    console.error(e)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
