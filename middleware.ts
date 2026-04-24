import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const role = req.auth?.user?.role

  if (!req.auth && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", req.url))
  }
  if (pathname.startsWith("/student") && role !== "STUDENT")
    return NextResponse.redirect(new URL("/login", req.url))
  if (pathname.startsWith("/advisor") && role !== "ADVISOR")
    return NextResponse.redirect(new URL("/login", req.url))
  if (pathname.startsWith("/admin") && role !== "ADMIN")
    return NextResponse.redirect(new URL("/login", req.url))
  if (pathname.startsWith("/instructor") && role !== "INSTRUCTOR")
    return NextResponse.redirect(new URL("/login", req.url))
  if (pathname === "/login" && req.auth) {
    const dest = role === "STUDENT" ? "/student/dashboard"
      : role === "ADVISOR" ? "/advisor/overrides"
      : role === "INSTRUCTOR" ? "/instructor/roster"
      : "/admin/dashboard"
    return NextResponse.redirect(new URL(dest, req.url))
  }
})

export const config = { matcher: ["/((?!api|_next|favicon).*)"] }
