"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface NavLink { href: string; label: string }

interface SidebarProps { links: NavLink[] }

export function Sidebar({ links }: SidebarProps) {
  const pathname = usePathname()
  return (
    <aside style={{ width: "220px", minHeight: "100vh", background: "var(--bg-panel)", borderRight: "1px solid var(--border-subtle)", padding: "16px 0", flexShrink: 0 }}>
      <div style={{ padding: "0 16px 20px", borderBottom: "1px solid var(--border-subtle)" }}>
        <span style={{ fontSize: "15px", fontWeight: 510, color: "var(--text-primary)" }}>UniReg</span>
      </div>
      <nav style={{ padding: "12px 8px" }}>
        {links.map(link => {
          const active = pathname === link.href || pathname.startsWith(link.href + "/")
          return (
            <Link
              key={link.href} href={link.href}
              style={{
                display: "block", padding: "7px 8px", borderRadius: "6px", fontSize: "13px", fontWeight: 510,
                color: active ? "var(--accent-bright)" : "var(--text-secondary)",
                background: active ? "var(--bg-surface)" : "transparent",
                textDecoration: "none", marginBottom: "2px",
              }}
            >
              {link.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
