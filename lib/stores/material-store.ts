"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Material, MovementRecord } from "@/lib/types"

interface MaterialStore {
  materials: Material[]
  movements: MovementRecord[]
  addMaterial: (material: Omit<Material, "id">) => void
  updateMaterial: (id: string, material: Partial<Material>) => void
  deleteMaterial: (id: string) => void
  addMovement: (movement: Omit<MovementRecord, "id" | "userId" | "userName" | "date">) => void
  updateMaterialQuantity: (id: string, newQuantity: number) => void // <== adicionar essa linha
  clearAllData: () => void
  importData: (materials: Material[], movements: MovementRecord[]) => void
  initializeData: () => void
}

const generateId = () => Math.random().toString(36).substr(2, 9)

const sampleMaterials: Material[] = [
  {
    id: "mat001",
    name: "Tinta Acrílica Branca",
    category: "Tintas",
    supplier: "Suvinil",
    quantity: 15,
    unit: "l",
    price: 45.9,
    status: "Em Estoque",
    minStock: 5,
    notes: "Tinta premium para paredes internas",
  },
  {
    id: "mat002",
    name: "Piso Laminado Carvalho",
    category: "Pisos",
    supplier: "Durafloor",
    quantity: 3,
    unit: "m²",
    price: 89.9,
    status: "Estoque Baixo",
    minStock: 10,
    notes: "Piso resistente à água",
  },
  {
    id: "mat003",
    name: "Luminária LED Pendente",
    category: "Iluminação",
    supplier: "Philips",
    quantity: 8,
    unit: "un",
    price: 129.9,
    status: "Em Estoque",
    minStock: 3,
    notes: "Luminária moderna para sala de jantar",
  },
  {
    id: "mat004",
    name: "Papel de Parede Floral",
    category: "Revestimentos",
    supplier: "Bobinex",
    quantity: 0,
    unit: "rolo",
    price: 78.5,
    status: "Sem Estoque",
    minStock: 2,
    notes: "Papel de parede importado",
  },
  {
    id: "mat005",
    name: "Torneira Monocomando",
    category: "Metais",
    supplier: "Deca",
    quantity: 12,
    unit: "un",
    price: 189.9,
    status: "Em Estoque",
    minStock: 4,
    notes: "Torneira com acabamento cromado",
  },
]

const sampleMovements: MovementRecord[] = [
  {
    id: "mov001",
    userId: "system",
    userName: "Sistema",
    actionType: "entrada",
    materialId: "mat001",
    materialName: "Tinta Acrílica Branca",
    materialCategory: "Tintas",
    quantity: 10,
    date: new Date(Date.now() - 86400000), // 1 day ago
    location: "Depósito Central",
    justification: "Compra para estoque",
  },
  {
    id: "mov002",
    userId: "system",
    userName: "Sistema",
    actionType: "saída",
    materialId: "mat002",
    materialName: "Piso Laminado Carvalho",
    materialCategory: "Pisos",
    quantity: 7,
    date: new Date(Date.now() - 172800000), // 2 days ago
    location: "Obra Residencial A",
    justification: "Instalação no quarto principal",
  },
  {
    id: "mov003",
    userId: "system",
    userName: "Sistema",
    actionType: "entrada",
    materialId: "mat003",
    materialName: "Luminária LED Pendente",
    materialCategory: "Iluminação",
    quantity: 5,
    date: new Date(Date.now() - 259200000), // 3 days ago
    location: "Depósito Central",
    justification: "Reposição de estoque",
  },
]

export const useMaterialStore = create<MaterialStore>()(
  persist(
    (set, get) => ({
      materials: [],
      movements: [],

      addMaterial: (material) => {
        const newMaterial: Material = {
          ...material,
          id: generateId(),
        }
        set((state) => ({
          materials: [...state.materials, newMaterial],
        }))
      },

      updateMaterial: (id, updatedMaterial) => {
        set((state) => ({
          materials: state.materials.map((material) =>
            material.id === id ? { ...material, ...updatedMaterial } : material,
          ),
        }))
      },
      
      updateMaterialQuantity: (id: string, newQuantity: number) => {
        set((state) => ({
          materials: state.materials.map((material) => {
            if (material.id !== id) return material
      
            const status =
              newQuantity <= 0
                ? "Sem Estoque"
                : newQuantity <= material.minStock
                ? "Estoque Baixo"
                : "Em Estoque"
      
            return {
              ...material,
              quantity: Math.max(0, newQuantity),
              status,
            }
          }),
        }))
      },

      deleteMaterial: (id) => {
        set((state) => ({
          materials: state.materials.filter((material) => material.id !== id),
        }))
      },

      addMovement: (movement) => {
        const newMovement: MovementRecord = {
          ...movement,
          id: generateId(),
          userId: "system",
          userName: "Sistema",
          date: new Date(),
        }

        set((state) => {
          // Update material quantity
          const updatedMaterials = state.materials.map((material) => {
            if (material.id === movement.materialId) {
              const newQuantity =
                movement.actionType === "entrada"
                  ? material.quantity + movement.quantity
                  : material.quantity - movement.quantity

              const status: "Em Estoque" | "Estoque Baixo" | "Sem Estoque" =
                newQuantity <= 0 ? "Sem Estoque" : newQuantity <= material.minStock ? "Estoque Baixo" : "Em Estoque"

              return {
                ...material,
                quantity: Math.max(0, newQuantity),
                status,
              }
            }
            return material
          })

          return {
            materials: updatedMaterials,
            movements: [...state.movements, newMovement],
          }
        })
      },

      clearAllData: () => {
        set({ materials: [], movements: [] })
      },

      importData: (materials, movements) => {
        set({ materials, movements })
      },

      initializeData: () => {
        const { materials, movements } = get()
        if (materials.length === 0 && movements.length === 0) {
          set({
            materials: sampleMaterials,
            movements: sampleMovements,
          })
        }
      },
    }),
    {
      name: "material-store",
      version: 1,
    },
  ),
)
