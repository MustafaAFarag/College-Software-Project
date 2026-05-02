import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"

const links = [
  { href: "/student/dashboard", label: "Dashboard" },
  { href: "/student/courses", label: "Browse Courses" },
  { href: "/student/schedule", label: "My Schedule" },
  { href: "/student/transcript", label: "Transcript" },
  { href: "/student/overrides", label: "Override Requests" },
]

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar links={links} role="STUDENT" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Header />
        <main style={{ flex: 1, padding: "24px", background: "var(--bg-page)" }}>
          {children}
        </main>
      </div>
    </div>
  )
}
