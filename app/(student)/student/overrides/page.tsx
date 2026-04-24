import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { OverridesClient } from "./client"

export default async function OverridesPage({ searchParams }: { searchParams: Promise<{ sectionId?: string }> }) {
  const session = await auth()
  if (!session) redirect("/login")

  const { sectionId } = await searchParams

  const overrides = await db.overrideRequest.findMany({
    where: { studentId: session.user.id },
    include: { section: { include: { course: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  const term = await db.term.findFirst({ where: { isActive: true } })
  const sections = term ? await db.section.findMany({
    where: { termId: term.id },
    include: { course: true },
    take: 200,
  }) : []

  const overrideData = overrides.map(o => ({
    id: o.id,
    sectionId: o.sectionId,
    courseCode: o.section.course.code,
    reason: o.reason,
    status: o.status,
    createdAt: o.createdAt.toISOString(),
  }))

  const sectionOptions = sections.map(s => ({ id: s.id, label: `${s.course.code} — ${s.course.title}` }))

  return <OverridesClient overrides={overrideData} sections={sectionOptions} prefillSectionId={sectionId ?? null} />
}
