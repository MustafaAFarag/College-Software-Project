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
    const terms = await db.term.findMany({ orderBy: { startDate: "desc" }, take: 50 })
    return NextResponse.json(terms)
  } catch (e: unknown) {
    console.error(e)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

const termSchema = z.object({
  code: z.string(),
  label: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  regOpensAt: z.string(),
  regClosesAt: z.string(),
  dropClosesAt: z.string(),
})

export async function POST(req: Request) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    const body = await req.json()
    const parsed = termSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 })
    const term = await db.term.create({ data: { ...parsed.data, startDate: new Date(parsed.data.startDate), endDate: new Date(parsed.data.endDate), regOpensAt: new Date(parsed.data.regOpensAt), regClosesAt: new Date(parsed.data.regClosesAt), dropClosesAt: new Date(parsed.data.dropClosesAt) } })
    return NextResponse.json(term, { status: 201 })
  } catch (e: unknown) {
    console.error(e)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
