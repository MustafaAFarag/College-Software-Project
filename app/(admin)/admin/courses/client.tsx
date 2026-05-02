"use client"
import { useMemo, useState, type CSSProperties } from "react"
import { toast } from "react-toastify"
import { Spinner } from "@/components/Spinner"

type Course = {
  id: string
  code: string
  title: string
  creditHours: number
  level: number
  departmentId: string
  departmentCode: string
  prerequisites: { id: string; code: string }[]
}

type CourseForm = {
  code: string
  title: string
  creditHours: string
  level: string
  departmentId: string
}

function emptyForm(defaultDepartmentId: string): CourseForm {
  return { code: "", title: "", creditHours: "3", level: "100", departmentId: defaultDepartmentId }
}

export function CoursesClient({
  courses: initial,
  departments,
}: {
  courses: Course[]
  departments: { id: string; code: string; name: string }[]
}) {
  const defaultDepartmentId = departments[0]?.id ?? ""
  const [courses, setCourses] = useState(initial)
  const [search, setSearch] = useState("")
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState<CourseForm>(emptyForm(defaultDepartmentId))
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<CourseForm>(emptyForm(defaultDepartmentId))
  const [saving, setSaving] = useState<string | null>(null)
  const [prereqSelection, setPrereqSelection] = useState("")
  const [prereqBusy, setPrereqBusy] = useState(false)

  const editingCourse = useMemo(
    () => courses.find((course) => course.id === editingId) ?? null,
    [courses, editingId]
  )

  function serialize(form: CourseForm) {
    return {
      code: form.code.trim(),
      title: form.title.trim(),
      creditHours: parseInt(form.creditHours),
      level: parseInt(form.level),
      departmentId: form.departmentId,
    }
  }

  function courseToForm(course: Course): CourseForm {
    return {
      code: course.code,
      title: course.title,
      creditHours: String(course.creditHours),
      level: String(course.level),
      departmentId: course.departmentId,
    }
  }

  function departmentCodeFor(id: string) {
    return departments.find((department) => department.id === id)?.code ?? "N/A"
  }

  async function createCourse(e: React.FormEvent) {
    e.preventDefault()
    setSaving("create")
    try {
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(serialize(createForm)),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to create course")
      setCourses((current) => [...current, {
        ...data,
        departmentCode: departmentCodeFor(data.departmentId),
        prerequisites: [],
      }])
      setCreateForm(emptyForm(defaultDepartmentId))
      setShowCreate(false)
      toast.success("Course created")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Network error")
    } finally {
      setSaving(null)
    }
  }

  async function saveCourse(e: React.FormEvent) {
    e.preventDefault()
    if (!editingId) return
    setSaving(editingId)
    try {
      const res = await fetch(`/api/admin/courses/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(serialize(editForm)),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to update course")
      setCourses((current) => current.map((course) => course.id === editingId ? {
        ...course,
        ...data,
        departmentCode: departmentCodeFor(data.departmentId),
      } : course))
      toast.success("Course updated")
      setEditingId(null)
      setPrereqSelection("")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Network error")
    } finally {
      setSaving(null)
    }
  }

  async function addPrerequisite() {
    if (!editingId || !prereqSelection) return
    setPrereqBusy(true)
    try {
      const res = await fetch(`/api/admin/courses/${editingId}/prerequisites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requiredCourseId: prereqSelection }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to add prerequisite")
      const added = courses.find((course) => course.id === data.requiredCourseId)
      setCourses((current) => current.map((course) => course.id === editingId ? {
        ...course,
        prerequisites: [...course.prerequisites, { id: data.requiredCourseId, code: added?.code ?? data.requiredCourseId }],
      } : course))
      setPrereqSelection("")
      toast.success("Prerequisite added")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Network error")
    } finally {
      setPrereqBusy(false)
    }
  }

  async function removePrerequisite(requiredCourseId: string) {
    if (!editingId) return
    setPrereqBusy(true)
    try {
      const res = await fetch(`/api/admin/courses/${editingId}/prerequisites/${requiredCourseId}`, {
        method: "DELETE",
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to remove prerequisite")
      setCourses((current) => current.map((course) => course.id === editingId ? {
        ...course,
        prerequisites: course.prerequisites.filter((prerequisite) => prerequisite.id !== requiredCourseId),
      } : course))
      toast.success("Prerequisite removed")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Network error")
    } finally {
      setPrereqBusy(false)
    }
  }

  const availablePrereqs = courses.map((course) => ({ id: course.id, code: course.code })).filter((course) =>
    course.id !== editingId &&
    !editingCourse?.prerequisites.some((prerequisite) => prerequisite.id === course.id)
  )

  const filteredCourses = search.trim()
    ? courses.filter(c =>
        c.code.toLowerCase().includes(search.toLowerCase()) ||
        c.title.toLowerCase().includes(search.toLowerCase())
      )
    : courses

  return (
    <div>
      <div style={{ marginBottom: "16px", display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
        <button onClick={() => setShowCreate((value) => !value)} style={primaryButton}>
          {showCreate ? "Close Form" : "+ New Course"}
        </button>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by code or title…"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", borderRadius: "6px", padding: "8px 12px", color: "var(--text-secondary)", fontSize: "13px", outline: "none", minWidth: "220px" }}
        />
        {search && (
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{filteredCourses.length} result{filteredCourses.length !== 1 ? "s" : ""}</span>
        )}
      </div>

      {showCreate && (
        <form onSubmit={createCourse} style={panelStyle}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "12px", marginBottom: "12px" }}>
            <label style={labelStyle}>
              Code
              <input value={createForm.code} onChange={(e) => setCreateForm((form) => ({ ...form, code: e.target.value }))} required style={inputStyle} />
            </label>
            <label style={labelStyle}>
              Title
              <input value={createForm.title} onChange={(e) => setCreateForm((form) => ({ ...form, title: e.target.value }))} required style={inputStyle} />
            </label>
            <label style={labelStyle}>
              Credits
              <input type="number" min="1" value={createForm.creditHours} onChange={(e) => setCreateForm((form) => ({ ...form, creditHours: e.target.value }))} required style={inputStyle} />
            </label>
            <label style={labelStyle}>
              Level
              <select value={createForm.level} onChange={(e) => setCreateForm((form) => ({ ...form, level: e.target.value }))} style={inputStyle}>
                {[100, 200, 300, 400].map((level) => <option key={level} value={level}>{level}</option>)}
              </select>
            </label>
            <label style={{ ...labelStyle, gridColumn: "1 / -1" }}>
              Department
              <select value={createForm.departmentId} onChange={(e) => setCreateForm((form) => ({ ...form, departmentId: e.target.value }))} style={inputStyle}>
                {departments.map((department) => <option key={department.id} value={department.id}>{department.code} - {department.name}</option>)}
              </select>
            </label>
          </div>
          <button type="submit" disabled={saving === "create"} style={primaryButton}>
            {saving === "create" ? <><Spinner size={12} color="white" /> Creating...</> : "Create Course"}
          </button>
        </form>
      )}

      {editingCourse && (
        <form onSubmit={saveCourse} style={{ ...panelStyle, marginBottom: "20px" }}>
          <div style={{ fontSize: "14px", color: "var(--text-primary)", fontWeight: 510, marginBottom: "12px" }}>Edit Course</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "12px", marginBottom: "12px" }}>
            <label style={labelStyle}>
              Code
              <input value={editForm.code} onChange={(e) => setEditForm((form) => ({ ...form, code: e.target.value }))} required style={inputStyle} />
            </label>
            <label style={labelStyle}>
              Title
              <input value={editForm.title} onChange={(e) => setEditForm((form) => ({ ...form, title: e.target.value }))} required style={inputStyle} />
            </label>
            <label style={labelStyle}>
              Credits
              <input type="number" min="1" value={editForm.creditHours} onChange={(e) => setEditForm((form) => ({ ...form, creditHours: e.target.value }))} required style={inputStyle} />
            </label>
            <label style={labelStyle}>
              Level
              <select value={editForm.level} onChange={(e) => setEditForm((form) => ({ ...form, level: e.target.value }))} style={inputStyle}>
                {[100, 200, 300, 400].map((level) => <option key={level} value={level}>{level}</option>)}
              </select>
            </label>
            <label style={{ ...labelStyle, gridColumn: "1 / -1" }}>
              Department
              <select value={editForm.departmentId} onChange={(e) => setEditForm((form) => ({ ...form, departmentId: e.target.value }))} style={inputStyle}>
                {departments.map((department) => <option key={department.id} value={department.id}>{department.code} - {department.name}</option>)}
              </select>
            </label>
          </div>

          <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "12px", marginTop: "12px" }}>
            <div style={{ fontSize: "13px", color: "var(--text-primary)", fontWeight: 510, marginBottom: "8px" }}>Prerequisites</div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "10px" }}>
              {editingCourse.prerequisites.length === 0 && <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>No prerequisites</span>}
              {editingCourse.prerequisites.map((prerequisite) => (
                <button key={prerequisite.id} type="button" onClick={() => removePrerequisite(prerequisite.id)} disabled={prereqBusy} style={{ background: "transparent", color: "var(--accent-bright)", border: "1px solid var(--accent)", borderRadius: "9999px", padding: "4px 8px", fontSize: "11px", cursor: "pointer" }}>
                  {prerequisite.code} ×
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <select value={prereqSelection} onChange={(e) => setPrereqSelection(e.target.value)} style={{ ...inputStyle, marginTop: 0 }}>
                <option value="">Select prerequisite</option>
                {availablePrereqs.map((course) => <option key={course.id} value={course.id}>{course.code}</option>)}
              </select>
              <button type="button" onClick={addPrerequisite} disabled={!prereqSelection || prereqBusy} style={secondaryButton}>
                {prereqBusy ? "Saving..." : "Add"}
              </button>
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
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
              {["Code", "Title", "Dept", "Level", "Credits", "Prerequisites", ""].map((heading) => (
                <th key={heading} style={{ padding: "10px 16px", textAlign: "left", fontSize: "12px", color: "var(--text-muted)", fontWeight: 510 }}>{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredCourses.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: "30px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                  No courses match your search
                </td>
              </tr>
            )}
            {filteredCourses.map((course) => (
              <tr key={course.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <td style={{ padding: "10px 16px", fontSize: "13px", color: "var(--text-primary)", fontWeight: 510 }}>{course.code}</td>
                <td style={{ padding: "10px 16px", fontSize: "13px", color: "var(--text-secondary)" }}>{course.title}</td>
                <td style={{ padding: "10px 16px", fontSize: "12px", color: "var(--text-muted)" }}>{course.departmentCode}</td>
                <td style={{ padding: "10px 16px", fontSize: "12px", color: "var(--text-muted)" }}>{course.level}</td>
                <td style={{ padding: "10px 16px", fontSize: "12px", color: "var(--text-muted)" }}>{course.creditHours}</td>
                <td style={{ padding: "10px 16px" }}>
                  <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                    {course.prerequisites.length === 0
                      ? <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>None</span>
                      : course.prerequisites.map((prerequisite) => (
                        <span key={prerequisite.id} style={{ fontSize: "11px", color: "var(--accent-bright)", border: "1px solid var(--accent)", borderRadius: "9999px", padding: "1px 6px" }}>{prerequisite.code}</span>
                      ))}
                  </div>
                </td>
                <td style={{ padding: "10px 16px", textAlign: "right" }}>
                  <button
                    onClick={() => {
                      setEditingId(course.id)
                      setEditForm(courseToForm(course))
                      setPrereqSelection("")
                    }}
                    style={secondaryButton}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
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
