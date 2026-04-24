"use client"
import { useState } from "react"
import { toast } from "react-toastify"
import { Spinner } from "@/components/Spinner"

type Override = { id: string; studentName: string; courseCode: string; reason: string; createdAt: string }
type Decision = { status: "APPROVED" | "REJECTED"; pending: boolean }

export function OverrideInbox({ overrides: initial }: { overrides: Override[] }) {
  const [overrides] = useState(initial)
  const [decisions, setDecisions] = useState<Record<string, Decision>>({})
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  async function decide(id: string, status: "APPROVED" | "REJECTED") {
    setDecisions(d => ({ ...d, [id]: { status, pending: true } }))
    try {
      const res = await fetch(`/api/overrides/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        setDecisions(d => ({ ...d, [id]: { status, pending: false } }))
        toast.success(status === "APPROVED" ? "Override approved" : "Override rejected")
      } else {
        const data = await res.json().catch(() => ({}))
        setDecisions(d => { const n = { ...d }; delete n[id]; return n })
        toast.error(data.error ?? "Action failed")
      }
    } catch {
      setDecisions(d => { const n = { ...d }; delete n[id]; return n })
      toast.error("Network error")
    }
  }

  if (overrides.length === 0) {
    return (
      <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "60px 40px", fontSize: "15px", background: "rgba(255,255,255,0.01)", border: "1px solid var(--border)", borderRadius: "8px" }}>
        No pending override requests
      </div>
    )
  }

  return (
    <div style={{ background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: "8px", overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            <th style={{ padding: "10px 16px", textAlign: "left", fontSize: "12px", color: "var(--text-muted)", fontWeight: 510 }}>Student</th>
            <th style={{ padding: "10px 16px", textAlign: "left", fontSize: "12px", color: "var(--text-muted)", fontWeight: 510 }}>Course</th>
            <th style={{ padding: "10px 16px", textAlign: "left", fontSize: "12px", color: "var(--text-muted)", fontWeight: 510 }}>Reason</th>
            <th style={{ padding: "10px 16px", textAlign: "right", fontSize: "12px", color: "var(--text-muted)", fontWeight: 510 }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {overrides.map(o => {
            const d = decisions[o.id]
            const isExpanded = expanded[o.id]
            return (
              <tr key={o.id} style={{ borderBottom: "1px solid var(--border-subtle)", opacity: d?.pending ? 0.6 : 1, transition: "opacity 0.2s" }}>
                <td style={{ padding: "10px 16px", fontSize: "13px", color: "var(--text-primary)" }}>{o.studentName}</td>
                <td style={{ padding: "10px 16px", fontSize: "13px", color: "var(--text-primary)", fontWeight: 600 }}>{o.courseCode}</td>
                <td style={{ padding: "10px 16px", fontSize: "13px", color: "var(--text-secondary)", maxWidth: "300px" }}>
                  {isExpanded ? o.reason : o.reason.slice(0, 80)}
                  {o.reason.length > 80 && (
                    <button onClick={() => setExpanded(ex => ({ ...ex, [o.id]: !isExpanded }))}
                      style={{ marginLeft: "4px", color: "var(--accent-bright)", background: "transparent", border: "none", cursor: "pointer", fontSize: "12px" }}>
                      {isExpanded ? "less" : "more"}
                    </button>
                  )}
                </td>
                <td style={{ padding: "10px 16px", textAlign: "right" }}>
                  {d && !d.pending ? (
                    <span style={{ fontSize: "11px", color: d.status === "APPROVED" ? "#34d399" : "#f87171", border: "1px solid currentColor", borderRadius: "9999px", padding: "2px 8px", fontWeight: 600 }}>
                      {d.status}
                    </span>
                  ) : (
                    <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                      <button
                        onClick={() => decide(o.id, "APPROVED")}
                        disabled={d?.pending}
                        style={{ background: "#10b981", color: "white", border: "none", borderRadius: "6px", padding: "5px 12px", fontSize: "12px", fontWeight: 600, cursor: d?.pending ? "wait" : "pointer", display: "flex", alignItems: "center", gap: "5px", opacity: d?.pending ? 0.7 : 1 }}
                      >
                        {d?.pending && d.status === "APPROVED" ? <><Spinner size={11} color="white" /> Approving…</> : "Approve"}
                      </button>
                      <button
                        onClick={() => decide(o.id, "REJECTED")}
                        disabled={d?.pending}
                        style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.4)", borderRadius: "6px", padding: "5px 12px", fontSize: "12px", fontWeight: 600, cursor: d?.pending ? "wait" : "pointer", display: "flex", alignItems: "center", gap: "5px", opacity: d?.pending ? 0.7 : 1 }}
                      >
                        {d?.pending && d.status === "REJECTED" ? <><Spinner size={11} color="#f87171" /> Rejecting…</> : "Reject"}
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
