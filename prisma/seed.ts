import { PrismaClient, EnrollmentState } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

const DEMO_PASSWORD = "demo1234"
const EXTRA_STUDENT_COUNT = 48

const STUDENT_NAMES = [
  "Ahmed Mohamed", "Sara Ali", "Mohamed Hassan", "Nour Ibrahim", "Omar Khalid",
  "Layla Mahmoud", "Khaled Youssef", "Rania Saeed", "Tarek Nasser", "Dina Farouk",
  "Youssef Sherif", "Mariam Adel", "Amr Magdy", "Hana Mostafa", "Kareem Talaat",
  "Salma Gamal", "Bassem Fouad", "Yasmin Lotfy", "Hossam Atef", "Rana Wahid",
  "Sherif Ramadan", "Noura Samir", "Alaa Sobhi", "Mona Essam", "Amir Zaki",
  "Heba Medhat", "Samy Aziz", "Nada Kamel", "Wael Helmy", "Eman Barakat",
  "Fady Naguib", "Reem Morsi", "Islam Hamdy", "Dalia Abdel", "Mostafa Ragab",
  "Ghada Hosny", "Mahmoud Gouda", "Shimaa Fawzy", "Hazem Badawy", "Nesma Elsayed",
  "Tamer Osman", "Lobna Maged", "Sherif Farid", "Doaa Shalaby", "Haytham Zein",
  "Mervat Sobhy", "Sameh Nabil", "Aya Ismail",
]

const INSTRUCTORS = [
  "Dr. Ahmed Mohamed",
  "Dr. Fatma Ali",
  "Dr. Mahmoud Hassan",
  "Dr. Noureldeen Saad",
  "Dr. Sara Ibrahim",
  "Dr. Khaled Youssef",
  "Dr. Mona Abdallah",
  "Dr. Tarek Said",
  "Dr. Reem Alnajjar",
  "Dr. Omar Alsheikh",
]

type Slot = { day: string; startTime: string; endTime: string; room: string }
type TermBlueprint = {
  code: string
  label: string
  startDate: Date
  endDate: Date
  regOpensAt: Date
  regClosesAt: Date
  dropClosesAt: Date
}
type SectionSpec = {
  courseCode: string
  group: string
  capacity: number
  instructorName: string
  slots: Slot[]
  assignToDemoInstructor?: boolean
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000)
}

function utcDate(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month - 1, day))
}

function buildActiveTerm(now: Date): TermBlueprint {
  const year = now.getUTCFullYear()
  const month = now.getUTCMonth() + 1
  const isSpring = month <= 6

  return {
    code: `${year}-${isSpring ? "SPRING" : "FALL"}`,
    label: `${isSpring ? "Spring" : "Fall"} ${year}`,
    startDate: isSpring ? utcDate(year, 2, 1) : utcDate(year, 9, 1),
    endDate: isSpring ? utcDate(year, 6, 30) : utcDate(year + 1, 1, 31),
    regOpensAt: addDays(now, -7),
    regClosesAt: addDays(now, 30),
    dropClosesAt: addDays(now, 14),
  }
}

function buildPastTerm(active: TermBlueprint): TermBlueprint {
  const isSpring = active.code.endsWith("SPRING")
  const activeYear = Number(active.code.slice(0, 4))

  if (isSpring) {
    return {
      code: `${activeYear - 1}-FALL`,
      label: `Fall ${activeYear - 1}`,
      startDate: utcDate(activeYear - 1, 9, 1),
      endDate: utcDate(activeYear, 1, 31),
      regOpensAt: utcDate(activeYear - 1, 8, 15),
      regClosesAt: utcDate(activeYear - 1, 9, 15),
      dropClosesAt: utcDate(activeYear - 1, 10, 1),
    }
  }

  return {
    code: `${activeYear}-SPRING`,
    label: `Spring ${activeYear}`,
    startDate: utcDate(activeYear, 2, 1),
    endDate: utcDate(activeYear, 6, 30),
    regOpensAt: utcDate(activeYear, 1, 15),
    regClosesAt: utcDate(activeYear, 2, 15),
    dropClosesAt: utcDate(activeYear, 3, 1),
  }
}

function sectionKey(courseCode: string, group: string) {
  return `${courseCode}-${group}`
}

async function resetData() {
  await prisma.$transaction([
    prisma.auditLog.deleteMany(),
    prisma.overrideRequest.deleteMany(),
    prisma.enrollment.deleteMany(),
    prisma.section.deleteMany(),
    prisma.prerequisite.deleteMany(),
    prisma.course.deleteMany(),
    prisma.department.deleteMany(),
    prisma.term.deleteMany(),
    prisma.user.deleteMany(),
  ])
}

async function createEnrollment(
  studentId: string,
  sectionId: string,
  state: EnrollmentState,
  createdAt: Date,
  actorId = studentId
) {
  const enrollment = await prisma.enrollment.create({
    data: { studentId, sectionId, state, createdAt },
  })

  await prisma.auditLog.create({
    data: {
      enrollmentId: enrollment.id,
      actorId,
      action: state === "WAITLISTED" ? "WAITLIST" : state === "COMPLETED" ? "COMPLETE" : "ENROLL",
      toState: state,
      at: createdAt,
    },
  })

  return enrollment
}

async function main() {
  const now = new Date()
  const passwordHash = await hash(DEMO_PASSWORD, 10)
  const activeTerm = buildActiveTerm(now)
  const pastTerm = buildPastTerm(activeTerm)

  await resetData()

  const demoStudent = await prisma.user.create({
    data: {
      name: "Alex Student",
      email: "student@alex.edu",
      passwordHash,
      role: "STUDENT",
      studentId: "STU001",
      department: "CS",
    },
  })

  const advisor = await prisma.user.create({
    data: { name: "Dr. Advisor", email: "advisor@alex.edu", passwordHash, role: "ADVISOR" },
  })

  const demoInstructor = await prisma.user.create({
    data: {
      name: INSTRUCTORS[0],
      email: "instructor@alex.edu",
      passwordHash,
      role: "INSTRUCTOR",
      department: "CS",
    },
  })

  await prisma.user.create({
    data: { name: "Admin User", email: "admin@alex.edu", passwordHash, role: "ADMIN" },
  })

  const extraStudents = []
  for (let i = 0; i < EXTRA_STUDENT_COUNT; i++) {
    const padded = String(i + 2).padStart(3, "0")
    extraStudents.push(await prisma.user.create({
      data: {
        name: STUDENT_NAMES[i] ?? `Student ${padded}`,
        email: `stu${padded}@alex.edu`,
        passwordHash,
        role: "STUDENT",
        studentId: `STU${padded}`,
        department: "CS",
      },
    }))
  }

  const cs = await prisma.department.create({
    data: { code: "CS", name: "Computer Science" },
  })

  const courseRows = await Promise.all([
    prisma.course.create({ data: { code: "CS101", title: "Intro to Programming", creditHours: 3, level: 100, departmentId: cs.id } }),
    prisma.course.create({ data: { code: "CS102", title: "Digital Logic", creditHours: 3, level: 100, departmentId: cs.id } }),
    prisma.course.create({ data: { code: "CS201", title: "Data Structures", creditHours: 3, level: 200, departmentId: cs.id } }),
    prisma.course.create({ data: { code: "CS202", title: "Algorithms", creditHours: 3, level: 200, departmentId: cs.id } }),
    prisma.course.create({ data: { code: "CS301", title: "Operating Systems", creditHours: 3, level: 300, departmentId: cs.id } }),
    prisma.course.create({ data: { code: "CS302", title: "Computer Networks", creditHours: 3, level: 300, departmentId: cs.id } }),
    prisma.course.create({ data: { code: "CS401", title: "Software Engineering", creditHours: 3, level: 400, departmentId: cs.id } }),
    prisma.course.create({ data: { code: "CS402", title: "Machine Learning", creditHours: 3, level: 400, departmentId: cs.id } }),
    prisma.course.create({ data: { code: "MATH101", title: "Calculus I", creditHours: 3, level: 100, departmentId: cs.id } }),
    prisma.course.create({ data: { code: "MATH201", title: "Linear Algebra", creditHours: 3, level: 200, departmentId: cs.id } }),
  ])

  const courses = Object.fromEntries(courseRows.map((course) => [course.code, course]))

  await prisma.prerequisite.createMany({
    data: [
      { courseId: courses.CS201.id, requiredCourseId: courses.CS101.id },
      { courseId: courses.CS301.id, requiredCourseId: courses.CS201.id },
      { courseId: courses.CS302.id, requiredCourseId: courses.CS201.id },
      { courseId: courses.CS401.id, requiredCourseId: courses.CS301.id },
    ],
  })

  const pastTermRow = await prisma.term.create({ data: { ...pastTerm, isActive: false } })
  const activeTermRow = await prisma.term.create({ data: { ...activeTerm, isActive: true } })

  const pastSectionRows = await Promise.all([
    prisma.section.create({
      data: {
        courseId: courses.CS101.id,
        termId: pastTermRow.id,
        capacity: 30,
        groupLabel: "G1",
        instructorName: INSTRUCTORS[0],
        instructorId: demoInstructor.id,
        scheduleJson: JSON.stringify([{ day: "SUN", startTime: "09:00", endTime: "10:30", room: "A101" }]),
      },
    }),
    prisma.section.create({
      data: {
        courseId: courses.CS102.id,
        termId: pastTermRow.id,
        capacity: 30,
        groupLabel: "G1",
        instructorName: INSTRUCTORS[2],
        scheduleJson: JSON.stringify([{ day: "MON", startTime: "11:00", endTime: "12:30", room: "B101" }]),
      },
    }),
    prisma.section.create({
      data: {
        courseId: courses.CS201.id,
        termId: pastTermRow.id,
        capacity: 30,
        groupLabel: "G1",
        instructorName: INSTRUCTORS[3],
        scheduleJson: JSON.stringify([{ day: "TUE", startTime: "11:00", endTime: "12:30", room: "C101" }]),
      },
    }),
    prisma.section.create({
      data: {
        courseId: courses.CS301.id,
        termId: pastTermRow.id,
        capacity: 24,
        groupLabel: "G1",
        instructorName: INSTRUCTORS[0],
        instructorId: demoInstructor.id,
        scheduleJson: JSON.stringify([{ day: "THU", startTime: "14:00", endTime: "15:30", room: "D101" }]),
      },
    }),
    prisma.section.create({
      data: {
        courseId: courses.MATH101.id,
        termId: pastTermRow.id,
        capacity: 30,
        groupLabel: "G1",
        instructorName: INSTRUCTORS[8],
        scheduleJson: JSON.stringify([{ day: "WED", startTime: "09:00", endTime: "10:30", room: "E101" }]),
      },
    }),
  ])

  const pastSections = Object.fromEntries([
    [sectionKey("CS101", "G1"), pastSectionRows[0]],
    [sectionKey("CS102", "G1"), pastSectionRows[1]],
    [sectionKey("CS201", "G1"), pastSectionRows[2]],
    [sectionKey("CS301", "G1"), pastSectionRows[3]],
    [sectionKey("MATH101", "G1"), pastSectionRows[4]],
  ])

  const activeSectionSpecs: SectionSpec[] = [
    { courseCode: "CS101", group: "G1", capacity: 28, instructorName: INSTRUCTORS[1], slots: [{ day: "MON", startTime: "09:00", endTime: "10:30", room: "A102" }] },
    { courseCode: "CS102", group: "G1", capacity: 28, instructorName: INSTRUCTORS[2], slots: [{ day: "SUN", startTime: "11:00", endTime: "12:30", room: "B201" }] },
    { courseCode: "CS102", group: "G2", capacity: 28, instructorName: INSTRUCTORS[2], slots: [{ day: "WED", startTime: "13:00", endTime: "14:30", room: "B202" }] },
    { courseCode: "CS201", group: "G1", capacity: 24, instructorName: INSTRUCTORS[3], slots: [{ day: "TUE", startTime: "11:00", endTime: "12:30", room: "C201" }] },
    { courseCode: "CS202", group: "G1", capacity: 24, instructorName: INSTRUCTORS[4], slots: [{ day: "MON", startTime: "14:00", endTime: "15:30", room: "C301" }] },
    { courseCode: "CS202", group: "G2", capacity: 24, instructorName: INSTRUCTORS[4], slots: [{ day: "THU", startTime: "09:00", endTime: "10:30", room: "C302" }] },
    { courseCode: "CS301", group: "G1", capacity: 20, instructorName: INSTRUCTORS[0], assignToDemoInstructor: true, slots: [{ day: "SUN", startTime: "14:00", endTime: "15:30", room: "D201" }] },
    { courseCode: "CS301", group: "G2", capacity: 20, instructorName: INSTRUCTORS[5], slots: [{ day: "MON", startTime: "16:00", endTime: "17:30", room: "D202" }] },
    { courseCode: "CS302", group: "G1", capacity: 22, instructorName: INSTRUCTORS[6], slots: [{ day: "WED", startTime: "16:00", endTime: "17:30", room: "E201" }] },
    { courseCode: "CS401", group: "G1", capacity: 18, instructorName: INSTRUCTORS[0], assignToDemoInstructor: true, slots: [{ day: "THU", startTime: "14:00", endTime: "15:30", room: "F201" }] },
    { courseCode: "CS402", group: "G1", capacity: 18, instructorName: INSTRUCTORS[7], slots: [{ day: "TUE", startTime: "16:00", endTime: "17:30", room: "F301" }] },
    { courseCode: "MATH201", group: "G1", capacity: 24, instructorName: INSTRUCTORS[8], slots: [{ day: "WED", startTime: "09:00", endTime: "10:30", room: "G101" }] },
    { courseCode: "MATH201", group: "G2", capacity: 5, instructorName: INSTRUCTORS[9], slots: [{ day: "THU", startTime: "16:00", endTime: "17:30", room: "G102" }] },
  ]

  const activeSections = new Map<string, { id: string }>()
  for (const spec of activeSectionSpecs) {
    const section = await prisma.section.create({
      data: {
        courseId: courses[spec.courseCode].id,
        termId: activeTermRow.id,
        capacity: spec.capacity,
        groupLabel: spec.group,
        instructorName: spec.instructorName,
        instructorId: spec.assignToDemoInstructor ? demoInstructor.id : undefined,
        scheduleJson: JSON.stringify(spec.slots),
      },
    })
    activeSections.set(sectionKey(spec.courseCode, spec.group), section)
  }

  const historicalCompletionDate = addDays(activeTermRow.startDate, -45)
  await createEnrollment(demoStudent.id, pastSections["CS101-G1"].id, "COMPLETED", historicalCompletionDate)
  await createEnrollment(demoStudent.id, pastSections["CS102-G1"].id, "COMPLETED", addDays(historicalCompletionDate, 1))
  await createEnrollment(demoStudent.id, pastSections["MATH101-G1"].id, "COMPLETED", addDays(historicalCompletionDate, 2))
  await createEnrollment(demoStudent.id, pastSections["CS201-G1"].id, "COMPLETED", addDays(historicalCompletionDate, 3))

  for (let i = 0; i < extraStudents.length; i++) {
    if (i < 36) {
      await createEnrollment(extraStudents[i].id, pastSections["CS101-G1"].id, "COMPLETED", addDays(historicalCompletionDate, 4))
    }
    if (i < 24) {
      await createEnrollment(extraStudents[i].id, pastSections["CS201-G1"].id, "COMPLETED", addDays(historicalCompletionDate, 5))
    }
    if (i < 12) {
      await createEnrollment(extraStudents[i].id, pastSections["CS301-G1"].id, "COMPLETED", addDays(historicalCompletionDate, 6))
    }
  }

  const baselineEnrollmentDate = addDays(now, -4)
  await createEnrollment(demoStudent.id, activeSections.get("CS202-G2")!.id, "ENROLLED", baselineEnrollmentDate)
  await createEnrollment(demoStudent.id, activeSections.get("CS302-G1")!.id, "ENROLLED", addDays(baselineEnrollmentDate, 1))
  await createEnrollment(demoStudent.id, activeSections.get("MATH201-G1")!.id, "ENROLLED", addDays(baselineEnrollmentDate, 2))

  for (let i = 0; i < 12; i++) {
    const student = extraStudents[i]
    await prisma.enrollment.createMany({
      data: [
        { studentId: student.id, sectionId: activeSections.get("CS102-G1")!.id, state: "ENROLLED", createdAt: addDays(baselineEnrollmentDate, -1) },
        { studentId: student.id, sectionId: activeSections.get("CS301-G1")!.id, state: "ENROLLED", createdAt: addDays(baselineEnrollmentDate, -1) },
        { studentId: student.id, sectionId: activeSections.get("CS401-G1")!.id, state: "ENROLLED", createdAt: addDays(baselineEnrollmentDate, -1) },
      ],
    })
  }

  for (let i = 12; i < 18; i++) {
    const student = extraStudents[i]
    await prisma.enrollment.createMany({
      data: [
        { studentId: student.id, sectionId: activeSections.get("CS202-G2")!.id, state: "ENROLLED", createdAt: addDays(baselineEnrollmentDate, -1) },
        { studentId: student.id, sectionId: activeSections.get("CS301-G2")!.id, state: "ENROLLED", createdAt: addDays(baselineEnrollmentDate, -1) },
        { studentId: student.id, sectionId: activeSections.get("MATH201-G1")!.id, state: "ENROLLED", createdAt: addDays(baselineEnrollmentDate, -1) },
      ],
    })
  }

  for (let i = 18; i < 24; i++) {
    const student = extraStudents[i]
    await prisma.enrollment.createMany({
      data: [
        { studentId: student.id, sectionId: activeSections.get("CS202-G2")!.id, state: "ENROLLED", createdAt: addDays(baselineEnrollmentDate, -1) },
        { studentId: student.id, sectionId: activeSections.get("CS302-G1")!.id, state: "ENROLLED", createdAt: addDays(baselineEnrollmentDate, -1) },
        { studentId: student.id, sectionId: activeSections.get("MATH201-G1")!.id, state: "ENROLLED", createdAt: addDays(baselineEnrollmentDate, -1) },
      ],
    })
  }

  for (let i = 24; i < 30; i++) {
    const student = extraStudents[i]
    await prisma.enrollment.createMany({
      data: [
        { studentId: student.id, sectionId: activeSections.get("CS101-G1")!.id, state: "ENROLLED", createdAt: addDays(baselineEnrollmentDate, -1) },
        { studentId: student.id, sectionId: activeSections.get("CS202-G1")!.id, state: "ENROLLED", createdAt: addDays(baselineEnrollmentDate, -1) },
        { studentId: student.id, sectionId: activeSections.get("CS402-G1")!.id, state: "ENROLLED", createdAt: addDays(baselineEnrollmentDate, -1) },
      ],
    })
  }

  for (let i = 30; i < 36; i++) {
    const student = extraStudents[i]
    await prisma.enrollment.createMany({
      data: [
        { studentId: student.id, sectionId: activeSections.get("CS101-G1")!.id, state: "ENROLLED", createdAt: addDays(baselineEnrollmentDate, -1) },
        { studentId: student.id, sectionId: activeSections.get("CS102-G2")!.id, state: "ENROLLED", createdAt: addDays(baselineEnrollmentDate, -1) },
        { studentId: student.id, sectionId: activeSections.get("CS201-G1")!.id, state: "ENROLLED", createdAt: addDays(baselineEnrollmentDate, -1) },
      ],
    })
  }

  for (let i = 36; i < 41; i++) {
    const student = extraStudents[i]
    await prisma.enrollment.createMany({
      data: [
        { studentId: student.id, sectionId: activeSections.get("CS102-G2")!.id, state: "ENROLLED", createdAt: addDays(baselineEnrollmentDate, -1) },
        { studentId: student.id, sectionId: activeSections.get("CS202-G1")!.id, state: "ENROLLED", createdAt: addDays(baselineEnrollmentDate, -1) },
        { studentId: student.id, sectionId: activeSections.get("MATH201-G2")!.id, state: "ENROLLED", createdAt: addDays(baselineEnrollmentDate, -1) },
      ],
    })
  }

  await prisma.enrollment.create({
    data: {
      studentId: extraStudents[41].id,
      sectionId: activeSections.get("MATH201-G2")!.id,
      state: "WAITLISTED",
      waitlistPos: 1,
      createdAt: addDays(baselineEnrollmentDate, -1),
    },
  })

  for (let i = 42; i < 48; i++) {
    const student = extraStudents[i]
    await prisma.enrollment.createMany({
      data: [
        { studentId: student.id, sectionId: activeSections.get("CS101-G1")!.id, state: "ENROLLED", createdAt: addDays(baselineEnrollmentDate, -1) },
        { studentId: student.id, sectionId: activeSections.get("CS102-G2")!.id, state: "ENROLLED", createdAt: addDays(baselineEnrollmentDate, -1) },
      ],
    })
  }

  const pendingOverrideDate = addDays(now, -2)
  await prisma.overrideRequest.createMany({
    data: [
      {
        studentId: extraStudents[20].id,
        sectionId: activeSections.get("CS401-G1")!.id,
        reason: "I am on track to finish CS301 through an external accredited module and need permission to stay on my graduation plan.",
        status: "PENDING",
        createdAt: pendingOverrideDate,
      },
      {
        studentId: extraStudents[33].id,
        sectionId: activeSections.get("CS301-G1")!.id,
        reason: "This section is the only one that fits my work schedule, and I have covered the prerequisite topics through prior training.",
        status: "PENDING",
        createdAt: addDays(pendingOverrideDate, 1),
      },
    ],
  })

  await prisma.auditLog.create({
    data: {
      enrollmentId: null,
      actorId: extraStudents[41].id,
      action: "WAITLIST",
      toState: "WAITLISTED",
      metaJson: JSON.stringify({ sectionId: activeSections.get("MATH201-G2")!.id }),
      at: addDays(baselineEnrollmentDate, -1),
    },
  })

  console.log("Seed complete.")
  console.log(`  Active term: ${activeTermRow.label} (${activeTermRow.code})`)
  console.log("  Accounts: student@alex.edu / advisor@alex.edu / instructor@alex.edu / admin@alex.edu")
  console.log(`  Password: ${DEMO_PASSWORD}`)
  console.log("  Demo flow: student enrolls in CS301-G1, requests override for CS401-G1, advisor approves, instructor roster updates.")
  console.log(`  Advisor baseline inbox: 2 pending requests handled by ${advisor.email}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
