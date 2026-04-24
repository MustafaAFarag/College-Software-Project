import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

async function requireAdmin() {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") return null
  return session
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string; reqId: string }> }) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    const { id, reqId } = await params
    await db.prerequisite.delete({
      where: { courseId_requiredCourseId: { courseId: id, requiredCourseId: reqId } }
    })
    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    console.error(e)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
