import { Suspense } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { FloatingAssistant } from "@/components/dashboard/floating-assistant"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64">
        <Header />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
      <Suspense fallback={null}>
        <FloatingAssistant />
      </Suspense>
    </div>
  )
}
