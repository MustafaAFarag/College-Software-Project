# Validator Logic — `lib/validator.ts`

Core of the system. Pure function. No side effects. Called by enroll endpoint and optionally by UI for pre-flight check.

## Function Signature

```typescript
type ValidationResult =
  | { ok: true; state: "ENROLLED" | "WAITLISTED" }
  | { ok: false; reason: string };

async function validateEnrollment(
  studentId: string,
  sectionId: string,
  db: PrismaClient,
  overrideGranted?: boolean   // true if advisor approved override for this section
): Promise<ValidationResult>
```

## Check Order (fail-fast)

### 1. Registration window open
```
term.regOpensAt <= now <= term.regClosesAt
```
Fail: `"Registration window is closed"`

### 2. Not already enrolled
```
Enrollment(studentId, sectionId) where state IN [ENROLLED, WAITLISTED, PENDING]
```
Fail: `"Already enrolled or waitlisted in this section"`

### 3. Prerequisites met (skip if overrideGranted)
For each `Prerequisite(sectionId.courseId, requiredCourseId)`:
```
Enrollment(studentId, section.courseId = requiredCourseId) where state = COMPLETED
```
Fail: `"Missing prerequisite: {requiredCourse.code} — {requiredCourse.title}"`

### 4. Time conflict
Parse `scheduleJson` of target section into time intervals.
For each existing `ENROLLED` section of student in same term:
  - Parse their `scheduleJson`.
  - Check for overlap: same day AND intervals overlap (startA < endB AND startB < endA).
Fail: `"Time conflict with {existingCourse.code} ({day} {start}–{end})"`

### 5. Credit-hour cap (skip if overrideGranted)
```
sum(creditHours of ENROLLED courses for student in active term) + newCourse.creditHours
```
- Normal cap: 18
- Override cap: 21
Fail: `"Credit hour cap reached ({current}/{cap} hours)"`

### 6. Section capacity
```
count(Enrollment(sectionId) where state = ENROLLED) >= section.capacity
```
Pass but return `WAITLISTED` (not an error). Also assign `waitlistPos`:
```
max(waitlistPos for WAITLISTED enrollments in section) + 1
```

### 7. All checks passed → return `{ ok: true, state: "ENROLLED" }`

## Time Overlap Helper

```typescript
function timesOverlap(
  a: { day: string; startTime: string; endTime: string },
  b: { day: string; startTime: string; endTime: string }
): boolean {
  if (a.day !== b.day) return false;
  // compare as "HH:MM" strings (lexicographic works for same-day 24h times)
  return a.startTime < b.endTime && b.startTime < a.endTime;
}
```

## Schedule JSON Format

```typescript
type TimeSlot = {
  day: "SUN" | "MON" | "TUE" | "WED" | "THU";
  startTime: string;  // "HH:MM" 24h
  endTime: string;    // "HH:MM" 24h
  room: string;
};

type SectionSchedule = TimeSlot[];
```

Stored as `JSON.stringify(SectionSchedule)` in `Section.scheduleJson`.

## Waitlist Auto-Promote (in drop transaction)

Called after student drops. Returns promoted student ID or null.

```typescript
async function tryPromoteWaitlist(
  sectionId: string,
  db: PrismaClient
): Promise<string | null>
```

Logic:
1. Find `Enrollment(sectionId, state=WAITLISTED, waitlistPos=min)` → candidate.
2. Run `validateEnrollment(candidate.studentId, sectionId, db)` — re-validate (their time/credit state may have changed).
3. If `ok: true, state: "ENROLLED"`:
   - Update candidate enrollment to ENROLLED, clear waitlistPos.
   - Append AuditLog(action=PROMOTE).
   - Return candidate.studentId.
4. If still blocked (unlikely but possible): skip to next waitlist pos. Try up to 5 candidates max for demo.
5. If none promote: return null.

All of this happens inside the same `prisma.$transaction` as the drop.
