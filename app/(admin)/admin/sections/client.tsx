"use client"
import { useMemo, useState, type CSSProperties, type Dispatch, type SetStateAction } from "react"
import { toast } from "react-toastify"
import { Spinner } from "@/components/Spinner"

type Section = {
  id: string
  termId: string
  courseId: string
  courseCode: string
  courseTitle: string
  termLabel: string
  capacity: number
  enrolled: number
  scheduleJson: string
  instructorId: string | null
  instructorName: string | null
  groupLabel: string | null
}

type Slot = { day: string; startTime: string; endTime: string; room: string }

type SectionForm = {
  courseId: string
  termId: string
  capacity: string
  instructorId: string
  slots: Slot[]
}

function parseSlots(json: string): Slot[] {
  try {
    return JSON.parse(json) as Slot[]
  } catch {
    return [{ day: "SUN", startTime: "09:00", endTime: "10:30", room: "" }]
  }
}

function formatSchedule(json: string) {
  return parseSlots(json).map((slot) => `${slot.day} ${slot.startTime}-${slot.endTime}${slot.room ? ` · ${slot.room}` : ""}`).join(", ")
}

function emptyForm(activeTermId: string | null): SectionForm {
  return {
    courseId: "",
    termId: activeTermId ?? "",
    capacity: "20",
    instructorId: "",
    slots: [{ day: "SUN", startTime: "09:00", endTime: "10:30", room: "" }],
  }
}

export function SectionsClient({
  sections,
  terms,
  courses,
  instructors,
  activeTermId,
}: {
  sections: Section[]
  terms: { id: string; label: string }[]
  courses: { id: string; code: string; title: string }[]
  instructors: { id: string; name: string }[]
  activeTermId: string | null
}) {
  const [selectedTermId, setSelectedTermId] = useState(activeTermId ?? terms[0]?.id ?? "")
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState<SectionForm>(emptyForm(activeTermId))
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<SectionForm>(emptyForm(activeTermId))
  const [saving, setSaving] = useState<string | null>(null)
  const [localSections, setLocalSections] = useState(sections)

  const filteredSections = useMemo(
    () => localSections.filter((section) => !selectedTermId || section.termId === selectedTermId),
    [localSections, selectedTermId]
  )

  function setSlot(
    updater: Dispatch<SetStateAction<SectionForm>>,
    index: number,
    key: keyof Slot,
    value: string
  ) {
    updater((form) => ({
      ...form,
      slots: form.slots.map((slot, slotIndex) => slotIndex === index ? { ...slot, [key]: value } : slot),
    }))
  }

  function addSlot(updater: Dispatch<SetStateAction<SectionForm>>) {
    updater((form) => ({
      ...form,
      slots: [...form.slots, { day: "SUN", startTime: "09:00", endTime: "10:30", room: "" }],
    }))
  }

  function validateSlots(slots: Slot[]) {
    return slots.every((slot) => slot.endTime > slot.startTime)
  }

  function courseLabel(courseId: string) {
    const course = courses.find((item) => item.id === courseId)
    return { code: course?.code ?? "", title: course?.title ?? "" }
  }

  function termLabel(termId: string) {
    return terms.find((term) => term.id === termId)?.label ?? "Unknown Term"
  }

  function instructorName(id: string | null) {
    if (!id) return null
    return instructors.find((instructor) => instructor.id === id)?.name ?? null
  }

  async function createSection(e: React.FormEvent) {
    e.preventDefault()
    if (!validateSlots(createForm.slots)) {
      toast.error("Each schedule slot must end after it starts")
      return
    }
    setSaving("create")
    try {
      const res = await fetch("/api/admin/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: createForm.courseId,
          termId: createForm.termId,
          capacity: parseInt(createForm.capacity),
          scheduleJson: JSON.stringify(createForm.slots),
          instructorId: createForm.instructorId || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to create section")
      const course = courseLabel(createForm.courseId)
      setLocalSections((current) => [...current, {
        id: data.id,
        courseId: createForm.courseId,
        courseCode: course.code,
        courseTitle: course.title,
        termId: createForm.termId,
        termLabel: termLabel(createForm.termId),
        capacity: parseInt(createForm.capacity),
        enrolled: 0,
        scheduleJson: JSON.stringify(createForm.slots),
        instructorId: createForm.instructorId || null,
        instructorName: instructorName(createForm.instructorId || null),
        groupLabel: data.groupLabel ?? null,
      }])
      setCreateForm(emptyForm(activeTermId))
      setShowCreate(false)
      toast.success("Section created")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Network error")
    } finally {
      setSaving(null)
    }
  }

  async function saveSection(e: React.FormEvent) {
    e.preventDefault()
    if (!editingId) return
    if (!validateSlots(editForm.slots)) {
      toast.error("Each schedule slot must end after it starts")
      return
    }
    setSaving(editingId)
    try {
      const res = await fetch(`/api/admin/sections/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          capacity: parseInt(editForm.capacity),
          scheduleJson: JSON.stringify(editForm.slots),
          instructorId: editForm.instructorId || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to update section")
      setLocalSections((current) => current.map((section) => section.id === editingId ? {
        ...section,
        capacity: data.capacity,
        scheduleJson: data.scheduleJson,
        instructorId: data.instructorId ?? null,
        instructorName: instructorName(data.instructorId ?? null),
      } : section))
      setEditingId(null)
      toast.success("Section updated")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Network error")
    } finally {
      setSaving(null)
    }
  }

  function startEdit(section: Section) {
    setEditingId(section.id)
    setEditForm({
      courseId: section.courseId,
      termId: section.termId,
      capacity: String(section.capacity),
      instructorId: section.instructorId ?? "",
      slots: parseSlots(section.scheduleJson),
    })
  }

  const days = ["SUN", "MON", "TUE", "WED", "THU"]

  return (
    <div>
      <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "16px", flexWrap: "wrap" }}>
        <button onClick={() => setShowCreate((value) => !value)} style={primaryButton}>
          {showCreate ? "Close Form" : "+ New Section"}
        </button>
        <select value={selectedTermId} onChange={(e) => setSelectedTermId(e.target.value)} style={inputStyle}>
          <option value="">All Terms</option>
          {terms.map((term) => <option key={term.id} value={term.id}>{term.label}</option>)}
        </select>
      </div>

      {showCreate && (
        <form onSubmit={createSection} style={panelStyle}>
          <SectionFormFields
            form={createForm}
            setForm={setCreateForm}
            terms={terms}
            courses={courses}
            instructors={instructors}
            days={days}
            addSlot={() => addSlot(setCreateForm)}
            setSlot={(index, key, value) => setSlot(setCreateForm, index, key, value)}
          />
          <button type="submit" disabled={saving === "create"} style={primaryButton}>
            {saving === "create" ? <><Spinner size={12} color="white" /> Creating...</> : "Create Section"}
          </button>
        </form>
      )}

      {editingId && (
        <form onSubmit={saveSection} style={{ ...panelStyle, marginBottom: "20px" }}>
          <div style={{ fontSize: "14px", color: "var(--text-primary)", fontWeight: 510, marginBottom: "12px" }}>Edit Section</div>
          <SectionFormFields
            form={editForm}
            setForm={setEditForm}
            terms={terms}
            courses={courses}
            instructors={instructors}
            days={days}
            readOnlyCourse
            readOnlyTerm
            addSlot={() => addSlot(setEditForm)}
            setSlot={(index, key, value) => setSlot(setEditForm, index, key, value)}
          />
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
              {["Term", "Course", "Instructor", "Schedule", "Seats", ""].map((heading) => (
                <th key={heading} style={{ padding: "10px 16px", textAlign: "left", fontSize: "12px", color: "var(--text-muted)", fontWeight: 510 }}>{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredSections.map((section) => (
              <tr key={section.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <td style={{ padding: "10px 16px", fontSize: "12px", color: "var(--text-muted)" }}>{section.termLabel}</td>
                <td style={{ padding: "10px 16px", fontSize: "13px", color: "var(--text-primary)", fontWeight: 510 }}>
                  {section.courseCode}
                  <span style={{ fontWeight: 400, color: "var(--text-muted)", marginLeft: "6px", fontSize: "12px" }}>{section.courseTitle}</span>
                </td>
                <td style={{ padding: "10px 16px", fontSize: "12px", color: "var(--text-secondary)" }}>{section.instructorName ?? "Unassigned"}</td>
                <td style={{ padding: "10px 16px", fontSize: "12px", color: "var(--text-secondary)" }}>{formatSchedule(section.scheduleJson)}</td>
                <td style={{ padding: "10px 16px", fontSize: "12px", color: section.enrolled >= section.capacity ? "#f87171" : "var(--text-muted)" }}>{section.enrolled}/{section.capacity}</td>
                <td style={{ padding: "10px 16px", textAlign: "right" }}>
                  <button onClick={() => startEdit(section)} style={secondaryButton}>Edit</button>
                </td>
              </tr>
            ))}
            {filteredSections.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: "30px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                  No sections found for the selected term
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function SectionFormFields({
  form,
  setForm,
  terms,
  courses,
  instructors,
  days,
  addSlot,
  setSlot,
  readOnlyCourse,
  readOnlyTerm,
}: {
  form: SectionForm
  setForm: Dispatch<SetStateAction<SectionForm>>
  terms: { id: string; label: string }[]
  courses: { id: string; code: string; title: string }[]
  instructors: { id: string; name: string }[]
  days: string[]
  addSlot: () => void
  setSlot: (index: number, key: keyof Slot, value: string) => void
  readOnlyCourse?: boolean
  readOnlyTerm?: boolean
}) {
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "12px", marginBottom: "12px" }}>
        <label style={labelStyle}>
          Course
          <select value={form.courseId} onChange={(e) => setForm((current) => ({ ...current, courseId: e.target.value }))} disabled={readOnlyCourse} required style={inputStyle}>
            <option value="">Select course</option>
            {courses.map((course) => <option key={course.id} value={course.id}>{course.code} - {course.title}</option>)}
          </select>
        </label>
        <label style={labelStyle}>
          Term
          <select value={form.termId} onChange={(e) => setForm((current) => ({ ...current, termId: e.target.value }))} disabled={readOnlyTerm} required style={inputStyle}>
            {terms.map((term) => <option key={term.id} value={term.id}>{term.label}</option>)}
          </select>
        </label>
        <label style={labelStyle}>
          Capacity
          <input type="number" min="1" value={form.capacity} onChange={(e) => setForm((current) => ({ ...current, capacity: e.target.value }))} required style={inputStyle} />
        </label>
        <label style={labelStyle}>
          Instructor
          <select value={form.instructorId} onChange={(e) => setForm((current) => ({ ...current, instructorId: e.target.value }))} style={inputStyle}>
            <option value="">Unassigned</option>
            {instructors.map((instructor) => <option key={instructor.id} value={instructor.id}>{instructor.name}</option>)}
          </select>
        </label>
      </div>

      <div style={{ marginBottom: "12px" }}>
        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px" }}>Schedule Slots</div>
        {form.slots.map((slot, index) => (
          <div key={index} style={{ display: "flex", gap: "8px", marginBottom: "6px", alignItems: "center" }}>
            <select value={slot.day} onChange={(e) => setSlot(index, "day", e.target.value)} style={{ ...inputStyle, marginTop: 0 }}>
              {days.map((day) => <option key={day} value={day}>{day}</option>)}
            </select>
            <input type="time" value={slot.startTime} onChange={(e) => setSlot(index, "startTime", e.target.value)} style={{ ...inputStyle, marginTop: 0 }} />
            <input type="time" value={slot.endTime} onChange={(e) => setSlot(index, "endTime", e.target.value)} style={{ ...inputStyle, marginTop: 0 }} />
            <input type="text" value={slot.room} onChange={(e) => setSlot(index, "room", e.target.value)} placeholder="Room" style={{ ...inputStyle, marginTop: 0 }} />
          </div>
        ))}
        <button type="button" onClick={addSlot} style={secondaryButton}>+ Add Slot</button>
      </div>
    </>
  )
}

const panelStyle: CSSProperties = {
  background: "rgba(255,255,255,0.02)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  padding: "20px",
  marginBottom: "20px",
}

const labelStyle: CSSProperties = {
  fontSize: "12px",
  color: "var(--text-muted)",
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
