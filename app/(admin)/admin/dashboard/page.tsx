import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"

const ACTION_LABELS: Record<string, string> = {
  ENROLL: "registered",
  WAITLIST: "joined the waitlist",
  DROP: "dropped a section",
  PROMOTE: "was promoted from the waitlist",
  OVERRIDE_APPROVE: "approved an override",
  OVERRIDE_REJECT: "rejected an override",
}

export default async function AdminDashboard() {
  const session = await auth()
  if (!session) redirect("/login")

  const term = await db.term.findFirst({ where: { isActive: true } })

  const [students, sections, activeEnrollments, waitlisted, pendingOverrides, recentLogs] = await Promise.all([
    db.user.count({ where: { role: "STUDENT" } }),
    db.section.count({ where: { termId: term?.id } }),
    db.enrollment.count({ where: { state: "ENROLLED", section: { termId: term?.id } } }),
    db.enrollment.count({ where: { state: "WAITLISTED", section: { termId: term?.id } } }),
    db.overrideRequest.count({ where: { status: "PENDING" } }),
    db.auditLog.findMany({
      orderBy: { at: "desc" },
      include: {
        actor: true,
        enrollment: { include: { section: { include: { course: true } } } },
      },
      take: 6,
    }),
  ])

  const stats = [
    { label: "Students", value: students },
    { label: "Active Sections", value: sections },
    { label: "Active Enrollments", value: activeEnrollments },
    { label: "Waitlisted", value: waitlisted },
    { label: "Pending Overrides", value: pendingOverrides },
  ]

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", alignItems: "flex-start", marginBottom: "24px", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 510, color: "var(--text-primary)", marginBottom: "8px" }}>Admin Dashboard</h1>
          <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            {term ? `${term.label} is active. Use these numbers to confirm live enrollments, waitlists, and override decisions during the demo.` : "No active term is configured."}
          </div>
        </div>
        {term && (
          <div style={{ fontSize: "12px", color: "var(--accent-bright)", border: "1px solid var(--accent)", borderRadius: "9999px", padding: "4px 10px", fontWeight: 600 }}>
            {term.label}
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "16px", marginBottom: "24px" }}>
        {stats.map((stat) => (
          <div key={stat.label} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "8px", padding: "20px" }}>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px" }}>{stat.label}</div>
            <div style={{ fontSize: "24px", fontWeight: 510, color: "var(--text-primary)" }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div style={{ background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: "8px", overflow: "hidden" }}>
        <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--border-subtle)" }}>
          <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px" }}>Recent Activity</div>
          <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Refresh after each role action to verify the connected workflow.</div>
        </div>

        {recentLogs.length === 0 ? (
          <div style={{ padding: "28px 18px", color: "var(--text-muted)", fontSize: "13px" }}>No activity recorded yet.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {recentLogs.map((log) => {
              const courseCode = log.enrollment?.section.course.code
              const actionLabel = ACTION_LABELS[log.action] ?? log.action.toLowerCase().replaceAll("_", " ")
              return (
                <div key={log.id} style={{ padding: "14px 18px", borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: "13px", color: "var(--text-primary)" }}>
                      <strong>{log.actor.name}</strong> {actionLabel}
                      {courseCode ? <span> for <strong>{courseCode}</strong></span> : null}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "3px" }}>
                      {log.fromState ? `${log.fromState} → ${log.toState}` : log.toState}
                    </div>
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                    {new Date(log.at).toLocaleString()}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
