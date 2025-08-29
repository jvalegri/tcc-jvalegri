"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, FileText, Mail } from "lucide-react"
import { useMaterialStore } from "@/lib/stores/material-store"
import { useToast } from "@/hooks/use-toast"

export function Movements() {
  const { movements } = useMaterialStore()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState("")


  const filteredMovements = movements.filter((movement) => {
    const matchesSearch =
      (movement.materialName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (movement.location?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (movement.type?.toLowerCase().includes(searchTerm.toLowerCase()) || false)

    const matchesDate = !dateFilter || new Date(movement.timestamp).toISOString().split("T")[0] === dateFilter

    return matchesSearch && matchesDate
  })

  const exportToCSV = () => {
    const headers = ["Data", "Material", "Categoria", "Tipo", "Quantidade", "Local", "Justificativa"]
    const csvContent = [
      headers.join(","),
      ...filteredMovements.map((m) =>
        [
          new Date(m.timestamp).toLocaleDateString("pt-BR"),
          m.materialName,
          m.materialType,
          m.actionType === "entrada" ? "Entrada" : "Saída",
          m.quantity,
          m.location,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `movimentacoes_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: "Exportação concluída",
      description: "Arquivo CSV baixado com sucesso!",
    })
  }

  const exportToTXT = () => {
    const txtContent = filteredMovements
      .map(
        (m) =>
          `Data: ${new Date(m.timestamp).toLocaleDateString("pt-BR")}\n` +
          `Material: ${m.materialName}\n` +
          `Categoria: ${m.materialType}\n` +
          `Tipo: ${m.actionType === "entrada" ? "Entrada" : "Saída"}\n` +
          `Quantidade: ${m.quantity}\n` +
          `Local: ${m.location}\n` +
          `${"=".repeat(50)}\n`,
      )
      .join("\n")

    const blob = new Blob([txtContent], { type: "text/plain" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `relatorio_movimentacoes_${new Date().toISOString().split("T")[0]}.txt`
    a.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: "Relatório exportado",
      description: "Arquivo TXT baixado com sucesso!",
    })
  }

  const sendByEmail = () => {
    // Simular envio por email
    toast({
      title: "Email enviado",
      description: "Relatório enviado para seu email com sucesso! (simulado)",
    })
  }

  const materialSummary = movements.reduce(
    (acc, movement) => {
      const key = movement.materialName || "Material Desconhecido"
      if (!acc[key]) {
        acc[key] = { entrada: 0, saida: 0, total: 0 }
      }
      if (movement.actionType === "entrada") {
        acc[key].entrada += movement.quantity
      } else {
        acc[key].saida += movement.quantity
      }
      acc[key].total = acc[key].entrada - acc[key].saida
      return acc
    },
    {} as Record<string, { entrada: number; saida: number; total: number }>,
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h1 className="text-2xl font-bold">Movimentações</h1>

        <div className="flex gap-2">
          <Button onClick={exportToCSV} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            CSV
          </Button>
          <Button onClick={exportToTXT} variant="outline" size="sm">
            <FileText className="mr-2 h-4 w-4" />
            TXT
          </Button>
          <Button onClick={sendByEmail} variant="outline" size="sm">
            <Mail className="mr-2 h-4 w-4" />
            Email
          </Button>
        </div>
      </div>

      <Tabs defaultValue="history" className="space-y-4">
        <TabsList>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <Input
                  placeholder="Buscar por material, local ou justificativa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full md:w-auto"
                />
              </div>
            </CardContent>
          </Card>

          {/* Movements Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Material</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Local</TableHead>
                      <TableHead>Justificativa</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMovements.map((movement) => (
                      <TableRow key={movement.id}>
                        <TableCell>{new Date(movement.timestamp).toLocaleDateString("pt-BR")}</TableCell>
                        <TableCell className="font-medium">{movement.materialName || "N/A"}</TableCell>
                        <TableCell>{movement.materialType || "N/A"}</TableCell>
                        <TableCell>
                          <Badge variant={movement.actionType === "entrada" ? "default" : "secondary"}>
                            {movement.actionType === "entrada" ? "Entrada" : "Saída"}
                          </Badge>
                        </TableCell>
                        <TableCell>{movement.quantity}</TableCell>
                        <TableCell>{movement.location || "N/A"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredMovements.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">Nenhuma movimentação encontrada</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Summary by Material */}
            <Card>
              <CardHeader>
                <CardTitle>Resumo por Material</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(materialSummary).map(([material, data]) => (
                    <div key={material} className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <p className="font-medium">{material}</p>
                        <p className="text-sm text-muted-foreground">
                          Entrada: {data.entrada} | Saída: {data.saida}
                        </p>
                      </div>
                      <Badge variant={data.total >= 0 ? "default" : "destructive"}>
                        {data.total >= 0 ? "+" : ""}
                        {data.total}
                      </Badge>
                    </div>
                  ))}
                  {Object.keys(materialSummary).length === 0 && (
                    <p className="text-muted-foreground text-center py-4">Nenhuma movimentação registrada</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total de Movimentações:</span>
                    <span className="font-bold">{movements.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Entradas:</span>
                    <span className="font-bold text-green-600">
                      {movements.filter((m) => m.actionType === "entrada").length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saídas:</span>
                    <span className="font-bold text-red-600">
                      {movements.filter((m) => m.actionType === "saída").length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Materiais Únicos:</span>
                    <span className="font-bold">{new Set(movements.map((m) => m.materialId)).size}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
