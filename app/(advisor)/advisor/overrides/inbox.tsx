"use client"
import { useState } from "react"
import { toast } from "react-toastify"
import { Spinner } from "@/components/Spinner"

type Override = { id: string; studentName: string; courseCode: string; reason: string; createdAt: string }

export function OverrideInbox({ overrides: initial }: { overrides: Override[] }) {
  const [overrides, setOverrides] = useState(initial)
  const [pending, setPending] = useState<Record<string, "APPROVED" | "REJECTED">>({})
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  async function decide(id: string, status: "APPROVED" | "REJECTED") {
    setPending(p => ({ ...p, [id]: status }))
    try {
      const res = await fetch(`/api/overrides/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        setOverrides(ov => ov.filter(o => o.id !== id))
        setPending(p => { const n = { ...p }; delete n[id]; return n })
        toast.success(status === "APPROVED" ? "Override approved" : "Override rejected")
      } else {
        const data = await res.json().catch(() => ({}))
        setPending(p => { const n = { ...p }; delete n[id]; return n })
        toast.error(data.error ?? "Action failed")
      }
    } catch {
      setPending(p => { const n = { ...p }; delete n[id]; return n })
      toast.error("Network error")
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: "20px", fontWeight: 510, color: "var(--text-primary)", marginBottom: "24px" }}>Override Requests</h1>

      {overrides.length === 0 ? (
        <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "60px 40px", fontSize: "13px", background: "rgba(255,255,255,0.01)", border: "1px solid var(--border)", borderRadius: "8px" }}>
          No pending override requests
        </div>
      ) : (
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
                const isPending = !!pending[o.id]
                const isExpanded = expanded[o.id]
                return (
                  <tr key={o.id} style={{ borderBottom: "1px solid var(--border-subtle)", opacity: isPending ? 0.6 : 1, transition: "opacity 0.2s" }}>
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
                      <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                        <button
                          onClick={() => decide(o.id, "APPROVED")}
                          disabled={isPending}
                          style={{ background: "#10b981", color: "white", border: "none", borderRadius: "6px", padding: "5px 12px", fontSize: "12px", fontWeight: 600, cursor: isPending ? "wait" : "pointer", display: "flex", alignItems: "center", gap: "5px", opacity: isPending ? 0.7 : 1 }}
                        >
                          {isPending && pending[o.id] === "APPROVED" ? <><Spinner size={11} color="white" /> Approving…</> : "Approve"}
                        </button>
                        <button
                          onClick={() => decide(o.id, "REJECTED")}
                          disabled={isPending}
                          style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.4)", borderRadius: "6px", padding: "5px 12px", fontSize: "12px", fontWeight: 600, cursor: isPending ? "wait" : "pointer", display: "flex", alignItems: "center", gap: "5px", opacity: isPending ? 0.7 : 1 }}
                        >
                          {isPending && pending[o.id] === "REJECTED" ? <><Spinner size={11} color="#f87171" /> Rejecting…</> : "Reject"}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
