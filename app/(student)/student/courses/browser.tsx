"use client"
import { useState } from "react"
import Link from "next/link"
import { toast } from "react-toastify"
import { Spinner } from "@/components/Spinner"

type Section = {
  id: string
  courseCode: string
  courseTitle: string
  creditHours: number
  level: number
  departmentId: string
  departmentCode: string
  instructor: string | null
  groupLabel: string | null
  capacity: number
  enrolled: number
  scheduleJson: string
  prerequisites: { code: string; title: string }[]
}

type EnrollmentEntry = { state: string; id: string; waitlistPos: number | null }

interface Props {
  sections: Section[]
  departments: { id: string; code: string; name: string }[]
  enrollmentMap: Record<string, EnrollmentEntry>
}

export function CourseBrowser({ sections, departments, enrollmentMap: initialMap }: Props) {
  const [dept, setDept] = useState("")
  const [level, setLevel] = useState("")
  const [day, setDay] = useState("")
  const [availOnly, setAvailOnly] = useState(false)
  const [enrollmentMap, setEnrollmentMap] = useState(initialMap)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  const filtered = sections.filter(s => {
    if (dept && s.departmentId !== dept) return false
    if (level && s.level !== parseInt(level)) return false
    if (day) {
      try {
        const slots = JSON.parse(s.scheduleJson) as { day: string }[]
        if (!slots.some((slot) => slot.day === day)) return false
      } catch {
        return false
      }
    }
    if (availOnly && s.enrolled >= s.capacity) return false
    return true
  })

  async function enroll(sectionId: string) {
    setLoading(l => ({ ...l, [sectionId]: true }))
    setErrors(e => ({ ...e, [sectionId]: "" }))
    try {
      const res = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrors(e => ({ ...e, [sectionId]: data.error }))
      } else {
        setEnrollmentMap(m => ({ ...m, [sectionId]: { state: data.state, id: data.enrollmentId, waitlistPos: data.waitlistPos } }))
        if (data.state === "WAITLISTED") {
          toast.info(`Added to waitlist — position #${data.waitlistPos}`)
        } else {
          toast.success("Enrolled successfully!")
        }
      }
    } catch {
      toast.error("Network error — please try again")
    } finally {
      setLoading(l => ({ ...l, [sectionId]: false }))
    }
  }

  function formatSchedule(json: string) {
    try {
      const slots = JSON.parse(json) as { day: string; startTime: string; endTime: string; room: string }[]
      return slots.map(s => `${s.day} ${s.startTime}–${s.endTime} · ${s.room}`).join("  |  ")
    } catch { return json }
  }

  return (
    <div>
      <h1 style={{ fontSize: "20px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "20px" }}>Browse Courses</h1>

      {/* Filters */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
        <select value={dept} onChange={e => setDept(e.target.value)}
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", borderRadius: "6px", padding: "7px 10px", color: "var(--text-secondary)", fontSize: "13px", outline: "none" }}>
          <option value="">All Departments</option>
          {departments.map(d => <option key={d.id} value={d.id}>{d.code} — {d.name}</option>)}
        </select>
        <select value={level} onChange={e => setLevel(e.target.value)}
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", borderRadius: "6px", padding: "7px 10px", color: "var(--text-secondary)", fontSize: "13px", outline: "none" }}>
          <option value="">All Levels</option>
          {[100, 200, 300, 400].map(l => <option key={l} value={l}>{l}-level</option>)}
        </select>
        <select value={day} onChange={e => setDay(e.target.value)}
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", borderRadius: "6px", padding: "7px 10px", color: "var(--text-secondary)", fontSize: "13px", outline: "none" }}>
          <option value="">All Days</option>
          {[
            { value: "SUN", label: "Sunday" },
            { value: "MON", label: "Monday" },
            { value: "TUE", label: "Tuesday" },
            { value: "WED", label: "Wednesday" },
            { value: "THU", label: "Thursday" },
          ].map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
        </select>
        <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--text-secondary)", cursor: "pointer", userSelect: "none" }}>
          <input type="checkbox" checked={availOnly} onChange={e => setAvailOnly(e.target.checked)} />
          Available only
        </label>
        <span style={{ marginLeft: "auto", fontSize: "12px", color: "var(--text-muted)" }}>{filtered.length} section{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {filtered.map(s => {
          const enr = enrollmentMap[s.id]
          const isFull = s.enrolled >= s.capacity
          const err = errors[s.id]
          const isLoading = loading[s.id]

          return (
            <div
              key={s.id}
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                padding: "14px 16px",
                transition: "border-color 0.15s",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Course header */}
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "6px", flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "14px" }}>{s.courseCode}</span>
                    <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{s.courseTitle}</span>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", border: "1px solid var(--border)", borderRadius: "9999px", padding: "1px 7px" }}>{s.creditHours} cr</span>
                    {s.groupLabel && (
                      <span style={{ fontSize: "11px", color: "var(--accent-bright)", border: "1px solid var(--accent)", borderRadius: "9999px", padding: "1px 7px", fontWeight: 600 }}>{s.groupLabel}</span>
                    )}
                  </div>

                  {/* Instructor + schedule */}
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>
                    {s.instructor && <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>{s.instructor}</span>}
                    {s.instructor && <span style={{ margin: "0 6px", opacity: 0.4 }}>·</span>}
                    <span>{formatSchedule(s.scheduleJson)}</span>
                  </div>

                  {/* Seats */}
                  <div style={{ fontSize: "12px" }}>
                    <span style={{ color: isFull ? "#f87171" : s.enrolled / s.capacity > 0.8 ? "#fbbf24" : "var(--text-muted)" }}>
                      {s.enrolled}/{s.capacity} seats{isFull ? " — Full" : ""}
                    </span>
                    {!isFull && (
                      <span style={{ color: "var(--text-muted)", marginLeft: "6px" }}>({s.capacity - s.enrolled} available)</span>
                    )}
                  </div>

                  {/* Prerequisites */}
                  {s.prerequisites.length > 0 && (
                    <div style={{ display: "flex", gap: "4px", marginTop: "6px", flexWrap: "wrap" }}>
                      {s.prerequisites.map(p => (
                        <span key={p.code} title={p.title} style={{ fontSize: "11px", color: "var(--accent-bright)", border: "1px solid var(--accent)", borderRadius: "9999px", padding: "1px 7px" }}>
                          Req: {p.code}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action button */}
                <div style={{ flexShrink: 0, display: "flex", justifyContent: "flex-end", minWidth: 90 }}>
                  {enr ? (
                    <div>
                      {enr.state === "ENROLLED" && (
                        <span style={{ fontSize: "12px", color: "#34d399", fontWeight: 600 }}>Enrolled ✓</span>
                      )}
                      {enr.state === "WAITLISTED" && (
                        <span style={{ fontSize: "12px", color: "#fbbf24", fontWeight: 600 }}>Waitlist #{enr.waitlistPos}</span>
                      )}
                      {enr.state === "DROPPED" && (
                        <button
                          onClick={() => enroll(s.id)}
                          disabled={isLoading}
                          style={{ background: "var(--accent)", color: "var(--text-primary)", border: "none", borderRadius: "6px", padding: "7px 14px", fontSize: "12px", fontWeight: 600, cursor: isLoading ? "wait" : "pointer", display: "flex", alignItems: "center", gap: "6px", opacity: isLoading ? 0.7 : 1 }}
                        >
                          {isLoading ? <><Spinner size={12} color="white" /> Re-enrolling…</> : "Re-enroll"}
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => enroll(s.id)}
                      disabled={isLoading}
                      style={{ background: "var(--accent)", color: "var(--text-primary)", border: "none", borderRadius: "6px", padding: "7px 14px", fontSize: "12px", fontWeight: 600, cursor: isLoading ? "wait" : "pointer", display: "flex", alignItems: "center", gap: "6px", opacity: isLoading ? 0.7 : 1 }}
                    >
                      {isLoading ? <><Spinner size={12} color="white" /> Registering…</> : isFull ? "Join Waitlist" : "Register"}
                    </button>
                  )}
                </div>
              </div>

              {/* Inline error */}
              {err && (
                <div style={{ marginTop: "10px", fontSize: "12px", color: "#f87171", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "6px", padding: "8px 10px", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <span>{err}</span>
                  {(err.includes("prerequisite") || err.includes("Credit")) && (
                    <Link href={`/student/overrides?sectionId=${s.id}`} style={{ color: "var(--accent-bright)", textDecoration: "underline", fontWeight: 600, whiteSpace: "nowrap" }}>
                      Request Override →
                    </Link>
                  )}
                </div>
              )}
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "50px 40px", fontSize: "14px", background: "rgba(255,255,255,0.01)", border: "1px solid var(--border)", borderRadius: "8px" }}>
            No sections match your filters
          </div>
        )}
      </div>
    </div>
  )
}
