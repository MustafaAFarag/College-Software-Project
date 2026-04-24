"use client"
import { signOut } from "next-auth/react"
import { useSession } from "next-auth/react"

export function Header() {
  const { data: session } = useSession()
  return (
    <header style={{ background: "var(--bg-panel)", borderBottom: "1px solid var(--border-subtle)", padding: "0 24px", height: "52px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>Alexandria University</span>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{session?.user?.name}</span>
        {session?.user?.role && (
          <span style={{ fontSize: "12px", color: "var(--text-muted)", border: "1px solid var(--border)", borderRadius: "9999px", padding: "2px 8px", fontWeight: 510 }}>
            {session.user.role}
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
