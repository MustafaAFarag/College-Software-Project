import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import "react-toastify/dist/ReactToastify.css"
import { SessionProvider } from "next-auth/react"
import { ToastContainer } from "react-toastify"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: "UniReg — Alexandria University",
  description: "Course Registration System",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body style={{ fontFamily: "var(--font-inter), system-ui" }}>
        <SessionProvider>
          {children}
          <ToastContainer
            position="bottom-right"
            autoClose={3000}
            hideProgressBar={false}
            closeOnClick
            pauseOnHover
            theme="dark"
            toastStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-primary)", fontSize: "13px" }}
          />
        </SessionProvider>
      </body>
    </html>
  )
}
