import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"

function formatSchedule(json: string) {
  try {
    const slots = JSON.parse(json) as { day: string; startTime: string; endTime: string; room: string }[]
    return slots.map((slot) => `${slot.day} ${slot.startTime}-${slot.endTime}${slot.room ? ` · ${slot.room}` : ""}`).join(", ")
  } catch {
    return json
  }
}

export default async function InstructorRosterPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const activeTerm = await db.term.findFirst({ where: { isActive: true } })
  const sections = await db.section.findMany({
    where: { instructorId: session.user.id, termId: activeTerm?.id },
    include: {
      course: true,
      term: true,
      enrollments: {
        where: { state: "ENROLLED" },
        include: { student: true },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: [{ term: { startDate: "desc" } }, { course: { code: "asc" } }],
    take: 50,
  })

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", alignItems: "flex-start", marginBottom: "24px", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 510, color: "var(--text-primary)", marginBottom: "8px" }}>Section Roster</h1>
          <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            {activeTerm ? `Showing only ${activeTerm.label} so roster changes are obvious during the live demo.` : "No active term is configured."}
          </div>
        </div>
        {activeTerm && (
          <div style={{ fontSize: "12px", color: "var(--accent-bright)", border: "1px solid var(--accent)", borderRadius: "9999px", padding: "4px 10px", fontWeight: 600 }}>
            {activeTerm.label}
          </div>
        )}
      </div>

      {sections.length === 0 ? (
        <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "48px 40px", fontSize: "14px", background: "rgba(255,255,255,0.01)", border: "1px solid var(--border)", borderRadius: "8px" }}>
          No sections are currently assigned to this instructor.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {sections.map((section) => (
            <div key={section.id} style={{ background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: "8px", overflow: "hidden" }}>
              <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--border-subtle)" }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center", marginBottom: "6px" }}>
                  <span style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)" }}>{section.course.code}</span>
                  <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{section.course.title}</span>
                  {section.groupLabel && (
                    <span style={{ fontSize: "11px", color: "var(--accent-bright)", border: "1px solid var(--accent)", borderRadius: "9999px", padding: "1px 7px", fontWeight: 600 }}>
                      {section.groupLabel}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  {section.term.label} · {formatSchedule(section.scheduleJson)} · {section.enrollments.length}/{section.capacity} enrolled
                </div>
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {["Student", "Email", "Student ID", "Department"].map((heading) => (
                      <th key={heading} style={{ padding: "10px 16px", textAlign: "left", fontSize: "12px", color: "var(--text-muted)", fontWeight: 510 }}>{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {section.enrollments.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ padding: "24px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                        No enrolled students yet
                      </td>
                    </tr>
                  ) : (
                    section.enrollments.map((enrollment) => (
                      <tr key={enrollment.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                        <td style={{ padding: "10px 16px", fontSize: "13px", color: "var(--text-primary)" }}>{enrollment.student.name}</td>
                        <td style={{ padding: "10px 16px", fontSize: "13px", color: "var(--text-secondary)" }}>{enrollment.student.email}</td>
                        <td style={{ padding: "10px 16px", fontSize: "13px", color: "var(--text-secondary)" }}>{enrollment.student.studentId ?? "—"}</td>
                        <td style={{ padding: "10px 16px", fontSize: "13px", color: "var(--text-secondary)" }}>{enrollment.student.department ?? "—"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
