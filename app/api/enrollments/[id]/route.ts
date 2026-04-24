import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"
import { tryPromoteWaitlist } from "@/lib/validator"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const body = await req.json()
    const parsed = z.object({ action: z.literal("DROP") }).safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 })

    const enrollment = await db.enrollment.findUnique({
      where: { id },
      include: { section: { include: { term: true } } }
    })
    if (!enrollment) return NextResponse.json({ error: "Not found" }, { status: 404 })
    if (enrollment.studentId !== session.user.id)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    if (new Date() > enrollment.section.term.dropClosesAt)
      return NextResponse.json({ error: "Drop window is closed" }, { status: 400 })

    const promoted = await db.$transaction(async (tx) => {
      await tx.enrollment.update({ where: { id }, data: { state: "DROPPED" } })
      await tx.auditLog.create({
        data: {
          enrollmentId: id,
          actorId: session.user.id,
          fromState: enrollment.state,
          toState: "DROPPED",
          action: "DROP",
        }
      })
      return tryPromoteWaitlist(enrollment.sectionId, tx as unknown as typeof db)
    })

    return NextResponse.json({ ok: true, promoted })
  } catch (e: unknown) {
    console.error(e)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
