import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session || session.user.role !== "ADVISOR")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const { id } = await params
    const body = await req.json()
    const parsed = z.object({ status: z.enum(["APPROVED", "REJECTED"]) }).safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 })

    const existing = await db.overrideRequest.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const override = await db.$transaction(async (tx) => {
      const updated = await tx.overrideRequest.update({
        where: { id },
        data: { status: parsed.data.status, advisorId: session.user.id, decidedAt: new Date() }
      })

      await tx.auditLog.create({
        data: {
          actorId: session.user.id,
          fromState: existing.status,
          toState: parsed.data.status,
          action: parsed.data.status === "APPROVED" ? "OVERRIDE_APPROVE" : "OVERRIDE_REJECT",
          metaJson: JSON.stringify({ overrideId: existing.id, sectionId: existing.sectionId, studentId: existing.studentId }),
        }
      })

      return updated
    })

    return NextResponse.json(override)
  } catch (e: unknown) {
    console.error(e)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
