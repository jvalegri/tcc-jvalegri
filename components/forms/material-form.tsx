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
  const { addMaterial, updateMaterial } = useMaterialStore()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: material?.name || "",
    category: material?.category || "",
    supplier: material?.supplier || "",
    quantity: material?.quantity || 0,
    unit: material?.unit || "un",
    price: material?.price || 0,
    minStock: material?.minStock || 5,
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
    if (formData.quantity < 0) {
      newErrors.quantity = "Quantidade deve ser positiva"
    }
    if (formData.price < 0) {
      newErrors.price = "Preço deve ser positivo"
    }
    if (formData.minStock < 0) {
      newErrors.minStock = "Estoque mínimo deve ser positivo"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const materialData = {
      ...formData,
      status:
        formData.quantity <= formData.minStock
          ? formData.quantity === 0
            ? "Sem Estoque"
            : "Estoque Baixo"
          : "Em Estoque",
    } as const

    if (material) {
      updateMaterial(material.id, materialData)
      toast({
        title: "Material atualizado",
        description: "Material foi atualizado com sucesso!",
      })
    } else {
      addMaterial(materialData)
      toast({
        title: "Material adicionado",
        description: "Novo material foi cadastrado com sucesso!",
      })
    }

    onSuccess()
  }

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
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
            type="number"
            min="0"
            value={formData.quantity}
            onChange={(e) => handleChange("quantity", Number.parseInt(e.target.value) || 0)}
          />
          {errors.quantity && <p className="text-sm text-red-500 mt-1">{errors.quantity}</p>}
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
            <option value="kg">Quilograma</option>
            <option value="l">Litro</option>
            <option value="cx">Caixa</option>
            <option value="pç">Peça</option>
          </select>
        </div>

        <div>
          <Label htmlFor="price">Preço (R$) *</Label>
          <Input
            id="price"
            type="number"
            min="0"
            step="0.01"
            value={formData.price}
            onChange={(e) => handleChange("price", Number.parseFloat(e.target.value) || 0)}
          />
          {errors.price && <p className="text-sm text-red-500 mt-1">{errors.price}</p>}
        </div>

        <div>
          <Label htmlFor="minStock">Estoque Mínimo *</Label>
          <Input
            id="minStock"
            type="number"
            min="0"
            value={formData.minStock}
            onChange={(e) => handleChange("minStock", Number.parseInt(e.target.value) || 0)}
          />
          {errors.minStock && <p className="text-sm text-red-500 mt-1">{errors.minStock}</p>}
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

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          {material ? "Atualizar" : "Cadastrar"} Material
        </Button>
      </div>
    </form>
  )
}
