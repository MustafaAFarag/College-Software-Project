"use client"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

type Log = { id: string; actorName: string; action: string; fromState: string | null; toState: string; courseCode: string | null; at: string }

const ACTION_COLORS: Record<string, string> = {
  ENROLL: "var(--green)",
  DROP: "#f87171",
  WAITLIST: "#fbbf24",
  PROMOTE: "var(--accent-bright)",
  OVERRIDE_APPROVE: "var(--green)",
  OVERRIDE_REJECT: "#f87171",
}

const ACTION_OPTIONS = ["", "ENROLL", "WAITLIST", "DROP", "PROMOTE", "OVERRIDE_APPROVE", "OVERRIDE_REJECT"]

export function AuditLogTable({
  logs,
  total,
  page,
  limit,
  students,
  sections,
  filters,
}: {
  logs: Log[]
  total: number
  page: number
  limit: number
  students: { id: string; label: string }[]
  sections: { id: string; label: string }[]
  filters: { studentId: string; sectionId: string; action: string; from: string; to: string }
}) {
  const router = useRouter()
  const sp = useSearchParams()
  const [studentId, setStudentId] = useState(filters.studentId)
  const [sectionId, setSectionId] = useState(filters.sectionId)
  const [action, setAction] = useState(filters.action)
  const [from, setFrom] = useState(filters.from)
  const [to, setTo] = useState(filters.to)

  function pushParams(nextPage: number) {
    const params = new URLSearchParams(sp.toString())
    if (studentId) params.set("studentId", studentId)
    else params.delete("studentId")
    if (sectionId) params.set("sectionId", sectionId)
    else params.delete("sectionId")
    if (action) params.set("action", action)
    else params.delete("action")
    if (from) params.set("from", from)
    else params.delete("from")
    if (to) params.set("to", to)
    else params.delete("to")
    params.set("page", String(nextPage))
    router.push(`?${params}`)
  }

  function goPage(p: number) {
    pushParams(p)
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div>
      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "8px", padding: "16px", marginBottom: "16px", display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: "12px", alignItems: "end" }}>
        <div>
          <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>Student</label>
          <select value={studentId} onChange={(e) => setStudentId(e.target.value)} style={{ width: "100%", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "6px", padding: "8px 10px", color: "var(--text-secondary)", fontSize: "13px" }}>
            <option value="">All students</option>
            {students.map((student) => <option key={student.id} value={student.id}>{student.label}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>Section</label>
          <select value={sectionId} onChange={(e) => setSectionId(e.target.value)} style={{ width: "100%", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "6px", padding: "8px 10px", color: "var(--text-secondary)", fontSize: "13px" }}>
            <option value="">All sections</option>
            {sections.map((section) => <option key={section.id} value={section.id}>{section.label}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>Action</label>
          <select value={action} onChange={(e) => setAction(e.target.value)} style={{ width: "100%", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "6px", padding: "8px 10px", color: "var(--text-secondary)", fontSize: "13px" }}>
            {ACTION_OPTIONS.map((value) => <option key={value || "all"} value={value}>{value || "All actions"}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>From</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} style={{ width: "100%", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "6px", padding: "8px 10px", color: "var(--text-secondary)", fontSize: "13px", boxSizing: "border-box" }} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>To</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} style={{ width: "100%", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "6px", padding: "8px 10px", color: "var(--text-secondary)", fontSize: "13px", boxSizing: "border-box" }} />
        </div>
        <div style={{ gridColumn: "1 / -1", display: "flex", gap: "8px" }}>
          <button onClick={() => pushParams(1)} style={{ background: "var(--accent)", color: "var(--text-primary)", border: "none", borderRadius: "6px", padding: "8px 14px", fontSize: "13px", fontWeight: 510, cursor: "pointer" }}>
            Apply Filters
          </button>
          <button
            onClick={() => {
              setStudentId("")
              setSectionId("")
              setAction("")
              setFrom("")
              setTo("")
              router.push("?page=1")
            }}
            style={{ background: "transparent", color: "var(--text-secondary)", border: "1px solid var(--border)", borderRadius: "6px", padding: "8px 14px", fontSize: "13px", cursor: "pointer" }}
          >
            Reset
          </button>
        </div>
      </div>

      <div style={{ background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: "8px", overflow: "hidden", marginBottom: "16px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {["Time", "Actor", "Action", "State Change", "Course"].map(h => (
                <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "12px", color: "var(--text-muted)", fontWeight: 510 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.map(l => (
              <tr key={l.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <td style={{ padding: "10px 16px", fontSize: "12px", color: "var(--text-muted)" }}>{new Date(l.at).toLocaleString()}</td>
                <td style={{ padding: "10px 16px", fontSize: "13px", color: "var(--text-secondary)" }}>{l.actorName}</td>
                <td style={{ padding: "10px 16px" }}>
                  <span style={{ fontSize: "11px", color: ACTION_COLORS[l.action] ?? "var(--text-muted)", border: "1px solid currentColor", borderRadius: "9999px", padding: "2px 8px", fontWeight: 510 }}>{l.action}</span>
                </td>
                <td style={{ padding: "10px 16px", fontSize: "12px", color: "var(--text-muted)" }}>
                  {l.fromState && <span>{l.fromState} → </span>}{l.toState}
                </td>
                <td style={{ padding: "10px 16px", fontSize: "13px", color: "var(--text-secondary)", fontWeight: l.courseCode ? 510 : 400 }}>{l.courseCode ?? "—"}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: "center", padding: "30px 16px", color: "var(--text-muted)", fontSize: "13px" }}>No logs</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button onClick={() => goPage(page - 1)} disabled={page === 1}
            style={{ background: "rgba(255,255,255,0.02)", color: "var(--text-secondary)", border: "1px solid var(--border)", borderRadius: "6px", padding: "6px 12px", fontSize: "13px", cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.4 : 1 }}>
            ← Prev
          </button>
          <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Page {page} / {totalPages}</span>
          <button onClick={() => goPage(page + 1)} disabled={page === totalPages}
            style={{ background: "rgba(255,255,255,0.02)", color: "var(--text-secondary)", border: "1px solid var(--border)", borderRadius: "6px", padding: "6px 12px", fontSize: "13px", cursor: page === totalPages ? "not-allowed" : "pointer", opacity: page === totalPages ? 0.4 : 1 }}>
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
