"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface NavLink { href: string; label: string }
interface SidebarProps { links: NavLink[]; role?: string }

const ROLE_ICONS: Record<string, string> = {
  Dashboard: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
  "Browse Courses": `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
  "My Schedule": `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  Transcript: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
  "Override Requests": `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  Terms: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  Courses: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
  Sections: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`,
  "Audit Log": `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
  "Override Inbox": `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>`,
  "Section Roster": `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
}

function toTitleCase(role: string) {
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
}

export function Sidebar({ links, role }: SidebarProps) {
  const pathname = usePathname()
  return (
    <aside style={{ width: "220px", minHeight: "100vh", background: "var(--bg-panel)", borderRight: "1px solid var(--border-subtle)", padding: "16px 0", flexShrink: 0 }}>
      <div style={{ padding: "0 16px 16px", borderBottom: "1px solid var(--border-subtle)" }}>
        <span style={{ fontSize: "15px", fontWeight: 510, color: "var(--text-primary)" }}>UniReg</span>
        {role && (
          <div style={{ marginTop: "8px" }}>
            <span style={{ fontSize: "11px", color: "var(--accent-bright)", background: "rgba(94,106,210,0.12)", border: "1px solid var(--accent)", borderRadius: "9999px", padding: "2px 8px", fontWeight: 600 }}>
              {toTitleCase(role)}
            </span>
          </div>
        )}
      </div>
      <nav style={{ padding: "12px 8px" }}>
        {links.map(link => {
          const active = pathname === link.href || pathname.startsWith(link.href + "/")
          const iconSvg = ROLE_ICONS[link.label]
          return (
            <Link
              key={link.href} href={link.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "7px 8px",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: 510,
                color: active ? "var(--accent-bright)" : "var(--text-secondary)",
                background: active ? "var(--bg-surface)" : "transparent",
                textDecoration: "none",
                marginBottom: "2px",
                borderLeft: active ? "2px solid var(--accent)" : "2px solid transparent",
                paddingLeft: "10px",
              }}
            >
              {iconSvg && (
                <span
                  style={{ flexShrink: 0, opacity: active ? 1 : 0.6, display: "flex", alignItems: "center" }}
                  dangerouslySetInnerHTML={{ __html: iconSvg }}
                />
              )}
              {link.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
