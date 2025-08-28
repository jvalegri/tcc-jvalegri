"use client"

import { Button } from "@/components/ui/button"
import { Menu, Sun, Moon, Building2 } from "lucide-react"
import { useTheme } from "next-themes"

interface HeaderProps {
  currentPage: string
  setSidebarOpen: (open: boolean) => void
  projectName?: string
}

const pageNames: Record<string, string> = {
  dashboard: "Dashboard",
  materials: "Materiais",
  scanner: "Scanner QR",
  movements: "Movimentações",
  profile: "Perfil",
  users: "Gestão de Usuários",
}

export function Header({ currentPage, setSidebarOpen, projectName }: HeaderProps) {
  const { theme, setTheme } = useTheme()

  return (
    <header className="bg-card border-b px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(true)}>
          <Menu className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-3">
          {/* Nome do Projeto */}
          {projectName && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span className="text-sm font-medium">{projectName}</span>
              <span className="text-muted-foreground">•</span>
            </div>
          )}
          
          {/* Nome da Página */}
          <h2 className="text-lg font-semibold">{pageNames[currentPage as keyof typeof pageNames]}</h2>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </div>
    </header>
  )
}
