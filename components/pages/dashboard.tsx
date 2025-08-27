"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Package, AlertTriangle, TrendingUp, Plus, QrCode, FileText } from "lucide-react"
import { useMaterialStore } from "@/lib/stores/material-store"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { MaterialForm } from "@/components/forms/material-form"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface DashboardProps {
  setCurrentPage: (page: string) => void
}

export function Dashboard({ setCurrentPage }: DashboardProps) {
  const { materials, movements } = useMaterialStore()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const totalMaterials = materials.length
  const lowStockMaterials = materials.filter((m) => m.quantity <= m.minStock).length
  const recentMovements = movements.slice(0, 5)
  const totalValue = materials.reduce((sum, m) => sum + m.price * m.quantity, 0)

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Materiais</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMaterials}</div>
            <p className="text-xs text-muted-foreground">+2 desde ontem</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lowStockMaterials}</div>
            <p className="text-xs text-muted-foreground">Requer atenção</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Em estoque</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Movimentações</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{movements.length}</div>
            <p className="text-xs text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="h-20 flex flex-col gap-2">
                  <Plus className="h-6 w-6" />
                  Adicionar Material
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Material</DialogTitle>
                </DialogHeader>
                <MaterialForm onSuccess={() => setIsAddDialogOpen(false)} />
              </DialogContent>
            </Dialog>
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2 bg-transparent"
              onClick={() => setCurrentPage("scanner")}
            >
              <QrCode className="h-6 w-6" />
              Escanear QR
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2 bg-transparent"
              onClick={() => setCurrentPage("movements")}
            >
              <FileText className="h-6 w-6" />
              Relatórios
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Materials */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Materiais com Estoque Baixo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <TooltipProvider>
                {materials
                  .filter((m) => m.quantity <= m.minStock)
                  .slice(0, 5)
                  .map((material) => (
                    <Tooltip key={material.id}>
                      <TooltipTrigger asChild>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{material.name}</p>
                            <p className="text-sm text-muted-foreground">{material.category}</p>
                          </div>
                          <Badge variant="destructive">
                            {material.quantity} {material.unit}
                          </Badge>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Qtde: {material.quantity} | Estoque mínimo: {material.minStock}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
              </TooltipProvider>
              {materials.filter((m) => m.quantity <= m.minStock).length === 0 && (
                <p className="text-muted-foreground text-center py-4">Nenhum material com estoque baixo</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Movimentações Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentMovements.map((movement) => (
                <div key={movement.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{movement.materialName}</p>
                    <p className="text-sm text-muted-foreground">
                      {movement.actionType === "entrada" ? "Entrada" : "Saída"} - {movement.location}
                    </p>
                  </div>
                  <Badge variant={movement.actionType === "entrada" ? "default" : "secondary"}>
                    {movement.actionType === "entrada" ? "+" : "-"}
                    {movement.quantity}
                  </Badge>
                </div>
              ))}
              {recentMovements.length === 0 && (
                <p className="text-muted-foreground text-center py-4">Nenhuma movimentação recente</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}