import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer"

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 11,
    fontFamily: "Helvetica",
    color: "#1f2937",
  },
  title: {
    fontSize: 18,
    marginBottom: 4,
    fontWeight: 700,
  },
  subtitle: {
    fontSize: 10,
    color: "#4b5563",
    marginBottom: 18,
  },
  section: {
    marginBottom: 16,
  },
  metaRow: {
    marginBottom: 4,
  },
  termHeading: {
    fontSize: 12,
    marginBottom: 8,
    fontWeight: 700,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
    paddingBottom: 6,
    marginBottom: 6,
    fontSize: 10,
    color: "#475569",
  },
  row: {
    flexDirection: "row",
    paddingBottom: 6,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  code: {
    width: "18%",
    paddingRight: 6,
  },
  titleCol: {
    width: "46%",
    paddingRight: 6,
  },
  credits: {
    width: "14%",
    textAlign: "center",
  },
  status: {
    width: "22%",
    textAlign: "right",
  },
  total: {
    marginTop: 10,
    fontSize: 11,
    fontWeight: 700,
  },
})

export interface TranscriptTerm {
  label: string
  courses: {
    id: string
    code: string
    title: string
    creditHours: number
    status: string
  }[]
}

export function TranscriptPdf({
  generatedAt,
  student,
  terms,
  totalCompletedCredits,
}: {
  generatedAt: string
  student: { name: string; studentId: string | null; department: string | null }
  terms: TranscriptTerm[]
  totalCompletedCredits: number
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.title}>Alexandria University - UniReg</Text>
          <Text style={styles.subtitle}>Unofficial transcript generated on {generatedAt}</Text>
          <Text style={styles.metaRow}>Student: {student.name}</Text>
          <Text style={styles.metaRow}>Student ID: {student.studentId ?? "N/A"}</Text>
          <Text style={styles.metaRow}>Department: {student.department ?? "N/A"}</Text>
        </View>

        {terms.map((term) => (
          <View key={term.label} style={styles.section}>
            <Text style={styles.termHeading}>{term.label}</Text>
            <View style={styles.tableHeader}>
              <Text style={styles.code}>Code</Text>
              <Text style={styles.titleCol}>Course</Text>
              <Text style={styles.credits}>Credits</Text>
              <Text style={styles.status}>Status</Text>
            </View>
            {term.courses.map((course) => (
              <View key={course.id} style={styles.row}>
                <Text style={styles.code}>{course.code}</Text>
                <Text style={styles.titleCol}>{course.title}</Text>
                <Text style={styles.credits}>{course.creditHours}</Text>
                <Text style={styles.status}>{course.status}</Text>
              </View>
            ))}
          </View>
        ))}

        <Text style={styles.total}>Total Completed Credits: {totalCompletedCredits}</Text>
      </Page>
    </Document>
  )
}
