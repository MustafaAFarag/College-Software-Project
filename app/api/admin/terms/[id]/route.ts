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

    if (body.isActive === true) {
      await db.$transaction([
        db.term.updateMany({ data: { isActive: false } }),
        db.term.update({ where: { id }, data: { isActive: true } }),
      ])
      const term = await db.term.findUnique({ where: { id } })
      return NextResponse.json(term)
    }

    const updateSchema = z.object({
      code: z.string().optional(),
      label: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      regOpensAt: z.string().optional(),
      regClosesAt: z.string().optional(),
      dropClosesAt: z.string().optional(),
    })
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 })

    const data: Record<string, unknown> = { ...parsed.data }
    for (const key of ["startDate", "endDate", "regOpensAt", "regClosesAt", "dropClosesAt"] as const) {
      if (data[key]) data[key] = new Date(data[key] as string)
    }

    const term = await db.term.update({ where: { id }, data })
    return NextResponse.json(term)
  } catch (e: unknown) {
    console.error(e)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
