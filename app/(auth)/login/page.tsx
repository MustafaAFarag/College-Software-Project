"use client"
import { signIn } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Spinner } from "@/components/Spinner"

const demoAccounts = [
  { email: "student@alex.edu", password: "demo1234", role: "STUDENT" },
  { email: "advisor@alex.edu", password: "demo1234", role: "ADVISOR" },
  { email: "instructor@alex.edu", password: "demo1234", role: "INSTRUCTOR" },
  { email: "admin@alex.edu",   password: "demo1234", role: "ADMIN" },
]

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const res = await signIn("credentials", { email, password, redirect: false })
      if (res?.error) {
        setError("Invalid email or password")
      } else {
        router.push("/")
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-page)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: "400px" }}>
        <div style={{ marginBottom: "32px", textAlign: "center" }}>
          <h1 style={{ fontSize: "22px", fontWeight: 510, color: "var(--text-primary)", marginBottom: "4px" }}>UniReg</h1>
          <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>Alexandria University Course Registration</p>
        </div>

        <form onSubmit={handleSubmit} style={{ background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: "8px", padding: "24px", marginBottom: "16px" }}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px", fontWeight: 510 }}>Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)} required
              style={{ width: "100%", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "6px", padding: "8px 12px", color: "var(--text-primary)", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px", fontWeight: 510 }}>Password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)} required
              style={{ width: "100%", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "6px", padding: "8px 12px", color: "var(--text-primary)", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
            />
          </div>
          {error && <p style={{ color: "#f87171", fontSize: "13px", marginBottom: "12px" }}>{error}</p>}
          <button
            type="submit" disabled={loading}
            style={{ width: "100%", background: "var(--accent)", color: "var(--text-primary)", border: "none", borderRadius: "6px", padding: "10px", fontSize: "14px", fontWeight: 600, cursor: loading ? "wait" : "pointer", opacity: loading ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
          >
            {loading ? <><Spinner size={14} color="white" /> Signing in…</> : "Sign In"}
          </button>
        </form>

        <div>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px", textAlign: "center" }}>Demo accounts (click to fill)</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {demoAccounts.map(acc => (
              <button
                key={acc.email}
                onClick={() => { setEmail(acc.email); setPassword(acc.password) }}
                style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "8px", padding: "10px 12px", cursor: "pointer", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{acc.email}</span>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", background: "transparent", border: "1px solid var(--border)", borderRadius: "9999px", padding: "2px 8px", fontWeight: 510 }}>{acc.role}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
