"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Dashboard } from "@/components/pages/dashboard"
import { Materials } from "@/components/pages/materials"
import { QRScanner } from "@/components/pages/qr-scanner"
import { Movements } from "@/components/pages/movements"
import { Settings } from "@/components/pages/settings"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { useMaterialStore } from "@/lib/stores/material-store"

export default function App() {
  const [currentPage, setCurrentPage] = useState("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { initializeData } = useMaterialStore()

  useEffect(() => {
    initializeData()
  }, [initializeData])

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />
      case "materials":
        return <Materials />
      case "scanner":
        return <QRScanner />
      case "movements":
        return <Movements />
      case "settings":
        return <Settings />
      default:
        return <Dashboard />
    }
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="flex h-screen bg-background">
        <Sidebar
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header currentPage={currentPage} setSidebarOpen={setSidebarOpen} />

          <main className="flex-1 overflow-auto p-4 md:p-6">{renderPage()}</main>
        </div>
      </div>
      <Toaster />
    </ThemeProvider>
  )
}
