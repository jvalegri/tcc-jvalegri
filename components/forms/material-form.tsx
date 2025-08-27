"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useMaterialStore } from "@/lib/stores/material-store"
import { useToast } from "@/hooks/use-toast"
import type { Material } from "@/lib/types"

interface MaterialFormProps {
  material?: Material
  onSuccess: () => void
}

export function MaterialForm({ material, onSuccess }: MaterialFormProps) {
  const { addMaterial, updateMaterial, currentProjectId } = useMaterialStore()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: material?.name || "",
    category: material?.category || "",
    supplier: material?.supplier || "",
    quantity: material?.quantity || "",
    unit: material?.unit || "un",
    price: material?.price || "",
    minStock: material?.minStock || "",
    notes: material?.notes || "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório"
    }
    if (!formData.category.trim()) {
      newErrors.category = "Categoria é obrigatória"
    }
    if (!formData.supplier.trim()) {
      newErrors.supplier = "Fornecedor é obrigatório"
    }
    
    // Validação da quantidade
    const quantityValue = parseFloat(formData.quantity.toString())
    if (isNaN(quantityValue) || quantityValue < 0) {
      newErrors.quantity = "Quantidade deve ser um número positivo"
    }
    
    // Validação do preço
    const priceValue = parseFloat(formData.price.toString())
    if (isNaN(priceValue) || priceValue < 0) {
      newErrors.price = "Preço deve ser um número positivo"
    }
    
    // Validação do estoque mínimo
    const minStockValue = parseFloat(formData.minStock.toString())
    if (isNaN(minStockValue) || minStockValue < 0) {
      newErrors.minStock = "Estoque mínimo deve ser um número positivo"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    if (!currentProjectId) {
      toast({
        title: "Erro",
        description: "Nenhum projeto selecionado. Selecione um projeto primeiro.",
        variant: "destructive"
      })
      return
    }

    try {
      if (material) {
        // Edição de material existente
        const updatedMaterial = {
          name: formData.name,
          category: formData.category,
          supplier: formData.supplier,
          quantity: parseFloat(formData.quantity.toString()) || 0,
          unit: formData.unit,
          price: parseFloat(formData.price.toString()) || 0,
          minStock: parseFloat(formData.minStock.toString()) || 0,
          notes: formData.notes,
          status: parseFloat(formData.quantity.toString()) <= parseFloat(formData.minStock.toString())
            ? parseFloat(formData.quantity.toString()) === 0
              ? "Sem Estoque"
              : "Estoque Baixo"
            : "Em Estoque",
        }

        await updateMaterial(material.id, updatedMaterial)
        toast({
          title: "Material atualizado",
          description: "Material foi atualizado com sucesso!",
        })
      } else {
        // Criação de novo material
        const apiMaterialData = {
          name: formData.name,
          description: formData.notes,
          type: formData.category,
          currentQuantity: parseFloat(formData.quantity.toString()) || 0,
          unit: formData.unit,
          price: parseFloat(formData.price.toString()) || 0,
          supplier: formData.supplier,
          minStock: parseFloat(formData.minStock.toString()) || 0,
          isConsumable: false,
          projectId: currentProjectId
        }

        await addMaterial(apiMaterialData, currentProjectId)
        toast({
          title: "Material adicionado",
          description: "Novo material foi cadastrado com sucesso!",
        })
      }

      onSuccess()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar material. Tente novamente.",
        variant: "destructive"
      })
    }
  }

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  // Função genérica para validar campos numéricos
  const handleNumericChange = (field: string, value: string) => {
    // Permitir campo vazio ou apenas números e vírgula/ponto
    if (value === "" || /^[0-9]*[.,]?[0-9]*$/.test(value)) {
      handleChange(field, value)
    }
  }

  // Função genérica para formatar exibição de campos numéricos
  const formatNumericForDisplay = (value: string | number) => {
    if (value === "" || value === 0) return ""
    return value.toString()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nome *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Ex: Tinta Acrílica Branca"
          />
          {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
        </div>

        <div>
          <Label htmlFor="category">Categoria *</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => handleChange("category", e.target.value)}
            placeholder="Ex: Tintas, Pisos, Iluminação"
          />
          {errors.category && <p className="text-sm text-red-500 mt-1">{errors.category}</p>}
        </div>

        <div>
          <Label htmlFor="supplier">Fornecedor *</Label>
          <Input
            id="supplier"
            value={formData.supplier}
            onChange={(e) => handleChange("supplier", e.target.value)}
            placeholder="Ex: Suvinil, Portobello"
          />
          {errors.supplier && <p className="text-sm text-red-500 mt-1">{errors.supplier}</p>}
        </div>

        <div>
          <Label htmlFor="quantity">Quantidade *</Label>
          <Input
            id="quantity"
            type="text"
            value={formatNumericForDisplay(formData.quantity)}
            onChange={(e) => handleNumericChange("quantity", e.target.value)}
            placeholder="0"
            className="font-mono"
          />
          {errors.quantity && <p className="text-sm text-red-500 mt-1">{errors.quantity}</p>}
          <p className="text-xs text-muted-foreground mt-1">
            Digite apenas números. Use vírgula ou ponto para decimais (ex: 3,5 ou 2.4)
          </p>
        </div>

        <div>
          <Label htmlFor="unit">Unidade</Label>
          <select
            id="unit"
            value={formData.unit}
            onChange={(e) => handleChange("unit", e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            <option value="un">Unidade</option>
            <option value="m²">Metro Quadrado</option>
            <option value="m">Metro</option>
            <option value="cm">Centímetro</option>
            <option value="mm">Milímetro</option>
            <option value="kg">Quilograma</option>
            <option value="g">Grama</option>
            <option value="l">Litro</option>
            <option value="ml">Mililitro</option>
            <option value="cx">Caixa</option>
            <option value="pç">Peça</option>
            <option value="rol">Rolo</option>
            <option value="pct">Pacote</option>
          </select>
        </div>

        <div>
          <Label htmlFor="price">Preço (R$) *</Label>
          <Input
            id="price"
            type="text"
            value={formatNumericForDisplay(formData.price)}
            onChange={(e) => handleNumericChange("price", e.target.value)}
            placeholder="0,00"
            className="font-mono"
          />
          {errors.price && <p className="text-sm text-red-500 mt-1">{errors.price}</p>}
          <p className="text-xs text-muted-foreground mt-1">
            Digite apenas números e use vírgula ou ponto para decimais
          </p>
        </div>

        <div>
          <Label htmlFor="minStock">Estoque Mínimo *</Label>
          <Input
            id="minStock"
            type="text"
            value={formatNumericForDisplay(formData.minStock)}
            onChange={(e) => handleNumericChange("minStock", e.target.value)}
            placeholder="0"
            className="font-mono"
          />
          {errors.minStock && <p className="text-sm text-red-500 mt-1">{errors.minStock}</p>}
          <p className="text-xs text-muted-foreground mt-1">
            Digite apenas números. Use vírgula ou ponto para decimais
          </p>
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleChange("notes", e.target.value)}
          placeholder="Informações adicionais sobre o material..."
          rows={3}
        />
      </div>

      {!currentProjectId && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            ⚠️ Nenhum projeto selecionado. Selecione um projeto para adicionar materiais.
          </p>
        </div>
      )}

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1" disabled={!currentProjectId}>
          {material ? "Atualizar" : "Cadastrar"} Material
        </Button>
      </div>
    </form>
  )
}
