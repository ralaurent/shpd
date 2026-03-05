// import { GeistSans } from "geist/font/sans"; 
import { SidebarProvider } from "@/components/ui/sidebar"
import { DashboardWrapper } from "./components/dashboard-wrapper"
import "../globals.css";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <DashboardWrapper />
      <main>
        {children}
      </main>
    </SidebarProvider>
  )
}