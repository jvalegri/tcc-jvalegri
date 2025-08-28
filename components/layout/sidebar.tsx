"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Package, QrCode, History, X, LogOut, User, Users, FolderOpen } from "lucide-react"
import { UserRole } from "@/lib/types"

interface SidebarProps {
  currentPage: string
  setCurrentPage: (page: string) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  onLogout: () => void
  currentUserRole?: UserRole
  projectName?: string
  onBackToProjects?: () => void
}

const navigation = [
  { id: "dashboard", name: "Dashboard", icon: LayoutDashboard, roles: ["GESTOR", "COLABORADOR"] },
  { id: "materials", name: "Materiais", icon: Package, roles: ["GESTOR", "COLABORADOR"] },
  { id: "scanner", name: "Scanner QR", icon: QrCode, roles: ["GESTOR", "COLABORADOR"] },
  { id: "movements", name: "Movimentações", icon: History, roles: ["GESTOR", "COLABORADOR"] },
  { id: "users", name: "Gestão de Usuários", icon: Users, roles: ["GESTOR"] },
]

export function Sidebar({ currentPage, setCurrentPage, sidebarOpen, setSidebarOpen, onLogout, currentUserRole, projectName, onBackToProjects }: SidebarProps) {
  const filteredNavigation = navigation.filter(item => 
    !currentUserRole || item.roles.includes(currentUserRole)
  )

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 flex flex-col",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold">EasyStock</h1>
            {projectName && (
              <p className="text-sm text-muted-foreground font-medium truncate">
                {projectName}
              </p>
            )}
          </div>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 flex-1">
          {filteredNavigation.map((item) => {
            const Icon = item.icon
            return (
              <Button
                key={item.id}
                variant={currentPage === item.id ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => {
                  setCurrentPage(item.id)
                  setSidebarOpen(false)
                }}
              >
                <Icon className="mr-2 h-4 w-4" />
                {item.name}
              </Button>
            )
          })}
        </nav>

        {/* Profile and Logout Buttons - Fixed at bottom */}
        <div className="p-4 border-t space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => {
              setCurrentPage("profile")
              setSidebarOpen(false)
            }}
          >
            <User className="mr-2 h-4 w-4" />
            Perfil
          </Button>
          
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => {
              onBackToProjects?.()
              setSidebarOpen(false)
            }}
          >
            <FolderOpen className="mr-2 h-4 w-4" />
            Meus Projetos
          </Button>
          
          <Button
            variant="outline"
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={onLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </div>
    </>
  )
}
