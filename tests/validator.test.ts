import { describe, it, expect, vi } from "vitest"
import { validateEnrollment } from "@/lib/validator"

const now = new Date()
const past = new Date(now.getTime() - 86400000)
const future = new Date(now.getTime() + 86400000)
const farFuture = new Date(now.getTime() + 2 * 86400000)

const SLOT_MON_9 = JSON.stringify([{ day: "MON", startTime: "09:00", endTime: "11:00", room: "A1" }])
const SLOT_MON_11 = JSON.stringify([{ day: "MON", startTime: "11:00", endTime: "13:00", room: "A2" }])
type ValidatorDb = Parameters<typeof validateEnrollment>[2]

function makeSection(overrides: Record<string, unknown> = {}) {
  return {
    id: "sec1",
    capacity: 30,
    scheduleJson: SLOT_MON_9,
    termId: "term1",
    courseId: "cs101",
    term: { regOpensAt: past, regClosesAt: future },
    course: { creditHours: 3, prerequisites: [] },
    enrollments: [],
    ...overrides,
  }
}

function makeDb(overrides: Record<string, unknown> = {}) {
  return {
    section: { findUnique: vi.fn().mockResolvedValue(makeSection()) },
    enrollment: {
      findUnique: vi.fn().mockResolvedValue(null),
      findFirst: vi.fn().mockResolvedValue(null),
      findMany: vi.fn().mockResolvedValue([]),
    },
    course: { findUnique: vi.fn().mockResolvedValue({ code: "CS201" }) },
    ...overrides,
  }
}

describe("validateEnrollment", () => {
  it("enrolls when all checks pass", async () => {
    const db = makeDb()
    const result = await validateEnrollment("stu1", "sec1", db as unknown as ValidatorDb)
    expect(result).toEqual({ ok: true, state: "ENROLLED" })
  })

  it("fails when section not found", async () => {
    const db = makeDb({ section: { findUnique: vi.fn().mockResolvedValue(null) } })
    const result = await validateEnrollment("stu1", "sec1", db as unknown as ValidatorDb)
    expect(result).toEqual({ ok: false, reason: "Section not found" })
  })

  it("fails when registration window closed (before open)", async () => {
    const db = makeDb({
      section: {
        findUnique: vi.fn().mockResolvedValue(
          makeSection({ term: { regOpensAt: future, regClosesAt: farFuture } })
        ),
      },
    })
    const result = await validateEnrollment("stu1", "sec1", db as unknown as ValidatorDb)
    expect(result).toEqual({ ok: false, reason: "Registration window is closed" })
  })

  it("fails when already enrolled", async () => {
    const db = makeDb({
      enrollment: {
        findUnique: vi.fn().mockResolvedValue({ state: "ENROLLED" }),
        findFirst: vi.fn().mockResolvedValue(null),
        findMany: vi.fn().mockResolvedValue([]),
      },
    })
    const result = await validateEnrollment("stu1", "sec1", db as unknown as ValidatorDb)
    expect(result).toEqual({ ok: false, reason: "Already enrolled or waitlisted in this section" })
  })

  it("fails when prerequisite not met", async () => {
    const sectionWithPrereq = makeSection({
      course: {
        creditHours: 3,
        prerequisites: [{ requiredCourseId: "cs100", requiredCourse: { code: "CS100", title: "Intro CS" } }],
      },
    })
    const db = makeDb({
      section: { findUnique: vi.fn().mockResolvedValue(sectionWithPrereq) },
      enrollment: {
        findUnique: vi.fn().mockResolvedValue(null),
        findFirst: vi.fn().mockResolvedValue(null),
        findMany: vi.fn().mockResolvedValue([]),
      },
    })
    const result = await validateEnrollment("stu1", "sec1", db as unknown as ValidatorDb)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toMatch(/CS100/)
  })

  it("skips prerequisite check when overrideGranted", async () => {
    const sectionWithPrereq = makeSection({
      course: {
        creditHours: 3,
        prerequisites: [{ requiredCourseId: "cs100", requiredCourse: { code: "CS100", title: "Intro CS" } }],
      },
    })
    const db = makeDb({
      section: { findUnique: vi.fn().mockResolvedValue(sectionWithPrereq) },
      enrollment: {
        findUnique: vi.fn().mockResolvedValue(null),
        findFirst: vi.fn().mockResolvedValue(null),
        findMany: vi.fn().mockResolvedValue([]),
      },
    })
    const result = await validateEnrollment("stu1", "sec1", db as unknown as ValidatorDb, true)
    expect(result).toEqual({ ok: true, state: "ENROLLED" })
  })

  it("fails on time conflict", async () => {
    const conflictingSection = {
      id: "sec2",
      courseId: "cs200",
      scheduleJson: SLOT_MON_9,
    }
    const db = makeDb({
      enrollment: {
        findUnique: vi.fn().mockResolvedValue(null),
        findFirst: vi.fn().mockResolvedValue(null),
        findMany: vi.fn().mockResolvedValue([{ section: conflictingSection }]),
      },
    })
    const result = await validateEnrollment("stu1", "sec1", db as unknown as ValidatorDb)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toMatch(/conflict/)
  })

  it("no conflict when same day but non-overlapping times", async () => {
    const adjacentSection = {
      id: "sec2",
      courseId: "cs200",
      scheduleJson: SLOT_MON_11,
    }
    const adjacentEnrollment = { section: { ...adjacentSection, course: { creditHours: 3 } } }
    const db = makeDb({
      enrollment: {
        findUnique: vi.fn().mockResolvedValue(null),
        findFirst: vi.fn().mockResolvedValue(null),
        findMany: vi.fn()
          .mockResolvedValueOnce([adjacentEnrollment])   // time conflict check
          .mockResolvedValueOnce([adjacentEnrollment]),  // credit check
      },
    })
    const result = await validateEnrollment("stu1", "sec1", db as unknown as ValidatorDb)
    expect(result).toEqual({ ok: true, state: "ENROLLED" })
  })

  it("waitlists when section at capacity", async () => {
    const fullSection = makeSection({
      capacity: 1,
      enrollments: [{ id: "enr_other", studentId: "stu2" }],
    })
    const db = makeDb({
      section: { findUnique: vi.fn().mockResolvedValue(fullSection) },
      enrollment: {
        findUnique: vi.fn().mockResolvedValue(null),
        findFirst: vi.fn().mockResolvedValue(null),
        findMany: vi.fn().mockResolvedValue([]),
      },
    })
    const result = await validateEnrollment("stu1", "sec1", db as unknown as ValidatorDb)
    expect(result).toEqual({ ok: true, state: "WAITLISTED" })
  })

  it("fails when credit cap exceeded", async () => {
    const heavyEnrollments = Array.from({ length: 6 }, () => ({
      section: { course: { creditHours: 3 } },
    }))
    const db = makeDb({
      enrollment: {
        findUnique: vi.fn().mockResolvedValue(null),
        findFirst: vi.fn().mockResolvedValue(null),
        findMany: vi.fn()
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce(heavyEnrollments),
      },
    })
    const result = await validateEnrollment("stu1", "sec1", db as unknown as ValidatorDb)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toMatch(/Credit hour cap/)
  })
})
