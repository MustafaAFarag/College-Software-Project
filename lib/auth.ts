import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import type { Role } from "@prisma/client"
import { compare } from "bcryptjs"
import { db } from "@/lib/db"
import { z } from "zod"

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = z.object({ email: z.string().email(), password: z.string() }).safeParse(credentials)
        if (!parsed.success) return null
        const user = await db.user.findUnique({ where: { email: parsed.data.email } })
        if (!user) return null
        const valid = await compare(parsed.data.password, user.passwordHash)
        if (!valid) return null
        return { id: user.id, name: user.name, email: user.email, role: user.role, studentId: user.studentId }
      }
    })
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        const authUser = user as { role?: Role; studentId?: string | null }
        token.role = authUser.role
        token.studentId = authUser.studentId ?? null
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.sub!
      session.user.role = token.role as Role
      session.user.studentId = (token.studentId as string | null | undefined) ?? null
      return session
    }
  },
  pages: { signIn: "/login" }
})
