import { renderToBuffer } from "@react-pdf/renderer"
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { TranscriptPdf, type TranscriptTerm } from "@/lib/transcript-pdf"

export async function GET() {
  try {
    const session = await auth()
    if (!session || session.user.role !== "STUDENT")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const enrollments = await db.enrollment.findMany({
      where: { studentId: session.user.id, state: { not: "PENDING" } },
      include: { section: { include: { course: true, term: true } } },
      orderBy: { createdAt: "desc" },
      take: 200,
    })

    const user = await db.user.findUnique({ where: { id: session.user.id } })

    const byTerm = new Map<string, typeof enrollments>()
    for (const enrollment of enrollments) {
      const key = enrollment.section.term.label
      if (!byTerm.has(key)) byTerm.set(key, [])
      byTerm.get(key)!.push(enrollment)
    }

    let totalCompletedCredits = 0
    const terms: TranscriptTerm[] = [...byTerm.entries()].map(([label, records]) => ({
      label,
      courses: records.map((record) => {
        if (record.state === "COMPLETED") totalCompletedCredits += record.section.course.creditHours
        return {
          id: record.id,
          code: record.section.course.code,
          title: record.section.course.title,
          creditHours: record.section.course.creditHours,
          status: record.state,
        }
      }),
    }))

    const pdf = await renderToBuffer(TranscriptPdf({
      generatedAt: new Date().toLocaleDateString(),
      student: {
        name: user?.name ?? session.user.name ?? "Unknown Student",
        studentId: user?.studentId ?? null,
        department: user?.department ?? null,
      },
      terms,
      totalCompletedCredits,
    }))

    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="transcript-${user?.studentId ?? session.user.id}.pdf"`,
      },
    })
  } catch (e: unknown) {
    console.error(e)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
