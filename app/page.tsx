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

type User = {
  id: string
  email: string
  name?: string
  projects?: any[]
}

type Project = {
  id: string
  name: string
  description?: string
}

export default function App() {
  const [currentPage, setCurrentPage] = useState("login")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  
  const { fetchMaterials, fetchMovements, setCurrentProjectId, clearData, setCurrentUserId } = useMaterialStore()

  const handleLogin = (userData: User) => {
    // Validar se o usuário tem dados válidos
    if (userData && userData.id && userData.email) {
      setUser(userData)
      setCurrentPage("projects")
    } else {
      console.error("Dados de usuário inválidos:", userData)
      // Voltar para a página de login em caso de dados inválidos
      setCurrentPage("login")
    }
  }

  const handleSignup = (userData: User) => {
    // Validar se o usuário tem dados válidos
    if (userData && userData.id && userData.email) {
      setUser(userData)
      setCurrentPage("projects")
    } else {
      console.error("Dados de usuário inválidos:", userData)
      // Voltar para a página de login em caso de dados inválidos
      setCurrentPage("login")
    }
  }

  const handleProjectSelected = async (projectId: string) => {
    if (projectId && user) {
      // Encontrar o projeto selecionado
      const project = user.projects?.find(p => p.id === projectId)
      if (project) {
        setSelectedProject(project)
        setCurrentProjectId(projectId)
        setCurrentUserId(user.id)
        
        // Carregar dados do projeto do banco de dados
        try {
          await fetchMaterials(projectId)
          await fetchMovements(projectId)
        } catch (error) {
          console.error("Erro ao carregar dados do projeto:", error)
        }
        
        setCurrentPage("dashboard")
      }
    } else {
      console.error("Projeto inválido ou usuário não autenticado")
      setCurrentPage("projects")
    }
  }

  const handleLogout = () => {
    setUser(null)
    setSelectedProject(null)
    setCurrentPage("login")
    setSidebarOpen(false)
    
    // Limpar dados do store
    clearData()
  }

  const renderPage = () => {
    switch (currentPage) {
      case "login":
        return <Login onLogin={handleLogin} goToSignup={() => setCurrentPage("signup")} />
      case "signup":
        return <Signup onSignup={handleSignup} goToLogin={() => setCurrentPage("login")} />
      case "projects":
        return user ? (
          <ProjectSelection user={user} onSelectProject={handleProjectSelected} />
        ) : (
          <div className="text-center mt-12">
            <p className="text-red-600">Usuário não autenticado</p>
            <button 
              onClick={() => setCurrentPage("login")} 
              className="mt-4 px-4 py-2 bg-primary text-white rounded"
            >
              Voltar ao Login
            </button>
          </div>
        )
      case "dashboard":
        return user && selectedProject ? (
          <Dashboard setCurrentPage={setCurrentPage} />
        ) : (
          <div className="text-center mt-12">
            <p className="text-red-600">Usuário não autenticado ou projeto não selecionado</p>
            <button 
              onClick={() => setCurrentPage("projects")} 
              className="mt-4 px-4 py-2 bg-primary text-white rounded"
            >
              Selecionar Projeto
            </button>
          </div>
        )
      case "materials":
        return user && selectedProject ? (
          <Materials />
        ) : (
          <div className="text-center mt-12">
            <p className="text-red-600">Usuário não autenticado ou projeto não selecionado</p>
            <button 
              onClick={() => setCurrentPage("projects")} 
              className="mt-4 px-4 py-2 bg-primary text-white rounded"
            >
              Selecionar Projeto
            </button>
          </div>
        )
      case "scanner":
        return user && selectedProject ? (
          <QRScanner />
        ) : (
          <div className="text-center mt-12">
            <p className="text-red-600">Usuário não autenticado ou projeto não selecionado</p>
            <button 
              onClick={() => setCurrentPage("projects")} 
              className="mt-4 px-4 py-2 bg-primary text-white rounded"
            >
              Selecionar Projeto
            </button>
          </div>
        )
      case "movements":
        return user && selectedProject ? (
          <Movements />
        ) : (
          <div className="text-center mt-12">
            <p className="text-red-600">Usuário não autenticado ou projeto não selecionado</p>
            <button 
              onClick={() => setCurrentPage("projects")} 
              className="mt-4 px-4 py-2 bg-primary text-white rounded"
            >
              Selecionar Projeto
            </button>
          </div>
        )
      case "settings":
        return user && selectedProject ? (
          <Settings />
        ) : (
          <div className="text-center mt-12">
            <p className="text-red-600">Usuário não autenticado ou projeto não selecionado</p>
            <button 
              onClick={() => setCurrentPage("projects")} 
              className="mt-4 px-4 py-2 bg-primary text-white rounded"
            >
              Selecionar Projeto
            </button>
          </div>
        )
      default:
        return user && selectedProject ? (
          <Dashboard setCurrentPage={setCurrentPage} />
        ) : (
          <div className="text-center mt-12">
            <p className="text-red-600">Usuário não autenticado ou projeto não selecionado</p>
            <button 
              onClick={() => setCurrentPage("projects")} 
              className="mt-4 px-4 py-2 bg-primary text-white rounded"
            >
              Selecionar Projeto
            </button>
          </div>
        )
    }
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <div className="flex h-screen bg-background">
          {user && selectedProject && currentPage !== "login" && currentPage !== "signup" && currentPage !== "projects" ? (
            <>
              <Sidebar
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                onLogout={handleLogout}
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