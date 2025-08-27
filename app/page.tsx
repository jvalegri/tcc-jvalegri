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
import { TooltipProvider } from "@/components/ui/tooltip"
import Signup from "@/components/pages/signup"
import ProjectSelection from "@/components/pages/project-selection"
import Login from "@/components/pages/login"


export default function App() {
  const [currentPage, setCurrentPage] = useState("login")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { initializeData } = useMaterialStore()
  const [user, setUser] = useState<{ email: string; name?: string } | null>(null)

  useEffect(() => {
    initializeData()
  }, [initializeData])

  const handleLogin = (userData: { email: string; name?: string }) => {
    setUser(userData)
    setCurrentPage("projects")
  }

  const handleSignup = (userData: { email: string; name?: string }) => {
    setUser(userData)
    setCurrentPage("projects")
  }

  const handleProjectSelected = (projectId: string) => {
    setCurrentPage("dashboard")
  }

  const renderPage = () => {
    switch (currentPage) {
      case "login":
        return <Login onLogin={handleLogin} goToSignup={() => setCurrentPage("signup")} />
      case "signup":
        return <Signup onSignup={handleSignup} goToLogin={() => setCurrentPage("login")} />
      case "projects":
        return <ProjectSelection user={user} onSelectProject={handleProjectSelected} />
      case "dashboard":
        return <Dashboard setCurrentPage={setCurrentPage} />
      case "materials":
        return <Materials />
      case "scanner":
        return <QRScanner />
      case "movements":
        return <Movements />
      case "settings":
        return <Settings />
      default:
        return <Dashboard setCurrentPage={setCurrentPage} />
    }
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <div className="flex h-screen bg-background">
          {user && currentPage !== "login" && currentPage !== "signup" && currentPage !== "projects" ? (
            <>
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
            </>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              <main className="flex-1 overflow-auto p-4 md:p-6">{renderPage()}</main>
            </div>
          )}
        </div>
      </TooltipProvider>
      <Toaster />
    </ThemeProvider>
  )
}