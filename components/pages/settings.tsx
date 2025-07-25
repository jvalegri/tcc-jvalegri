"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Download, Upload, Trash2, Info, Database } from "lucide-react"
import { useMaterialStore } from "@/lib/stores/material-store"
import { useToast } from "@/hooks/use-toast"

export function Settings() {
  const { materials, movements, clearAllData, importData } = useMaterialStore()
  const { toast } = useToast()
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  const exportData = async () => {
    setIsExporting(true)

    const data = {
      materials,
      movements,
      exportDate: new Date().toISOString(),
      version: "1.0",
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `material-manager-backup-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    window.URL.revokeObjectURL(url)

    setTimeout(() => {
      setIsExporting(false)
      toast({
        title: "Backup criado",
        description: "Dados exportados com sucesso!",
      })
    }, 1000)
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)

        if (data.materials && data.movements) {
          importData(data.materials, data.movements)
          toast({
            title: "Dados importados",
            description: "Backup restaurado com sucesso!",
          })
        } else {
          throw new Error("Formato de arquivo inválido")
        }
      } catch (error) {
        toast({
          title: "Erro na importação",
          description: "Arquivo inválido ou corrompido.",
          variant: "destructive",
        })
      } finally {
        setIsImporting(false)
      }
    }

    reader.readAsText(file)
    event.target.value = ""
  }

  const handleClearData = () => {
    if (window.confirm("Tem certeza que deseja apagar todos os dados? Esta ação não pode ser desfeita.")) {
      clearAllData()
      toast({
        title: "Dados apagados",
        description: "Todos os dados foram removidos do sistema.",
        variant: "destructive",
      })
    }
  }

  const getStorageSize = () => {
    const data = JSON.stringify({ materials, movements })
    return (new Blob([data]).size / 1024).toFixed(2) + " KB"
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Configurações</h1>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Gerenciamento de Dados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Exportar Dados</Label>
              <p className="text-sm text-muted-foreground mb-2">Faça backup de todos os materiais e movimentações</p>
              <Button onClick={exportData} disabled={isExporting} className="w-full">
                <Download className="mr-2 h-4 w-4" />
                {isExporting ? "Exportando..." : "Exportar JSON"}
              </Button>
            </div>

            <div>
              <Label>Importar Dados</Label>
              <p className="text-sm text-muted-foreground mb-2">Restaure dados de um arquivo de backup</p>
              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isImporting}
                />
                <Button variant="outline" className="w-full bg-transparent" disabled={isImporting}>
                  <Upload className="mr-2 h-4 w-4" />
                  {isImporting ? "Importando..." : "Importar JSON"}
                </Button>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-red-600">Zona de Perigo</Label>
                <p className="text-sm text-muted-foreground">Apagar todos os dados do sistema</p>
              </div>
              <Button variant="destructive" onClick={handleClearData}>
                <Trash2 className="mr-2 h-4 w-4" />
                Apagar Tudo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Informações do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Versão:</span>
                <Badge>1.0.0</Badge>
              </div>
              <div className="flex justify-between">
                <span>Materiais Cadastrados:</span>
                <Badge variant="outline">{materials.length}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Movimentações:</span>
                <Badge variant="outline">{movements.length}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Armazenamento Local:</span>
                <Badge variant="outline">{getStorageSize()}</Badge>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Última Atualização:</span>
                <span className="text-sm text-muted-foreground">{new Date().toLocaleDateString("pt-BR")}</span>
              </div>
              <div className="flex justify-between">
                <span>Tipo de Armazenamento:</span>
                <span className="text-sm text-muted-foreground">localStorage</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <Badge className="bg-green-500">Online</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle>Sobre o Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong>Material Manager</strong> é um sistema de gerenciamento de materiais desenvolvido para projetos de
              design de interiores.
            </p>
            <p>
              O sistema utiliza armazenamento local do navegador para persistir os dados, não sendo necessário conexão
              com internet para funcionamento básico.
            </p>
            <p>
              Funcionalidades incluem: cadastro de materiais, controle de estoque, scanner QR, histórico de
              movimentações e relatórios.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
