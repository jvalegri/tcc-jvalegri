import { create } from "zustand"
import type { Material, MovementRecord } from "@/lib/types"

interface MaterialStore {
  // Estado
  materials: Material[]
  movements: MovementRecord[]
  currentProjectId: string | null
  currentUserId: string | null
  isLoading: boolean
  error: string | null

  // Setters
  setMaterials: (materials: Material[]) => void
  setMovements: (movements: MovementRecord[]) => void
  setCurrentProjectId: (projectId: string) => void
  setCurrentUserId: (userId: string) => void
  setError: (error: string | null) => void

  // Ações
  fetchMaterials: (projectId: string) => Promise<void>
  fetchMovements: (projectId: string) => Promise<void>
  addMaterial: (material: any, projectId: string) => Promise<void>
  updateMaterial: (id: string, updatedMaterial: Partial<Material>) => Promise<void>
  updateMaterialQuantity: (id: string, newQuantity: number) => void
  deleteMaterial: (id: string) => void
  addMovement: (movement: any, projectId: string, userId: string) => Promise<void>
  clearData: () => void
}

export const useMaterialStore = create<MaterialStore>((set, get) => ({
  // Estado inicial
  materials: [],
  movements: [],
  currentProjectId: null,
  currentUserId: null,
  isLoading: false,
  error: null,

  // Setters
  setMaterials: (materials) => set({ materials }),
  setMovements: (movements) => set({ movements }),
  setCurrentProjectId: (projectId) => set({ currentProjectId: projectId }),
  setCurrentUserId: (userId) => set({ currentUserId: userId }),
  setError: (error) => set({ error }),

  // Buscar materiais do banco de dados
  fetchMaterials: async (projectId: string) => {
    try {
      set({ isLoading: true, error: null })
      const response = await fetch(`/api/materials?projectId=${projectId}`)
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar materiais: ${response.status}`)
      }
      
      const materials = await response.json()
      set({ materials, isLoading: false })
    } catch (error) {
      console.error("Erro ao buscar materiais:", error)
      set({ error: error instanceof Error ? error.message : "Erro desconhecido", isLoading: false })
      throw error
    }
  },

  // Buscar movimentações do banco de dados
  fetchMovements: async (projectId: string) => {
    try {
      set({ isLoading: true, error: null })
      const response = await fetch(`/api/movements?projectId=${projectId}`)
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar movimentações: ${response.status}`)
      }
      
      const movements = await response.json()
      set({ movements, isLoading: false })
    } catch (error) {
      console.error("Erro ao buscar movimentações:", error)
      set({ error: error instanceof Error ? error.message : "Erro desconhecido", isLoading: false })
      throw error
    }
  },

  // Adicionar material via API
  addMaterial: async (material: any, projectId: string) => {
    try {
      set({ isLoading: true, error: null })
      const response = await fetch("/api/materials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(material),
      })

      if (!response.ok) {
        throw new Error(`Erro ao adicionar material: ${response.status}`)
      }

      const newMaterial = await response.json()
      
      // Atualizar estado local
      set((state) => ({
        materials: [...state.materials, newMaterial],
        isLoading: false,
      }))
    } catch (error) {
      console.error("Erro ao adicionar material:", error)
      set({ error: error instanceof Error ? error.message : "Erro desconhecido", isLoading: false })
      throw error
    }
  },

  // Atualizar material via API
  updateMaterial: async (id: string, updatedMaterial: Partial<Material>) => {
    try {
      set({ isLoading: true, error: null })
      
      // Preparar dados para a API
      const apiData = {
        id,
        name: updatedMaterial.name,
        description: updatedMaterial.notes,
        type: updatedMaterial.category,
        currentQuantity: updatedMaterial.quantity,
        unit: updatedMaterial.unit,
        price: updatedMaterial.price,
        supplier: updatedMaterial.supplier,
        minStock: updatedMaterial.minStock
      }

      const response = await fetch("/api/materials", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiData),
      })

      if (!response.ok) {
        throw new Error(`Erro ao atualizar material: ${response.status}`)
      }

      const updatedMaterialResponse = await response.json()
      
      // Atualizar estado local
      set((state) => ({
        materials: state.materials.map((m) =>
          m.id === id ? updatedMaterialResponse : m
        ),
        isLoading: false,
      }))
    } catch (error) {
      console.error("Erro ao atualizar material:", error)
      set({ error: error instanceof Error ? error.message : "Erro desconhecido", isLoading: false })
      throw error
    }
  },

  // Atualizar quantidade (placeholder para futura implementação)
  updateMaterialQuantity: (id: string, newQuantity: number) => {
    set((state) => ({
      materials: state.materials.map((m) =>
        m.id === id ? { ...m, quantity: newQuantity } : m
      ),
    }))
  },

  // Deletar material (placeholder para futura implementação)
  deleteMaterial: (id: string) => {
    set((state) => ({
      materials: state.materials.filter((m) => m.id !== id),
    }))
  },

  // Adicionar movimentação via API
  addMovement: async (movement: any, projectId: string, userId: string) => {
    try {
      set({ isLoading: true, error: null })
      
      const response = await fetch("/api/movements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...movement,
          projectId,
          userId,
        }),
      })

      if (!response.ok) {
        throw new Error(`Erro ao adicionar movimentação: ${response.status}`)
      }

      const newMovement = await response.json()
      
      // Atualizar estado local
      set((state) => ({
        movements: [...state.movements, newMovement],
        isLoading: false,
      }))

      // Atualizar quantidade do material localmente - CORRIGIDO: usando 'type' em vez de 'actionType'
      if (movement.type === "entrada") {
        set((state) => ({
          materials: state.materials.map((m) =>
            m.id === movement.materialId
              ? { ...m, quantity: m.quantity + movement.quantity }
              : m
          ),
        }))
      } else {
        set((state) => ({
          materials: state.materials.map((m) =>
            m.id === movement.materialId
              ? { ...m, quantity: Math.max(0, m.quantity - movement.quantity) }
              : m
          ),
        }))
      }
    } catch (error) {
      console.error("Erro ao adicionar movimentação:", error)
      set({ error: error instanceof Error ? error.message : "Erro desconhecido", isLoading: false })
      throw error
    }
  },

  // Limpar dados
  clearData: () => {
    set({
      materials: [],
      movements: [],
      currentProjectId: null,
      currentUserId: null,
      isLoading: false,
      error: null,
    })
  },
}))
