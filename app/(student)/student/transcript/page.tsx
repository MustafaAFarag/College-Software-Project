import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"

const STATE_LABELS: Record<string, string> = {
  ENROLLED: "Enrolled",
  COMPLETED: "Completed",
  DROPPED: "Dropped",
  WAITLISTED: "Waitlisted",
  CANCELLED: "Cancelled",
  PENDING: "Pending",
}

export default async function TranscriptPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const enrollments = await db.enrollment.findMany({
    where: { studentId: session.user.id, state: { not: "PENDING" } },
    include: { section: { include: { course: true, term: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  })

  const byTerm = new Map<string, typeof enrollments>()
  for (const e of enrollments) {
    const key = e.section.term.label
    if (!byTerm.has(key)) byTerm.set(key, [])
    byTerm.get(key)!.push(e)
  }

  const completedCredits = enrollments
    .filter(e => e.state === "COMPLETED")
    .reduce((sum, e) => sum + e.section.course.creditHours, 0)

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 510, color: "var(--text-primary)" }}>Transcript</h1>
        <a href="/api/transcript"
          style={{ background: "var(--accent)", color: "var(--text-primary)", borderRadius: "6px", padding: "8px 16px", textDecoration: "none", fontSize: "13px", fontWeight: 510 }}>
          Download PDF
        </a>
      </div>

      {[...byTerm.entries()].map(([termLabel, enrs]) => (
        <div key={termLabel} style={{ marginBottom: "24px" }}>
          <h2 style={{ fontSize: "14px", fontWeight: 510, color: "var(--text-muted)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{termLabel}</h2>
          <div style={{ background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: "8px", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <th style={{ padding: "10px 16px", textAlign: "left", fontSize: "12px", color: "var(--text-muted)", fontWeight: 510 }}>Code</th>
                  <th style={{ padding: "10px 16px", textAlign: "left", fontSize: "12px", color: "var(--text-muted)", fontWeight: 510 }}>Title</th>
                  <th style={{ padding: "10px 16px", textAlign: "center", fontSize: "12px", color: "var(--text-muted)", fontWeight: 510 }}>Credits</th>
                  <th style={{ padding: "10px 16px", textAlign: "right", fontSize: "12px", color: "var(--text-muted)", fontWeight: 510 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {enrs.map(e => (
                  <tr key={e.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "10px 16px", fontSize: "13px", color: "var(--text-primary)", fontWeight: 510 }}>{e.section.course.code}</td>
                    <td style={{ padding: "10px 16px", fontSize: "13px", color: "var(--text-secondary)" }}>{e.section.course.title}</td>
                    <td style={{ padding: "10px 16px", fontSize: "13px", color: "var(--text-muted)", textAlign: "center" }}>{e.section.course.creditHours}</td>
                    <td style={{ padding: "10px 16px", textAlign: "right" }}>
                      <span style={{ fontSize: "11px", color: e.state === "COMPLETED" ? "var(--green)" : e.state === "DROPPED" ? "#f87171" : "var(--text-muted)", border: "1px solid currentColor", borderRadius: "9999px", padding: "2px 8px", fontWeight: 510 }}>
                        {STATE_LABELS[e.state] ?? e.state}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {byTerm.size === 0 && (
        <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "60px 40px", fontSize: "13px", background: "rgba(255,255,255,0.01)", border: "1px solid var(--border)", borderRadius: "8px" }}>
          No enrollment history
        </div>
      )}

      <div style={{ marginTop: "16px", fontSize: "13px", color: "var(--text-muted)" }}>
        Total completed credits: <span style={{ color: "var(--text-primary)", fontWeight: 510 }}>{completedCredits}</span>
      </div>
    </div>
  )
}
