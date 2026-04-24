"use client"
import { useState } from "react"
import { toast } from "react-toastify"
import { Spinner } from "@/components/Spinner"

type Override = { id: string; sectionId: string; courseCode: string; reason: string; status: string; createdAt: string }
type SectionOption = { id: string; label: string }

const STATUS_COLORS: Record<string, string> = { PENDING: "#fbbf24", APPROVED: "#10b981", REJECTED: "#f87171" }

export function OverridesClient({ overrides: initial, sections, prefillSectionId }: {
  overrides: Override[]
  sections: SectionOption[]
  prefillSectionId: string | null
}) {
  const [overrides, setOverrides] = useState(initial)
  const [sectionId, setSectionId] = useState(prefillSectionId ?? "")
  const [reason, setReason] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState("")

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!sectionId) return
    setSubmitting(true)
    setMsg("")
    try {
      const res = await fetch("/api/overrides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionId, reason }),
      })
      const data = await res.json()
      if (!res.ok) {
        setMsg(data.error)
        toast.error(data.error)
      } else {
        const sec = sections.find(s => s.id === data.sectionId)
        setOverrides(ov => [{ id: data.id, sectionId: data.sectionId, courseCode: sec?.label.split(" ")[0] ?? "", reason: data.reason, status: data.status, createdAt: data.createdAt }, ...ov])
        setReason("")
        setMsg("")
        toast.success("Override request submitted!")
      }
    } catch {
      toast.error("Network error — please try again")
    } finally { setSubmitting(false) }
  }

  return (
    <div>
      <h1 style={{ fontSize: "20px", fontWeight: 510, color: "var(--text-primary)", marginBottom: "24px" }}>Override Requests</h1>

      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "8px", padding: "20px", marginBottom: "24px" }}>
        <h2 style={{ fontSize: "14px", fontWeight: 510, color: "var(--text-secondary)", marginBottom: "16px" }}>Submit Request</h2>
        <form onSubmit={submit}>
          <div style={{ marginBottom: "12px" }}>
            <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>Section</label>
            <select value={sectionId} onChange={e => setSectionId(e.target.value)} required
              style={{ width: "100%", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "6px", padding: "8px 10px", color: "var(--text-secondary)", fontSize: "13px" }}>
              <option value="">Select a section</option>
              {sections.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: "12px" }}>
            <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>Reason ({reason.length}/500 — min 20)</label>
            <textarea value={reason} onChange={e => setReason(e.target.value)} required minLength={20} maxLength={500} rows={4}
              style={{ width: "100%", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "6px", padding: "8px 10px", color: "var(--text-secondary)", fontSize: "13px", resize: "vertical", boxSizing: "border-box" }} />
          </div>
          {msg && <p style={{ fontSize: "13px", color: msg.includes("!") ? "var(--green)" : "#f87171", marginBottom: "8px" }}>{msg}</p>}
          <button type="submit" disabled={submitting}
            style={{ background: "var(--accent)", color: "var(--text-primary)", border: "none", borderRadius: "6px", padding: "8px 16px", fontSize: "13px", fontWeight: 510, cursor: submitting ? "wait" : "pointer", opacity: submitting ? 0.7 : 1, display: "inline-flex", alignItems: "center", gap: "6px" }}>
            {submitting ? <><Spinner size={13} color="white" /> Submitting…</> : "Submit Request"}
          </button>
        </form>
      </div>

      {overrides.length > 0 && (
        <div style={{ background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: "8px", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th style={{ padding: "10px 16px", textAlign: "left", fontSize: "12px", color: "var(--text-muted)", fontWeight: 510 }}>Course</th>
                <th style={{ padding: "10px 16px", textAlign: "left", fontSize: "12px", color: "var(--text-muted)", fontWeight: 510 }}>Reason</th>
                <th style={{ padding: "10px 16px", textAlign: "right", fontSize: "12px", color: "var(--text-muted)", fontWeight: 510 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {overrides.map(o => (
                <tr key={o.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "10px 16px", fontSize: "13px", color: "var(--text-primary)", fontWeight: 510 }}>{o.courseCode}</td>
                  <td style={{ padding: "10px 16px", fontSize: "13px", color: "var(--text-secondary)" }}>{o.reason.slice(0, 80)}{o.reason.length > 80 ? "..." : ""}</td>
                  <td style={{ padding: "10px 16px", textAlign: "right" }}>
                    <span style={{ fontSize: "11px", color: STATUS_COLORS[o.status] ?? "var(--text-muted)", border: "1px solid currentColor", borderRadius: "9999px", padding: "2px 8px", fontWeight: 510 }}>{o.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
