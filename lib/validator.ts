import { PrismaClient } from "@prisma/client"

export const MIN_CREDITS = 12
export const MAX_CREDITS = 18
export const MAX_CREDITS_OVERRIDE = 21

export type ValidationResult =
  | { ok: true; state: "ENROLLED" | "WAITLISTED" }
  | { ok: false; reason: string }

type TimeSlot = { day: string; startTime: string; endTime: string; room: string }

function timesOverlap(a: TimeSlot, b: TimeSlot): boolean {
  if (a.day !== b.day) return false
  return a.startTime < b.endTime && b.startTime < a.endTime
}

export async function validateEnrollment(
  studentId: string,
  sectionId: string,
  db: PrismaClient,
  overrideGranted?: boolean
): Promise<ValidationResult> {
  const section = await db.section.findUnique({
    where: { id: sectionId },
    include: {
      course: { include: { prerequisites: { include: { requiredCourse: true } } } },
      term: true,
      enrollments: { where: { state: "ENROLLED" } },
    }
  })
  if (!section) return { ok: false, reason: "Section not found" }

  const now = new Date()

  // 1. Registration window
  if (now < section.term.regOpensAt || now > section.term.regClosesAt) {
    return { ok: false, reason: "Registration window is closed" }
  }

  // 2. Already enrolled
  const existing = await db.enrollment.findUnique({
    where: { studentId_sectionId: { studentId, sectionId } }
  })
  if (existing && ["ENROLLED", "WAITLISTED", "PENDING"].includes(existing.state)) {
    return { ok: false, reason: "Already enrolled or waitlisted in this section" }
  }

  // 3. Prerequisites
  if (!overrideGranted) {
    for (const prereq of section.course.prerequisites) {
      const completed = await db.enrollment.findFirst({
        where: {
          studentId,
          state: "COMPLETED",
          section: { courseId: prereq.requiredCourseId }
        }
      })
      if (!completed) {
        return { ok: false, reason: `Missing prerequisite: ${prereq.requiredCourse.code} — ${prereq.requiredCourse.title}` }
      }
    }
  }

  // 4. Time conflict
  const newSlots: TimeSlot[] = JSON.parse(section.scheduleJson)
  const enrolledSections = await db.enrollment.findMany({
    where: { studentId, state: "ENROLLED", section: { termId: section.termId } },
    include: { section: true }
  })
  for (const enr of enrolledSections) {
    const existingSlots: TimeSlot[] = JSON.parse(enr.section.scheduleJson)
    for (const ns of newSlots) {
      for (const es of existingSlots) {
        if (timesOverlap(ns, es)) {
          const course = await db.course.findUnique({ where: { id: enr.section.courseId } })
          return { ok: false, reason: `Time conflict with ${course?.code} (${es.day} ${es.startTime}–${es.endTime})` }
        }
      }
    }
  }

  // 5. Credit cap
  if (!overrideGranted) {
    const enrolledCredits = await db.enrollment.findMany({
      where: { studentId, state: "ENROLLED", section: { termId: section.termId } },
      include: { section: { include: { course: true } } }
    })
    const currentCredits = enrolledCredits.reduce((sum, e) => sum + e.section.course.creditHours, 0)
    const cap = MAX_CREDITS
    if (currentCredits + section.course.creditHours > cap) {
      return { ok: false, reason: `Credit hour cap reached (${currentCredits}/${cap} hours)` }
    }
  }

  // 6. Section capacity
  const enrolledCount = section.enrollments.length
  if (enrolledCount >= section.capacity) {
    return { ok: true, state: "WAITLISTED" }
  }

  return { ok: true, state: "ENROLLED" }
}

export async function tryPromoteWaitlist(
  sectionId: string,
  db: PrismaClient
): Promise<string | null> {
  const candidates = await db.enrollment.findMany({
    where: { sectionId, state: "WAITLISTED" },
    orderBy: { waitlistPos: "asc" },
    take: 5,
  })

  for (const candidate of candidates) {
    const result = await validateEnrollment(candidate.studentId, sectionId, db)
    if (result.ok && result.state === "ENROLLED") {
      await db.enrollment.update({
        where: { id: candidate.id },
        data: { state: "ENROLLED", waitlistPos: null }
      })
      await db.auditLog.create({
        data: {
          enrollmentId: candidate.id,
          actorId: candidate.studentId,
          fromState: "WAITLISTED",
          toState: "ENROLLED",
          action: "PROMOTE",
        }
      })
      return candidate.studentId
    }
  }
  return null
}
