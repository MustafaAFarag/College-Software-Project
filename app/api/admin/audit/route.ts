import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

async function requireAdmin() {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") return null
  return session
}

export async function GET(req: Request) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get("studentId")
    const sectionId = searchParams.get("sectionId")
    const action = searchParams.get("action")
    const from = searchParams.get("from")
    const to = searchParams.get("to")
    const page = parseInt(searchParams.get("page") ?? "1")
    const limit = parseInt(searchParams.get("limit") ?? "50")

    const where: Record<string, unknown> = {}
    if (studentId) where.actorId = studentId
    if (action) where.action = action
    if (sectionId) where.enrollment = { sectionId }
    if (from || to) {
      where.at = {}
      if (from) (where.at as Record<string, Date>).gte = new Date(from)
      if (to) (where.at as Record<string, Date>).lte = new Date(to)
    }

    const logs = await db.auditLog.findMany({
      where,
      include: { actor: true, enrollment: { include: { section: { include: { course: true } } } } },
      orderBy: { at: "desc" },
      take: limit,
      skip: (page - 1) * limit,
    })
    const total = await db.auditLog.count({ where })
    return NextResponse.json({ logs, total, page, limit })
  } catch (e: unknown) {
    console.error(e)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
