import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

async function requireAdmin() {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") return null
  return session
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    const { id } = await params
    const body = await req.json()
    const parsed = z.object({ requiredCourseId: z.string() }).safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 })
    const prereq = await db.prerequisite.create({
      data: { courseId: id, requiredCourseId: parsed.data.requiredCourseId }
    })
    return NextResponse.json(prereq, { status: 201 })
  } catch (e: unknown) {
    console.error(e)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
