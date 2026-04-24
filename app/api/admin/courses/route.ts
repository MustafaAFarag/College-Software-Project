import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

async function requireAdmin() {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") return null
  return session
}

export async function GET() {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    const courses = await db.course.findMany({
      include: { department: true, prerequisites: { include: { requiredCourse: true } } },
      orderBy: { code: "asc" },
      take: 100,
    })
    return NextResponse.json(courses)
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
      code: z.string(),
      title: z.string(),
      creditHours: z.number().int().positive(),
      level: z.number().int(),
      departmentId: z.string(),
    }).safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 })
    const course = await db.course.create({ data: parsed.data })
    return NextResponse.json(course, { status: 201 })
  } catch (e: unknown) {
    console.error(e)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
