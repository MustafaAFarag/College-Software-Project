"use client"
import { signOut } from "next-auth/react"
import { useSession } from "next-auth/react"

function toTitleCase(role: string) {
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
}

function initials(name: string | null | undefined) {
  if (!name) return "?"
  const parts = name.trim().split(/\s+/)
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0][0].toUpperCase()
}

export function Header() {
  const { data: session } = useSession()
  const name = session?.user?.name
  const role = session?.user?.role

  return (
    <header style={{ background: "var(--bg-panel)", borderBottom: "1px solid var(--border-subtle)", padding: "0 24px", height: "52px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>Alexandria University</span>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {name && (
          <div
            style={{
              width: "30px", height: "30px", borderRadius: "50%",
              background: "var(--accent)", color: "white",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "11px", fontWeight: 700, flexShrink: 0,
            }}
          >
            {initials(name)}
          </div>
        )}
        <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{name}</span>
        {role && (
          <span style={{ fontSize: "12px", color: "var(--text-muted)", border: "1px solid var(--border)", borderRadius: "9999px", padding: "2px 8px", fontWeight: 510 }}>
            {toTitleCase(role)}
          </span>
        )}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          style={{ fontSize: "12px", color: "var(--text-muted)", background: "transparent", border: "none", cursor: "pointer", padding: "4px 8px" }}
        >
          Sign out
        </button>
      </div>
    </header>
  )
}
