"use client"
import React, { useState } from "react"
import { toast } from "react-toastify"

type Enrollment = {
  id: string
  courseCode: string
  courseTitle: string
  instructor: string | null
  groupLabel: string | null
  state: "ENROLLED" | "WAITLISTED"
  scheduleJson: string
}

const DAYS = ["SUN", "MON", "TUE", "WED", "THU"]
const DAY_LABELS: Record<string, string> = { SUN: "Sunday", MON: "Monday", TUE: "Tuesday", WED: "Wednesday", THU: "Thursday" }

const SLOT_COUNT = 20
const SLOT_HEIGHT = 48
const ROW_HEIGHT_PX = SLOT_HEIGHT

const PALETTES = [
  { bg: "#5e6ad2", light: "rgba(94,106,210,0.18)" },
  { bg: "#7170ff", light: "rgba(113,112,255,0.18)" },
  { bg: "#34d399", light: "rgba(52,211,153,0.18)" },
  { bg: "#60a5fa", light: "rgba(96,165,250,0.18)" },
  { bg: "#f472b6", light: "rgba(244,114,182,0.18)" },
  { bg: "#fbbf24", light: "rgba(251,191,36,0.18)" },
]

function hashPalette(code: string) {
  let n = 0
  for (const c of code) n += c.charCodeAt(0)
  return PALETTES[n % PALETTES.length]
}

function timeToSlot(t: string): number {
  const [h, m] = t.split(":").map(Number)
  return (h - 8) * 2 + Math.floor(m / 30)
}

function slotToLabel(slot: number): string {
  const totalMins = 8 * 60 + slot * 30
  const h = Math.floor(totalMins / 60)
  const m = totalMins % 60
  const ampm = h >= 12 ? "PM" : "AM"
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`
}

function Spinner({ size = 14, color = "white" }: { size?: number; color?: string }) {
  return (
    <span style={{
      display: "inline-block", width: size, height: size,
      border: `2px solid ${color}40`, borderTopColor: color,
      borderRadius: "50%", animation: "schedSpin 0.7s linear infinite",
      flexShrink: 0,
    }} />
  )
}

export function ScheduleGrid({ enrollments, dropClosesAt }: { enrollments: Enrollment[]; dropClosesAt: string | null }) {
  const [dropping, setDropping] = useState<string | null>(null)
  const [confirm, setConfirm] = useState<string | null>(null)
  const [dropped, setDropped] = useState<Set<string>>(new Set())

  const canDrop = dropClosesAt ? new Date() < new Date(dropClosesAt) : false
  const active = enrollments.filter(e => !dropped.has(e.id))
  const confirmEnrollment = confirm ? active.find(e => e.id === confirm) : null

  async function doDrop(enrollmentId: string) {
    setDropping(enrollmentId)
    try {
      const res = await fetch(`/api/enrollments/${enrollmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "DROP" }),
      })
      if (res.ok) {
        setDropped(d => new Set([...d, enrollmentId]))
        setConfirm(null)
        toast.success("Course dropped successfully")
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error ?? "Failed to drop course")
      }
    } catch {
      toast.error("Network error — please try again")
    } finally {
      setDropping(null)
    }
  }

  return (
    <div>
      <style>{`
        @keyframes schedSpin { to { transform: rotate(360deg); } }
        @keyframes schedFadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .sched-block { transition: transform 0.15s ease, box-shadow 0.15s ease; }
        .sched-block:hover { transform: scale(1.02); box-shadow: 0 4px 16px rgba(0,0,0,0.4); z-index: 2; }
        .drop-btn { opacity: 0; transition: opacity 0.15s; }
        .sched-block:hover .drop-btn { opacity: 1; }
      `}</style>

      {/* Drop confirm modal */}
      {confirm && confirmEnrollment && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, animation: "schedFadeIn 0.15s ease" }}
          onClick={e => { if (e.target === e.currentTarget) setConfirm(null) }}
        >
          <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "12px", padding: "24px", maxWidth: "360px", width: "100%", margin: "0 16px" }}>
            <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "8px" }}>Drop Course?</div>
            <div style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "4px" }}>
              <strong>{confirmEnrollment.courseCode}</strong> — {confirmEnrollment.courseTitle}
            </div>
            {confirmEnrollment.groupLabel && (
              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>Group {confirmEnrollment.groupLabel}</div>
            )}
            {confirmEnrollment.instructor && (
              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "12px" }}>{confirmEnrollment.instructor}</div>
            )}
            <div style={{ fontSize: "12px", color: "#f87171", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "6px", padding: "8px 10px", marginBottom: "20px" }}>
              This cannot be undone after the drop window closes.
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => doDrop(confirm)}
                disabled={!!dropping}
                style={{ flex: 1, background: "#ef4444", color: "white", border: "none", borderRadius: "8px", padding: "10px", fontSize: "13px", fontWeight: 600, cursor: dropping ? "wait" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", opacity: dropping ? 0.8 : 1 }}
              >
                {dropping === confirm ? <><Spinner size={13} color="white" /> Dropping…</> : "Confirm Drop"}
              </button>
              <button
                onClick={() => setConfirm(null)}
                style={{ flex: 1, background: "rgba(255,255,255,0.05)", color: "var(--text-secondary)", border: "1px solid var(--border)", borderRadius: "8px", padding: "10px", fontSize: "13px", cursor: "pointer" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {active.length === 0 ? (
        <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "60px 40px", fontSize: "14px", background: "rgba(255,255,255,0.01)", border: "1px solid var(--border)", borderRadius: "8px" }}>
          No enrolled sections this term
        </div>
      ) : (
        <>
          <div style={{ overflowX: "auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: `68px repeat(5, minmax(130px, 1fr))`, minWidth: "740px" }}>

              {/* Header */}
              <div style={{ background: "var(--bg-page)" }} />
              {DAYS.map(d => (
                <div key={d} style={{
                  textAlign: "center", padding: "10px 4px", fontSize: "11px", fontWeight: 600,
                  color: "var(--text-muted)", borderBottom: "2px solid var(--border)",
                  letterSpacing: "0.08em", textTransform: "uppercase",
                }}>
                  {DAY_LABELS[d]}
                </div>
              ))}

              {Array.from({ length: SLOT_COUNT }, (_, row) => {
                const isHour = row % 2 === 0
                return (
                  <React.Fragment key={row}>
                    {/* Time label — sticky left column, centered vertically so the label aligns with the hour line */}
                    <div
                      key={`tl-${row}`}
                      style={{
                        gridColumn: 1,
                        height: ROW_HEIGHT_PX,
                        position: "sticky",
                        left: 0,
                        zIndex: 4,
                        background: "var(--bg-page)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        paddingRight: "10px",
                        fontSize: "10px",
                        fontWeight: isHour ? 600 : 400,
                        color: isHour ? "var(--text-muted)" : "transparent",
                        borderRight: "1px solid var(--border)",
                        userSelect: "none",
                        fontVariantNumeric: "tabular-nums",
                        boxSizing: "border-box",
                      }}
                    >
                      {slotToLabel(row)}
                    </div>

                    {DAYS.map(day => {
                      const block = active.find(e => {
                        const slots = JSON.parse(e.scheduleJson) as { day: string; startTime: string; endTime: string }[]
                        return slots.some(s => s.day === day && timeToSlot(s.startTime) === row)
                      })

                      if (block) {
                        const slots = JSON.parse(block.scheduleJson) as { day: string; startTime: string; endTime: string; room?: string }[]
                        const slot = slots.find(s => s.day === day && timeToSlot(s.startTime) === row)!
                        const span = timeToSlot(slot.endTime) - timeToSlot(slot.startTime)
                        const pal = hashPalette(block.courseCode)
                        const isWaitlisted = block.state === "WAITLISTED"

                        return (
                          <div
                            key={`${day}-${row}-block`}
                            className="sched-block"
                            style={{
                              gridRow: `span ${span}`,
                              background: isWaitlisted ? pal.light : pal.bg,
                              border: `1.5px solid ${pal.bg}`,
                              borderRadius: "6px",
                              padding: "6px 8px 6px 8px",
                              fontSize: "11px",
                              color: isWaitlisted ? "var(--text-primary)" : "white",
                              overflow: "hidden",
                              position: "relative",
                              margin: "2px",
                              minHeight: SLOT_HEIGHT * span - 4,
                              animation: "schedFadeIn 0.25s ease",
                            }}
                          >
                            {/* Time */}
                            <div style={{
                              fontSize: "10px", fontWeight: 700, marginBottom: "4px",
                              background: isWaitlisted ? "rgba(0,0,0,0.12)" : "rgba(0,0,0,0.28)", borderRadius: "3px",
                              padding: "1px 5px", display: "inline-block", letterSpacing: "0.02em",
                              color: isWaitlisted ? "var(--text-primary)" : "white",
                            }}>
                              {slot.startTime} – {slot.endTime}
                            </div>

                            <div style={{ fontWeight: 700, fontSize: "12px", lineHeight: 1.3 }}>{block.courseCode}</div>

                            {span >= 3 && (
                              <div style={{ fontSize: "10px", opacity: 0.85, marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {block.courseTitle}
                              </div>
                            )}

                            {block.groupLabel && (
                              <div style={{ fontSize: "10px", fontWeight: 700, marginTop: "2px", background: "rgba(0,0,0,0.2)", borderRadius: "3px", padding: "1px 4px", display: "inline-block" }}>
                                {block.groupLabel}
                              </div>
                            )}

                            {block.instructor && span >= 3 && (
                              <div style={{ fontSize: "10px", opacity: 0.8, marginTop: "3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {block.instructor}
                              </div>
                            )}

                            {slot.room && (
                              <div style={{ fontSize: "9px", opacity: 0.6, marginTop: "2px" }}>{slot.room}</div>
                            )}

                            {isWaitlisted && (
                              <div style={{ fontSize: "9px", fontWeight: 700, marginTop: "3px", background: "rgba(251,191,36,0.25)", color: "#fbbf24", borderRadius: "3px", padding: "1px 4px", display: "inline-block", border: "1px solid rgba(251,191,36,0.4)" }}>
                                WAITLIST
                              </div>
                            )}

                            {canDrop && (
                              <button
                                className="drop-btn"
                                onClick={() => setConfirm(block.id)}
                                title="Drop course"
                                style={{
                                  position: "absolute", top: "4px", right: "4px",
                                  background: "rgba(0,0,0,0.45)", border: "none",
                                  borderRadius: "4px", color: "white", fontSize: "12px",
                                  cursor: "pointer", padding: "1px 5px", lineHeight: 1.4,
                                }}
                              >
                                ×
                              </button>
                            )}
                          </div>
                        )
                      }

                      return (
                        <div
                          key={`${day}-${row}-empty`}
                          style={{
                            height: ROW_HEIGHT_PX,
                            boxSizing: "border-box",
                            borderBottom: isHour ? "1px solid var(--border-subtle)" : "1px solid rgba(255,255,255,0.025)",
                            borderRight: "1px solid var(--border-subtle)",
                          }}
                        />
                      )
                    })}
                  </React.Fragment>
                )
              })}
            </div>
          </div>

          {/* Legend */}
          <div style={{ marginTop: "16px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {active.map(e => {
              const p = hashPalette(e.courseCode)
              return (
                <div key={e.id} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-secondary)" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "2px", background: p.bg, flexShrink: 0 }} />
                  <span style={{ fontWeight: 600 }}>{e.courseCode}</span>
                  {e.groupLabel && <span style={{ color: "var(--text-muted)" }}>· {e.groupLabel}</span>}
                  {e.instructor && <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>· {e.instructor}</span>}
                  {e.state === "WAITLISTED" && <span style={{ color: "#fbbf24", fontSize: "10px", fontWeight: 600 }}>(waitlist)</span>}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
