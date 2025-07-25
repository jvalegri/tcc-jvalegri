"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MaterialForm } from "@/components/forms/material-form"
import { MoreHorizontal, Eye, QrCode, Edit, Download, Trash2 } from "lucide-react"
import { useMaterialStore } from "@/lib/stores/material-store"
import { useToast } from "@/hooks/use-toast"
import type { Material } from "@/lib/types"
import QRCode from "qrcode"

interface MaterialActionsProps {
  material: Material
}

export function MaterialActions({ material }: MaterialActionsProps) {
  const { deleteMaterial } = useMaterialStore()
  const { toast } = useToast()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)

  const handleDelete = () => {
    if (window.confirm(`Tem certeza que deseja excluir "${material.name}"?`)) {
      deleteMaterial(material.id)
      toast({
        title: "Material excluído",
        description: "Material foi removido com sucesso!",
        variant: "destructive",
      })
    }
  }

  const generateQRCode = async () => {
    try {
      const qrDataURL = await QRCode.toDataURL(material.id)
      const link = document.createElement("a")
      link.download = `qr-${material.name.replace(/\s+/g, "-").toLowerCase()}.png`
      link.href = qrDataURL
      link.click()

      toast({
        title: "QR Code gerado",
        description: "QR Code do material foi baixado com sucesso!",
      })
    } catch (error) {
      toast({
        title: "Erro ao gerar QR Code",
        description: "Não foi possível gerar o QR Code.",
        variant: "destructive",
      })
    }
  }

  const exportMaterial = () => {
    const data = {
      ...material,
      exportDate: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `material-${material.name.replace(/\s+/g, "-").toLowerCase()}.json`
    a.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: "Material exportado",
      description: "Dados do material foram exportados com sucesso!",
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsDetailsDialogOpen(true)}>
            <Eye className="mr-2 h-4 w-4" />
            Ver Detalhes
          </DropdownMenuItem>
          <DropdownMenuItem onClick={generateQRCode}>
            <QrCode className="mr-2 h-4 w-4" />
            Gerar QR Code
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={exportMaterial}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDelete} className="text-red-600">
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Material</DialogTitle>
          </DialogHeader>
          <MaterialForm material={material} onSuccess={() => setIsEditDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Material</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold">Nome</h4>
                <p>{material.name}</p>
              </div>
              <div>
                <h4 className="font-semibold">Categoria</h4>
                <p>{material.category}</p>
              </div>
              <div>
                <h4 className="font-semibold">Fornecedor</h4>
                <p>{material.supplier}</p>
              </div>
              <div>
                <h4 className="font-semibold">Quantidade</h4>
                <p>
                  {material.quantity} {material.unit}
                </p>
              </div>
              <div>
                <h4 className="font-semibold">Preço Unitário</h4>
                <p>R$ {material.price.toFixed(2)}</p>
              </div>
              <div>
                <h4 className="font-semibold">Valor Total</h4>
                <p>R$ {(material.price * material.quantity).toFixed(2)}</p>
              </div>
              <div>
                <h4 className="font-semibold">Estoque Mínimo</h4>
                <p>
                  {material.minStock} {material.unit}
                </p>
              </div>
              <div>
                <h4 className="font-semibold">Status</h4>
                <p>{material.status}</p>
              </div>
            </div>
            {material.notes && (
              <div>
                <h4 className="font-semibold">Observações</h4>
                <p className="text-muted-foreground">{material.notes}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
