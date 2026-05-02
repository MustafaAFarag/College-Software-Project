import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"

const links = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/terms", label: "Terms" },
  { href: "/admin/courses", label: "Courses" },
  { href: "/admin/sections", label: "Sections" },
  { href: "/admin/audit", label: "Audit Log" },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar links={links} role="ADMIN" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Header />
        <main style={{ flex: 1, padding: "24px", background: "var(--bg-page)" }}>
          {children}
        </main>
      </div>
    </div>
  )
}
