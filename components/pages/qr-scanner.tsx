"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Camera, Upload } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useMaterialStore } from "@/lib/stores/material-store"
import { useToast } from "@/hooks/use-toast"
import { Html5Qrcode } from "html5-qrcode"
import type { Material } from "@/lib/types"

export function QRScanner() {
  const [scannedCode, setScannedCode] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [foundMaterial, setFoundMaterial] = useState<Material | null>(null)
  const [stockUpdate, setStockUpdate] = useState({
    type: "adicionar" as "adicionar" | "remover",
    quantity: "",
  })

  const scannerRef = useRef<Html5Qrcode | null>(null)
  const cameraDivRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { materials } = useMaterialStore()
  const { toast } = useToast()

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {})
        try {
          scannerRef.current.clear()
        } catch {}
      }
    }
  }, [])

  const startCameraScan = async () => {
    const cameraId = await Html5Qrcode.getCameras().then(cameras => cameras[0]?.id)
    if (!cameraId) {
      toast({
        title: "Erro",
        description: "Nenhuma câmera foi detectada no dispositivo.",
        variant: "destructive",
      })
      return
    }

    setIsScanning(true)

    const scanner = new Html5Qrcode("qr-reader")
    scannerRef.current = scanner

    scanner
      .start(
        cameraId,
        { fps: 10, qrbox: 250 },
        async (decodedText: string) => {
          await scanner.stop()
          await scanner.clear()
          scannerRef.current = null
          setIsScanning(false)
          setScannedCode("")
          handleScanCode(decodedText)
        },
        () => {}
      )
      .catch((err) => {
        toast({
          title: "Erro ao iniciar câmera",
          description: String(err),
          variant: "destructive",
        })
        setIsScanning(false)
      })
  }

  const handleScanCode = (code: string) => {
    const material = materials.find((m) => m.id === code)
    setScannedCode(code)
    setFoundMaterial(material)

    toast({
      title: material ? "Material encontrado" : "Material não encontrado",
      description: material
        ? `Material "${material.name}" foi identificado.`
        : "O código QR não corresponde a nenhum material cadastrado.",
      variant: material ? "default" : "destructive",
    })
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const scanner = new Html5Qrcode("image-scan")
      scanner
        .scanFile(file, true)
        .then((decodedText) => {
          handleScanCode(decodedText)
          setTimeout(() => setScannedCode(""), 500)
        })
        .catch(() => {
          toast({
            title: "QR Code não detectado",
            description: "Não foi possível ler um código QR da imagem.",
            variant: "destructive",
          })
        })
    }
  }

  const handleQuantityChange = (value: string) => {
    // Permitir campo vazio ou apenas números e vírgula/ponto
    if (value === "" || /^[0-9]*[.,]?[0-9]*$/.test(value)) {
      setStockUpdate(prev => ({ ...prev, quantity: value }))
    }
  }

  const formatQuantityForDisplay = (value: string | number) => {
    if (value === "" || value === 0) return ""
    return value.toString()
  }

  const handleStockUpdate = async () => {
    if (!foundMaterial) return

    // Validar quantidade
    const quantityValue = parseFloat(stockUpdate.quantity.toString())
    if (isNaN(quantityValue) || quantityValue <= 0) {
      toast({
        title: "Erro",
        description: "Quantidade deve ser um número positivo maior que zero.",
        variant: "destructive",
      })
      return
    }

    try {
      const delta = quantityValue
      const oldQuantity = foundMaterial.quantity
      const newQuantity =
        stockUpdate.type === "adicionar"
          ? oldQuantity + delta
          : Math.max(0, oldQuantity - delta)

      const { addMovement, currentProjectId, currentUserId } = useMaterialStore.getState()
      
      if (!currentProjectId || !currentUserId) {
        toast({
          title: "Erro",
          description: "Projeto ou usuário não selecionado. Faça login novamente.",
          variant: "destructive",
        })
        return
      }

      // CORRIGIDO: Não chamar updateMaterialQuantity aqui para evitar dupla atualização
      // O store fará a atualização automaticamente ao processar a movimentação

      // Adicionar movimentação no banco - CORRIGIDO: usando 'type' em vez de 'actionType' e 'materialCategory' em vez de 'materialType'
      await addMovement({
        type: stockUpdate.type === "adicionar" ? "entrada" : "saída",
        materialId: foundMaterial.id,
        materialName: foundMaterial.name,
        materialCategory: foundMaterial.category,
        quantity: quantityValue,
        location: "Depósito Central",
        justification: "Ajuste via QR Scanner",
      }, currentProjectId, currentUserId)

      toast({
        title: "Estoque atualizado",
        description: `Novo estoque: ${newQuantity} ${foundMaterial.unit}`,
      })

      setFoundMaterial(null)
      setScannedCode("")
      setIsScanning(false)
      setStockUpdate(prev => ({ ...prev, quantity: "" }))
    } catch (error) {
      console.error("Erro ao atualizar estoque:", error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o estoque. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Scanner QR</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Câmera */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Escanear com Câmera
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!isScanning && !scannedCode && (
              <Button onClick={startCameraScan} className="w-full">
                Iniciar Escaneamento
              </Button>
            )}

            {isScanning && !scannedCode && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => {
                    scannerRef.current?.stop().then(() => {
                      scannerRef.current?.clear()
                      setIsScanning(false)
                    }).catch((err) => {
                      toast({
                        title: "Erro ao parar escaneamento",
                        description: String(err),
                        variant: "destructive",
                      })
                    })
                  }}
                  className="w-full"
                >
                  Parar Escaneamento
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  Escaneando... aponte a câmera para o QR code
                </p>
              </>
            )}

            <div id="qr-reader" ref={cameraDivRef} className="mt-4" />
            <p className="text-sm text-muted-foreground mt-2">
              Aponte a câmera para o código QR do material
            </p>
          </CardContent>
        </Card>

        {/* Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload de Imagem
            </CardTitle>
          </CardHeader>
          <CardContent>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              ref={fileInputRef}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="w-full"
            >
              Selecionar Imagem
            </Button>
            <div id="image-scan" className="hidden" />
            <p className="text-sm text-muted-foreground mt-2">
              Faça upload de uma imagem contendo o código QR
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Modal: Atualizar Estoque */}
      <Dialog
        open={!!foundMaterial}
        onOpenChange={(open) => {
          if (!open) {
            setFoundMaterial(null)
            setScannedCode("")
            setStockUpdate(prev => ({ ...prev, quantity: "" }))
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atualizar Estoque</DialogTitle>
          </DialogHeader>

          {foundMaterial && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="updateType">Tipo de atualização</Label>
                  <select
                    id="updateType"
                    value={stockUpdate.type}
                    onChange={(e) =>
                      setStockUpdate((prev) => ({
                        ...prev,
                        type: e.target.value as "adicionar" | "remover",
                      }))
                    }
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="adicionar">Adicionar</option>
                    <option value="remover">Remover</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="stockQuantity">Quantidade *</Label>
                  <Input
                    id="stockQuantity"
                    type="text"
                    value={formatQuantityForDisplay(stockUpdate.quantity)}
                    onChange={(e) => handleQuantityChange(e.target.value)}
                    placeholder="0"
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Digite apenas números. Use vírgula ou ponto para decimais
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              onClick={handleStockUpdate}
              className="w-full"
              disabled={!stockUpdate.quantity || parseFloat(stockUpdate.quantity.toString()) <= 0}
            >
              Atualizar Estoque
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
