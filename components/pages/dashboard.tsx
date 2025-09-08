"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Package, AlertTriangle, Plus, QrCode, FileText } from "lucide-react"
import { useMaterialStore } from "@/lib/stores/material-store"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { MobileDialog, MobileDialogContent, MobileDialogHeader, MobileDialogTitle, MobileDialogTrigger } from "@/components/ui/mobile-dialog"
import { MaterialForm } from "@/components/forms/material-form"
import { MaterialDashboardCharts } from "@/components/charts/material-dashboard-charts"
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
  const [daysFilter, setDaysFilter] = useState(7) // Padrão: últimos 7 dias

  // Filtrar movimentações por período
  const filteredMovements = movements.filter(movement => {
    if (!movement.timestamp) return false
    try {
      const movementDate = new Date(movement.timestamp)
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysFilter)
      return movementDate >= cutoffDate
    } catch (error) {
      console.warn('Data inválida encontrada:', movement.timestamp)
      return false
    }
  })

  const recentMovements = filteredMovements.slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Dashboard Visual com Gráficos */}
      <MaterialDashboardCharts materials={materials} movements={movements} />

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MobileDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <MobileDialogTrigger asChild>
                <Button className="h-20 flex flex-col gap-2">
                  <Plus className="h-6 w-6" />
                  Adicionar Material
                </Button>
              </MobileDialogTrigger>
              <MobileDialogContent className="max-w-2xl flex flex-col">
                <div className="flex-shrink-0 p-6 pb-4 border-b">
                  <MobileDialogHeader>
                    <MobileDialogTitle>Adicionar Novo Material</MobileDialogTitle>
                  </MobileDialogHeader>
                </div>
                <div className="flex-1 overflow-y-auto p-6 pt-4">
                  <MaterialForm onSuccess={() => setIsAddDialogOpen(false)} />
                </div>
              </MobileDialogContent>
            </MobileDialog>

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
                  .filter((m) => (m.quantity || 0) <= (m.minStock || 0))
                  .slice(0, 5)
                  .map((material) => (
                    <Tooltip key={material.id}>
                      <TooltipTrigger asChild>
                        <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 cursor-help transition-colors">
                          <div>
                            <p className="font-medium">{material.name}</p>
                            <p className="text-sm text-muted-foreground">{material.category}</p>
                          </div>
                          <Badge variant="destructive">
                            {material.quantity} {material.unit}
                          </Badge>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs p-3">
                        <div className="space-y-2">
                          <div className="font-semibold text-amber-700 dark:text-amber-300">
                            ⚠️ Estoque Baixo
                          </div>
                          <div className="text-sm space-y-1">
                            <div className="flex justify-between">
                              <span className="font-medium">Material:</span>
                              <span>{material.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Quantidade Atual:</span>
                              <span className="text-red-600 font-semibold">
                                {material.quantity} {material.unit}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Estoque Mínimo:</span>
                              <span className="text-amber-600 font-semibold">
                                {material.minStock} {material.unit}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Deficit:</span>
                              <span className="text-red-600 font-semibold">
                                {Math.max(0, (material.minStock || 0) - (material.quantity || 0))} {material.unit}
                              </span>
                            </div>
                            {(material.price || 0) > 0 && (
                              <div className="flex justify-between">
                                <span className="font-medium">Preço Unitário:</span>
                                <span className="text-green-600 font-semibold">
                                  R$ {(material.price || 0).toFixed(2)}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground pt-1 border-t">
                            Considere fazer um novo pedido
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ))}
              </TooltipProvider>
              {materials.filter((m) => (m.quantity || 0) <= (m.minStock || 0)).length === 0 && (
                <p className="text-muted-foreground text-center py-4">Nenhum material com estoque baixo</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Movimentações Recentes</CardTitle>
              <select 
                value={daysFilter} 
                onChange={(e) => setDaysFilter(Number(e.target.value))}
                className="px-3 py-1 text-sm border rounded-md bg-background"
              >
                <option value={1}>Último dia</option>
                <option value={7}>Últimos 7 dias</option>
                <option value={30}>Últimos 30 dias</option>
                <option value={90}>Últimos 90 dias</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentMovements.map((movement) => (
                <div key={movement.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{movement.materialName || 'Material'}</p>
                    <p className="text-sm text-muted-foreground">
                      {movement.actionType === "entrada" ? "Entrada" : "Saída"} - {movement.location || 'Local'}
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