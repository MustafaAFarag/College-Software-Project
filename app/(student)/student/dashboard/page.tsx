import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { MAX_CREDITS } from "@/lib/validator"
import Link from "next/link"

export default async function StudentDashboard() {
  const session = await auth()
  if (!session) redirect("/login")

  const term = await db.term.findFirst({ where: { isActive: true } })
  const enrollments = term ? await db.enrollment.findMany({
    where: { studentId: session.user.id, section: { termId: term.id } },
    include: { section: { include: { course: true } } },
    take: 50,
  }) : []

  const enrolled = enrollments.filter(e => e.state === "ENROLLED")
  const waitlisted = enrollments.filter(e => e.state === "WAITLISTED")
  const credits = enrolled.reduce((sum, e) => sum + e.section.course.creditHours, 0)

  const now = new Date()
  let windowStatus = "CLOSED"
  let windowColor = "#f87171"
  if (term) {
    if (now >= term.regOpensAt && now <= term.regClosesAt) { windowStatus = "OPEN"; windowColor = "var(--green)" }
    else if (now <= term.dropClosesAt) { windowStatus = "DROP WINDOW"; windowColor = "#fbbf24" }
  }

  return (
    <div>
      <h1 style={{ fontSize: "20px", fontWeight: 510, color: "var(--text-primary)", marginBottom: "24px" }}>Dashboard</h1>

      {term && (
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "8px", padding: "20px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
          <div>
            <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "4px" }}>Active Term</div>
            <div style={{ fontSize: "16px", fontWeight: 510, color: "var(--text-primary)" }}>{term.label}</div>
          </div>
          <span style={{ fontSize: "12px", color: windowColor, border: `1px solid ${windowColor}`, borderRadius: "9999px", padding: "2px 10px", fontWeight: 510, marginLeft: "auto" }}>{windowStatus}</span>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "8px", padding: "16px" }}>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px" }}>Credit Hours</div>
          <div style={{ fontSize: "24px", fontWeight: 510, color: "var(--text-primary)" }}>{credits}<span style={{ fontSize: "14px", color: "var(--text-muted)" }}>/{MAX_CREDITS}</span></div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "8px", padding: "16px" }}>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px" }}>Enrolled</div>
          <div style={{ fontSize: "24px", fontWeight: 510, color: "var(--text-primary)" }}>{enrolled.length}</div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "8px", padding: "16px" }}>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px" }}>Waitlisted</div>
          <div style={{ fontSize: "24px", fontWeight: 510, color: waitlisted.length > 0 ? "#fbbf24" : "var(--text-primary)" }}>{waitlisted.length}</div>
        </div>
      </div>

      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "8px", padding: "16px 18px", marginBottom: "24px" }}>
        <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>How to use the student flow</div>
        <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
          Register from <strong>Browse Courses</strong>, request exceptions from the inline override link when a section is blocked, and drop active sections from <strong>My Schedule</strong> before the drop deadline.
        </div>
      </div>

      <div style={{ display: "flex", gap: "12px" }}>
        <Link href="/student/courses" style={{ background: "var(--accent)", color: "var(--text-primary)", borderRadius: "6px", padding: "8px 16px", textDecoration: "none", fontSize: "13px", fontWeight: 510 }}>Browse Courses</Link>
        <Link href="/student/schedule" style={{ background: "rgba(255,255,255,0.02)", color: "var(--text-secondary)", border: "1px solid var(--border)", borderRadius: "6px", padding: "8px 16px", textDecoration: "none", fontSize: "13px" }}>My Schedule</Link>
        <Link href="/student/transcript" style={{ background: "rgba(255,255,255,0.02)", color: "var(--text-secondary)", border: "1px solid var(--border)", borderRadius: "6px", padding: "8px 16px", textDecoration: "none", fontSize: "13px" }}>Transcript</Link>
      </div>
    </div>
  )
}
