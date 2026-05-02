import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"

const links = [
  { href: "/instructor/roster", label: "Section Roster" },
]

export default function InstructorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar links={links} role="INSTRUCTOR" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Header />
        <main style={{ flex: 1, padding: "24px", background: "var(--bg-page)" }}>
          {children}
        </main>
      </div>
    </div>
  )
}
