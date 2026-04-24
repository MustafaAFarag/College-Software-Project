import { Role } from "@prisma/client"
import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: { id: string; role: Role; studentId: string | null } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT { role: Role; studentId: string | null }
}
