import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

export async function GET() {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    if (session.user.role === "STUDENT") {
      const overrides = await db.overrideRequest.findMany({
        where: { studentId: session.user.id },
        include: { section: { include: { course: true } } },
        orderBy: { createdAt: "desc" },
        take: 50,
      })
      return NextResponse.json(overrides)
    }

    if (session.user.role === "ADVISOR") {
      const overrides = await db.overrideRequest.findMany({
        where: { status: "PENDING" },
        include: { student: true, section: { include: { course: true } } },
        orderBy: { createdAt: "asc" },
        take: 100,
      })
      return NextResponse.json(overrides)
    }

    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
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
    const parsed = z.object({
      sectionId: z.string(),
      reason: z.string().min(20).max(500),
    }).safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

    const override = await db.overrideRequest.create({
      data: { studentId: session.user.id, sectionId: parsed.data.sectionId, reason: parsed.data.reason }
    })
    return NextResponse.json(override, { status: 201 })
  } catch (e: unknown) {
    console.error(e)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
