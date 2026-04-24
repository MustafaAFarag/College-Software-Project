import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"
import { validateEnrollment } from "@/lib/validator"

export async function GET() {
  try {
    const session = await auth()
    if (!session || session.user.role !== "STUDENT")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const term = await db.term.findFirst({ where: { isActive: true } })
    const enrollments = await db.enrollment.findMany({
      where: { studentId: session.user.id, section: { termId: term?.id } },
      include: { section: { include: { course: true, term: true } } },
      take: 50,
    })
    return NextResponse.json(enrollments)
  } catch (e: unknown) {
    console.error(e)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session || session.user.role !== "STUDENT")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const parsed = z.object({ sectionId: z.string() }).safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 })

    const { sectionId } = parsed.data

    const override = await db.overrideRequest.findFirst({
      where: { studentId: session.user.id, sectionId, status: "APPROVED" }
    })
    const overrideGranted = !!override

    const result = await validateEnrollment(session.user.id, sectionId, db, overrideGranted)
    if (!result.ok) return NextResponse.json({ error: result.reason }, { status: 409 })

    let waitlistPos: number | null = null
    if (result.state === "WAITLISTED") {
      const maxPos = await db.enrollment.aggregate({
        where: { sectionId, state: "WAITLISTED" },
        _max: { waitlistPos: true }
      })
      waitlistPos = (maxPos._max.waitlistPos ?? 0) + 1
    }

    const enrollment = await db.$transaction(async (tx) => {
      // upsert handles re-enroll after DROP (@@unique[studentId, sectionId] already exists)
      const enr = await tx.enrollment.upsert({
        where: { studentId_sectionId: { studentId: session.user.id, sectionId } },
        update: { state: result.state, waitlistPos },
        create: { studentId: session.user.id, sectionId, state: result.state, waitlistPos },
      })
      await tx.auditLog.create({
        data: {
          enrollmentId: enr.id,
          actorId: session.user.id,
          toState: result.state,
          action: result.state === "WAITLISTED" ? "WAITLIST" : "ENROLL",
        }
      })
      return enr
    })

    return NextResponse.json({ ok: true, state: result.state, waitlistPos, enrollmentId: enrollment.id })
  } catch (e: unknown) {
    console.error(e)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
