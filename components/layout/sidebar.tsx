"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Package, QrCode, History, Settings, X } from "lucide-react"

interface SidebarProps {
  currentPage: string
  setCurrentPage: (page: string) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

const navigation = [
  { id: "dashboard", name: "Dashboard", icon: LayoutDashboard },
  { id: "materials", name: "Materiais", icon: Package },
  { id: "scanner", name: "Scanner QR", icon: QrCode },
  { id: "movements", name: "Movimentações", icon: History },
  { id: "settings", name: "Configurações", icon: Settings },
]

export function Sidebar({ currentPage, setCurrentPage, sidebarOpen, setSidebarOpen }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="text-xl font-bold">EasyStock</h1>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="p-4 space-y-2">
          {navigation.map((item) => {
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
      </div>
    </>
  )
}
