"use client"
import { useMemo, useState, type CSSProperties } from "react"
import { toast } from "react-toastify"
import { Spinner } from "@/components/Spinner"

type Term = {
  id: string
  code: string
  label: string
  isActive: boolean
  startDate: string
  endDate: string
  regOpensAt: string
  regClosesAt: string
  dropClosesAt: string
}

type TermForm = {
  code: string
  label: string
  startDate: string
  endDate: string
  regOpensAt: string
  regClosesAt: string
  dropClosesAt: string
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString()
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString()
}

function toDateInput(iso: string) {
  return iso.slice(0, 10)
}

function toDateTimeInput(iso: string) {
  const date = new Date(iso)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function emptyForm(): TermForm {
  const now = new Date()
  const nextMonth = new Date(now)
  nextMonth.setMonth(now.getMonth() + 4)

  return {
    code: "",
    label: "",
    startDate: toDateInput(now.toISOString()),
    endDate: toDateInput(nextMonth.toISOString()),
    regOpensAt: toDateTimeInput(now.toISOString()),
    regClosesAt: toDateTimeInput(nextMonth.toISOString()),
    dropClosesAt: toDateTimeInput(nextMonth.toISOString()),
  }
}

function termToForm(term: Term): TermForm {
  return {
    code: term.code,
    label: term.label,
    startDate: toDateInput(term.startDate),
    endDate: toDateInput(term.endDate),
    regOpensAt: toDateTimeInput(term.regOpensAt),
    regClosesAt: toDateTimeInput(term.regClosesAt),
    dropClosesAt: toDateTimeInput(term.dropClosesAt),
  }
}

function serialize(form: TermForm) {
  return {
    code: form.code,
    label: form.label,
    startDate: new Date(form.startDate).toISOString(),
    endDate: new Date(form.endDate).toISOString(),
    regOpensAt: new Date(form.regOpensAt).toISOString(),
    regClosesAt: new Date(form.regClosesAt).toISOString(),
    dropClosesAt: new Date(form.dropClosesAt).toISOString(),
  }
}

export function TermsClient({ terms: initial }: { terms: Term[] }) {
  const [terms, setTerms] = useState(initial)
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState<TermForm>(emptyForm())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<TermForm>(emptyForm())
  const [saving, setSaving] = useState<"create" | string | null>(null)
  const [activating, setActivating] = useState<string | null>(null)
  const [confirmActivate, setConfirmActivate] = useState<string | null>(null)

  const sortedTerms = useMemo(
    () => [...terms].sort((a, b) => +new Date(b.startDate) - +new Date(a.startDate)),
    [terms]
  )

  async function activate(id: string) {
    setConfirmActivate(null)
    setActivating(id)
    try {
      const res = await fetch(`/api/admin/terms/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: true }),
      })
      if (!res.ok) throw new Error("Failed to activate term")
      const updated = await res.json()
      setTerms((current) => current.map((term) => ({ ...term, isActive: term.id === id, ...(term.id === id ? {
        code: updated.code,
        label: updated.label,
        startDate: updated.startDate,
        endDate: updated.endDate,
        regOpensAt: updated.regOpensAt,
        regClosesAt: updated.regClosesAt,
        dropClosesAt: updated.dropClosesAt,
      } : {}) })))
      toast.success("Term activated")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Network error")
    } finally {
      setActivating(null)
    }
  }

  async function createTerm(e: React.FormEvent) {
    e.preventDefault()
    setSaving("create")
    try {
      const res = await fetch("/api/admin/terms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(serialize(createForm)),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to create term")
      setTerms((current) => [{ ...data }, ...current])
      setCreateForm(emptyForm())
      setShowCreate(false)
      toast.success("Term created")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Network error")
    } finally {
      setSaving(null)
    }
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingId) return
    setSaving(editingId)
    try {
      const res = await fetch(`/api/admin/terms/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(serialize(editForm)),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to update term")
      setTerms((current) => current.map((term) => term.id === editingId ? { ...term, ...data } : term))
      setEditingId(null)
      toast.success("Term updated")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Network error")
    } finally {
      setSaving(null)
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <button
          onClick={() => {
            setShowCreate((value) => !value)
            setCreateForm(emptyForm())
          }}
          style={{ background: "var(--accent)", color: "var(--text-primary)", border: "none", borderRadius: "6px", padding: "8px 16px", fontSize: "13px", fontWeight: 510, cursor: "pointer" }}
        >
          {showCreate ? "Close Form" : "+ New Term"}
        </button>
      </div>

      {showCreate && (
        <form onSubmit={createTerm} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "8px", padding: "20px", marginBottom: "20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "12px", marginBottom: "12px" }}>
            <label style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              Code
              <input value={createForm.code} onChange={(e) => setCreateForm((form) => ({ ...form, code: e.target.value }))} required style={inputStyle} />
            </label>
            <label style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              Label
              <input value={createForm.label} onChange={(e) => setCreateForm((form) => ({ ...form, label: e.target.value }))} required style={inputStyle} />
            </label>
            <label style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              Start Date
              <input type="date" value={createForm.startDate} onChange={(e) => setCreateForm((form) => ({ ...form, startDate: e.target.value }))} required style={inputStyle} />
            </label>
            <label style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              End Date
              <input type="date" value={createForm.endDate} onChange={(e) => setCreateForm((form) => ({ ...form, endDate: e.target.value }))} required style={inputStyle} />
            </label>
            <label style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              Registration Opens
              <input type="datetime-local" value={createForm.regOpensAt} onChange={(e) => setCreateForm((form) => ({ ...form, regOpensAt: e.target.value }))} required style={inputStyle} />
            </label>
            <label style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              Registration Closes
              <input type="datetime-local" value={createForm.regClosesAt} onChange={(e) => setCreateForm((form) => ({ ...form, regClosesAt: e.target.value }))} required style={inputStyle} />
            </label>
            <label style={{ fontSize: "12px", color: "var(--text-muted)", gridColumn: "1 / -1" }}>
              Drop Closes
              <input type="datetime-local" value={createForm.dropClosesAt} onChange={(e) => setCreateForm((form) => ({ ...form, dropClosesAt: e.target.value }))} required style={inputStyle} />
            </label>
          </div>
          <button type="submit" disabled={saving === "create"} style={primaryButton}>
            {saving === "create" ? <><Spinner size={12} color="white" /> Creating...</> : "Create Term"}
          </button>
        </form>
      )}

      {editingId && (
        <form onSubmit={saveEdit} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "8px", padding: "20px", marginBottom: "20px" }}>
          <div style={{ fontSize: "14px", color: "var(--text-primary)", fontWeight: 510, marginBottom: "12px" }}>Edit Term</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "12px", marginBottom: "12px" }}>
            <label style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              Code
              <input value={editForm.code} onChange={(e) => setEditForm((form) => ({ ...form, code: e.target.value }))} required style={inputStyle} />
            </label>
            <label style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              Label
              <input value={editForm.label} onChange={(e) => setEditForm((form) => ({ ...form, label: e.target.value }))} required style={inputStyle} />
            </label>
            <label style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              Start Date
              <input type="date" value={editForm.startDate} onChange={(e) => setEditForm((form) => ({ ...form, startDate: e.target.value }))} required style={inputStyle} />
            </label>
            <label style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              End Date
              <input type="date" value={editForm.endDate} onChange={(e) => setEditForm((form) => ({ ...form, endDate: e.target.value }))} required style={inputStyle} />
            </label>
            <label style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              Registration Opens
              <input type="datetime-local" value={editForm.regOpensAt} onChange={(e) => setEditForm((form) => ({ ...form, regOpensAt: e.target.value }))} required style={inputStyle} />
            </label>
            <label style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              Registration Closes
              <input type="datetime-local" value={editForm.regClosesAt} onChange={(e) => setEditForm((form) => ({ ...form, regClosesAt: e.target.value }))} required style={inputStyle} />
            </label>
            <label style={{ fontSize: "12px", color: "var(--text-muted)", gridColumn: "1 / -1" }}>
              Drop Closes
              <input type="datetime-local" value={editForm.dropClosesAt} onChange={(e) => setEditForm((form) => ({ ...form, dropClosesAt: e.target.value }))} required style={inputStyle} />
            </label>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button type="submit" disabled={saving === editingId} style={primaryButton}>
              {saving === editingId ? <><Spinner size={12} color="white" /> Saving...</> : "Save Changes"}
            </button>
            <button type="button" onClick={() => setEditingId(null)} style={secondaryButton}>Cancel</button>
          </div>
        </form>
      )}

      <div style={{ background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: "8px", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {["Code", "Label", "Dates", "Registration Window", "Drop Closes", "Status", ""].map((heading) => (
                <th key={heading} style={{ padding: "10px 16px", textAlign: "left", fontSize: "12px", color: "var(--text-muted)", fontWeight: 510 }}>{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedTerms.map((term) => (
              <tr key={term.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <td style={{ padding: "10px 16px", fontSize: "13px", color: "var(--text-primary)", fontWeight: 510 }}>{term.code}</td>
                <td style={{ padding: "10px 16px", fontSize: "13px", color: "var(--text-secondary)" }}>{term.label}</td>
                <td style={{ padding: "10px 16px", fontSize: "12px", color: "var(--text-muted)" }}>
                  {fmtDate(term.startDate)} - {fmtDate(term.endDate)}
                </td>
                <td style={{ padding: "10px 16px", fontSize: "12px", color: "var(--text-muted)" }}>
                  {fmtDateTime(term.regOpensAt)} - {fmtDateTime(term.regClosesAt)}
                </td>
                <td style={{ padding: "10px 16px", fontSize: "12px", color: "var(--text-muted)" }}>{fmtDateTime(term.dropClosesAt)}</td>
                <td style={{ padding: "10px 16px" }}>
                  {term.isActive
                    ? <span style={{ fontSize: "11px", color: "var(--green)", border: "1px solid var(--green)", borderRadius: "9999px", padding: "2px 8px", fontWeight: 510 }}>Active</span>
                    : <span style={{ fontSize: "11px", color: "var(--text-muted)", border: "1px solid var(--border)", borderRadius: "9999px", padding: "2px 8px" }}>Inactive</span>
                  }
                </td>
                <td style={{ padding: "10px 16px", textAlign: "right" }}>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                    <button
                      onClick={() => {
                        setEditingId(term.id)
                        setEditForm(termToForm(term))
                      }}
                      style={secondaryButton}
                    >
                      Edit
                    </button>
                    {!term.isActive && (
                      confirmActivate === term.id ? (
                        <>
                          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Deactivates all others.</span>
                          <button onClick={() => activate(term.id)} disabled={activating === term.id} style={{ ...primaryButton, background: "#ef4444" }}>
                            {activating === term.id ? <><Spinner size={11} color="white" /> Activating...</> : "Confirm"}
                          </button>
                          <button onClick={() => setConfirmActivate(null)} style={secondaryButton}>Cancel</button>
                        </>
                      ) : (
                        <button onClick={() => setConfirmActivate(term.id)} style={primaryButton}>
                          Set Active
                        </button>
                      )
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const inputStyle: CSSProperties = {
  width: "100%",
  marginTop: "4px",
  background: "rgba(255,255,255,0.02)",
  border: "1px solid var(--border)",
  borderRadius: "6px",
  padding: "8px 10px",
  color: "var(--text-secondary)",
  fontSize: "13px",
  boxSizing: "border-box",
}

const primaryButton: CSSProperties = {
  background: "var(--accent)",
  color: "var(--text-primary)",
  border: "none",
  borderRadius: "6px",
  padding: "8px 14px",
  fontSize: "13px",
  fontWeight: 510,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
}

const secondaryButton: CSSProperties = {
  background: "transparent",
  color: "var(--text-secondary)",
  border: "1px solid var(--border)",
  borderRadius: "6px",
  padding: "8px 14px",
  fontSize: "13px",
  cursor: "pointer",
}
