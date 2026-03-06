"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { DashboardWrapper } from "./components/dashboard-wrapper"
import "../globals.css";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    // Only redirect if we are DEFINITIVELY not logged in
    if (status === "unauthenticated") {
      router.replace("/")
    }
  }, [status, router])

  // STOP THE LOOP: 
  // Do not render the Dashboard UI or children while checking the session
  if (status === "loading") {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-white">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    )
  }

  // If we have no session, return null (the useEffect above handles the redirect)
  if (!session) return null

  return (
    <SidebarProvider>
      <DashboardWrapper />
      <main>
        {children}
      </main>
    </SidebarProvider>
  )
}