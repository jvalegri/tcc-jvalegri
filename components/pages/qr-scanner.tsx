"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Camera, Upload, Package, AlertCircle } from "lucide-react"
import { useMaterialStore } from "@/lib/stores/material-store"
import { useToast } from "@/hooks/use-toast"

export function QRScanner() {
  const [scannedCode, setScannedCode] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [foundMaterial, setFoundMaterial] = useState<any>(null)
  const [movementData, setMovementData] = useState({
    actionType: "entrada" as "entrada" | "saída",
    quantity: 1,
    location: "",
    justification: "",
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const { materials, addMovement } = useMaterialStore()
  const { toast } = useToast()

  const handleScanCode = (code: string) => {
    setScannedCode(code)
    const material = materials.find((m) => m.id === code)
    setFoundMaterial(material)

    if (!material) {
      toast({
        title: "Material não encontrado",
        description: "O código QR não corresponde a nenhum material cadastrado.",
        variant: "destructive",
      })
    }
  }

  const simulateQRScan = () => {
    setIsScanning(true)
    // Simular escaneamento
    setTimeout(() => {
      const randomMaterial = materials[Math.floor(Math.random() * materials.length)]
      if (randomMaterial) {
        handleScanCode(randomMaterial.id)
      }
      setIsScanning(false)
    }, 2000)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Simular leitura de QR code da imagem
      const randomMaterial = materials[Math.floor(Math.random() * materials.length)]
      if (randomMaterial) {
        handleScanCode(randomMaterial.id)
        toast({
          title: "QR Code detectado",
          description: "Material encontrado na imagem!",
        })
      }
    }
  }

  const handleMovement = () => {
    if (!foundMaterial || !movementData.location || !movementData.justification) {
      toast({
        title: "Dados incompletos",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      })
      return
    }

    addMovement({
      materialId: foundMaterial.id,
      materialName: foundMaterial.name,
      materialCategory: foundMaterial.category,
      actionType: movementData.actionType,
      quantity: movementData.quantity,
      location: movementData.location,
      justification: movementData.justification,
    })

    toast({
      title: "Movimentação registrada",
      description: `${movementData.actionType === "entrada" ? "Entrada" : "Saída"} de ${movementData.quantity} ${foundMaterial.unit} registrada com sucesso.`,
    })

    // Reset form
    setScannedCode("")
    setFoundMaterial(null)
    setMovementData({
      actionType: "entrada",
      quantity: 1,
      location: "",
      justification: "",
    })
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Scanner QR</h1>

      {/* Scanner Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Escanear com Câmera
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={simulateQRScan} disabled={isScanning} className="w-full">
              {isScanning ? "Escaneando..." : "Iniciar Escaneamento"}
            </Button>
            <p className="text-sm text-muted-foreground mt-2">Aponte a câmera para o código QR do material</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload de Imagem
            </CardTitle>
          </CardHeader>
          <CardContent>
            <input type="file" accept="image/*" onChange={handleFileUpload} ref={fileInputRef} className="hidden" />
            <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full">
              Selecionar Imagem
            </Button>
            <p className="text-sm text-muted-foreground mt-2">Faça upload de uma imagem contendo o código QR</p>
          </CardContent>
        </Card>
      </div>

      {/* Scanned Result */}
      {scannedCode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {foundMaterial ? (
                <>
                  <Package className="h-5 w-5 text-green-500" />
                  Material Encontrado
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  Material Não Encontrado
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {foundMaterial ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nome</Label>
                    <p className="font-medium">{foundMaterial.name}</p>
                  </div>
                  <div>
                    <Label>Categoria</Label>
                    <p>{foundMaterial.category}</p>
                  </div>
                  <div>
                    <Label>Fornecedor</Label>
                    <p>{foundMaterial.supplier}</p>
                  </div>
                  <div>
                    <Label>Estoque Atual</Label>
                    <p>
                      {foundMaterial.quantity} {foundMaterial.unit}
                    </p>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Badge variant={foundMaterial.status === "Em Estoque" ? "default" : "destructive"}>
                      {foundMaterial.status}
                    </Badge>
                  </div>
                </div>

                {/* Movement Form */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-4">Registrar Movimentação</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="actionType">Tipo de Movimentação</Label>
                      <select
                        id="actionType"
                        value={movementData.actionType}
                        onChange={(e) =>
                          setMovementData((prev) => ({
                            ...prev,
                            actionType: e.target.value as "entrada" | "saída",
                          }))
                        }
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="entrada">Entrada</option>
                        <option value="saída">Saída</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="quantity">Quantidade</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        value={movementData.quantity}
                        onChange={(e) =>
                          setMovementData((prev) => ({
                            ...prev,
                            quantity: Number.parseInt(e.target.value) || 1,
                          }))
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="location">Local *</Label>
                      <Input
                        id="location"
                        value={movementData.location}
                        onChange={(e) =>
                          setMovementData((prev) => ({
                            ...prev,
                            location: e.target.value,
                          }))
                        }
                        placeholder="Ex: Obra A, Depósito, etc."
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="justification">Justificativa *</Label>
                      <Textarea
                        id="justification"
                        value={movementData.justification}
                        onChange={(e) =>
                          setMovementData((prev) => ({
                            ...prev,
                            justification: e.target.value,
                          }))
                        }
                        placeholder="Descreva o motivo da movimentação..."
                      />
                    </div>
                  </div>

                  <Button onClick={handleMovement} className="mt-4 w-full md:w-auto">
                    Registrar Movimentação
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">
                  Código QR: <code className="bg-muted px-2 py-1 rounded">{scannedCode}</code>
                </p>
                <p className="text-red-500 mt-2">Este código não corresponde a nenhum material cadastrado.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      {!scannedCode && (
        <Card>
          <CardHeader>
            <CardTitle>Como usar o Scanner QR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>1. Use a câmera para escanear códigos QR em tempo real</p>
              <p>2. Ou faça upload de uma imagem contendo o código QR</p>
              <p>3. Após detectar o material, preencha os dados da movimentação</p>
              <p>4. Confirme para registrar a entrada ou saída do material</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
