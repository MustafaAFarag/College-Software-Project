import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

async function requireAdmin() {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") return null
  return session
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    const { id } = await params
    const body = await req.json()
    const parsed = z.object({
      code: z.string().optional(),
      title: z.string().optional(),
      creditHours: z.number().int().positive().optional(),
      level: z.number().int().optional(),
      departmentId: z.string().optional(),
    }).safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 })
    const course = await db.course.update({ where: { id }, data: parsed.data })
    return NextResponse.json(course)
  } catch (e: unknown) {
    console.error(e)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
