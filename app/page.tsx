"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Dashboard } from "@/components/pages/dashboard"
import { Materials } from "@/components/pages/materials"
import { QRScanner } from "@/components/pages/qr-scanner"
import { Movements } from "@/components/pages/movements"
import { Profile } from "@/components/pages/profile"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { useMaterialStore } from "@/lib/stores/material-store"
import { TooltipProvider } from "@/components/ui/tooltip"
import Signup from "@/components/pages/signup"
import ProjectSelection from "@/components/pages/project-selection"
import Login from "@/components/pages/login"
import { UserManagement } from "@/components/pages/user-management"
import { DataManagement } from "@/components/pages/data-management"
import { UserRole } from "@/lib/types"

type User = {
  id: string
  email: string
  name?: string
  projects?: Project[]
  role?: string
  projectRole?: string
  createdAt?: string
  lastLogin?: string
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
  const [isInitialized, setIsInitialized] = useState(false)
  
  const { fetchMaterials, fetchMovements, setCurrentProjectId, clearData, setCurrentUserId } = useMaterialStore()

  // Inicializar estado do localStorage
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log("Inicializando app...")
        const savedUser = localStorage.getItem('user')
        const savedProject = localStorage.getItem('selectedProject')
        const savedPage = localStorage.getItem('currentPage')

        console.log("Dados salvos:", { savedUser: !!savedUser, savedProject: !!savedProject, savedPage })

        if (savedUser) {
          const userData = JSON.parse(savedUser)
          console.log("Usuário encontrado:", userData.email)
          setUser(userData)
          
          if (savedProject) {
            const projectData = JSON.parse(savedProject)
            console.log("Projeto encontrado:", projectData.name)
            setSelectedProject(projectData)
            setCurrentProjectId(projectData.id)
            setCurrentUserId(userData.id)
            
            // Recarregar dados do projeto
            try {
              await fetchMaterials(projectData.id)
              await fetchMovements(projectData.id)
              console.log("Dados do projeto recarregados")
            } catch (error) {
              console.error("Erro ao recarregar dados do projeto:", error)
            }
          }
          
          // Definir página baseada no que estava salvo
          if (savedPage && savedPage !== "login" && savedPage !== "signup") {
            console.log("Restaurando página:", savedPage)
            setCurrentPage(savedPage)
          } else if (savedProject) {
            console.log("Indo para dashboard")
            setCurrentPage("dashboard")
          } else {
            console.log("Indo para projetos")
            setCurrentPage("projects")
          }
        } else {
          console.log("Nenhum usuário salvo, indo para login")
          setCurrentPage("login")
        }
      } catch (error) {
        console.error("Erro ao inicializar app:", error)
        // Em caso de erro, limpar localStorage e ir para login
        localStorage.removeItem('user')
        localStorage.removeItem('selectedProject')
        localStorage.removeItem('currentPage')
        setCurrentPage("login")
      } finally {
        setIsInitialized(true)
        console.log("Inicialização concluída")
      }
    }

    initializeApp()
  }, [fetchMaterials, fetchMovements, setCurrentProjectId, setCurrentUserId])

  // Salvar estado no localStorage quando mudar
  useEffect(() => {
    if (isInitialized) {
      if (user) {
        localStorage.setItem('user', JSON.stringify(user))
      } else {
        localStorage.removeItem('user')
      }
    }
  }, [user, isInitialized])

  useEffect(() => {
    if (isInitialized) {
      if (selectedProject) {
        localStorage.setItem('selectedProject', JSON.stringify(selectedProject))
      } else {
        localStorage.removeItem('selectedProject')
      }
    }
  }, [selectedProject, isInitialized])

  useEffect(() => {
    if (isInitialized && currentPage !== "login" && currentPage !== "signup") {
      localStorage.setItem('currentPage', currentPage)
    }
  }, [currentPage, isInitialized])

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
      console.log("Projeto selecionado:", projectId)
      console.log("Projetos disponíveis:", user.projects)
      
      // Encontrar o projeto selecionado
      let project = user.projects?.find((p: Project) => p.id === projectId)
      
      // Se não encontrar no array local, buscar do banco
      if (!project) {
        try {
          console.log("Projeto não encontrado localmente, buscando do banco...")
          const response = await fetch(`/api/auth/projects?userId=${user.id}`)
          if (response.ok) {
            const projects = await response.json()
            project = projects.find((p: Project) => p.id === projectId)
            
            // Atualizar o array local de projetos
            if (project) {
              setUser(prev => prev ? { ...prev, projects } : null)
            }
          }
        } catch (error) {
          console.error("Erro ao buscar projeto do banco:", error)
        }
      }
      
      if (project) {
        console.log("Projeto encontrado:", project)
        setSelectedProject(project)
        setCurrentProjectId(projectId)
        setCurrentUserId(user.id)
        
        // Buscar o role do usuário neste projeto específico
        try {
          console.log("Buscando role do usuário no projeto...")
          const membersResponse = await fetch(`/api/projects/${projectId}/members`)
          if (membersResponse.ok) {
            const members = await membersResponse.json()
            const userMember = members.find((m: any) => m.userId === user.id)
            
            if (userMember) {
              console.log("Role do usuário no projeto:", userMember.role)
              // Atualizar o usuário com o role correto para este projeto
              setUser(prev => prev ? { 
                ...prev, 
                projectRole: userMember.role // Role específico do projeto
              } : null)
            }
          }
        } catch (error) {
          console.error("Erro ao buscar role do usuário no projeto:", error)
        }
        
        // Carregar dados do projeto do banco de dados
        try {
          await fetchMaterials(projectId)
          await fetchMovements(projectId)
        } catch (error) {
          console.error("Erro ao carregar dados do projeto:", error)
        }
        
        setCurrentPage("dashboard")
      } else {
        console.error("Projeto não encontrado:", projectId)
        setCurrentPage("projects")
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
    
    // Limpar localStorage
    localStorage.removeItem('user')
    localStorage.removeItem('selectedProject')
    localStorage.removeItem('currentPage')
    
    // Limpar dados do store
    clearData()
  }

  const handleBackToProjects = () => {
    setCurrentPage("projects")
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
      case "profile":
        return user && selectedProject ? (
          <Profile 
            user={{
              id: user.id,
              name: user.name || "",
              email: user.email,
              role: user.projectRole || user.role || "COLABORADOR", // Usar o role correto do projeto
              createdAt: new Date().toISOString(),
              lastLogin: new Date().toISOString()
            }}
            onUpdateProfile={(updatedProfile: any) => {
              // Atualizar dados do usuário local
              setUser(prev => prev ? { ...prev, ...updatedProfile } : null)
            }}
          />
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
      case "users":
        return user && selectedProject ? (
          <UserManagement 
            projectId={selectedProject.id}
            currentUserRole={(user.projectRole || user.role || "COLABORADOR") as UserRole}
            currentUserId={user.id}
          />
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
      case "data-management":
        return user && selectedProject ? (
          <DataManagement />
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
        return (
          <div className="text-center mt-12">
            <p className="text-red-600">Página não encontrada</p>
            <button 
              onClick={() => setCurrentPage("dashboard")} 
              className="mt-4 px-4 py-2 bg-primary text-white rounded"
            >
              Voltar ao Dashboard
            </button>
          </div>
        )
    }
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <div className="flex h-screen bg-background">
          {!isInitialized ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Carregando...</p>
              </div>
            </div>
          ) : user && selectedProject && currentPage !== "login" && currentPage !== "signup" && currentPage !== "projects" ? (
            <>
              <Sidebar
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                onLogout={handleLogout}
                onBackToProjects={handleBackToProjects}
                currentUserRole={(user.projectRole || user.role || "COLABORADOR") as UserRole}
                projectName={selectedProject?.name}
              />

              <div className="flex-1 flex flex-col overflow-hidden">
                <Header 
                  currentPage={currentPage} 
                  setSidebarOpen={setSidebarOpen}
                  projectName={selectedProject?.name}
                />
                <main className="flex-1 overflow-auto p-4 md:p-6">{renderPage()}</main>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              <main className="flex-1 overflow-auto p-4 md:p-6">{renderPage()}</main>
            </div>
          )}
        </div>
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  )
}