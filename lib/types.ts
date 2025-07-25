export interface Material {
  id: string
  name: string
  category: string
  supplier: string
  quantity: number
  unit: string
  price: number
  status: "Em Estoque" | "Estoque Baixo" | "Sem Estoque"
  minStock: number
  notes?: string
}

export interface MovementRecord {
  id: string
  userId: string
  userName: string
  actionType: "entrada" | "saída"
  materialId: string
  materialName: string
  materialCategory: string
  quantity: number
  date: Date
  location: string
  justification: string
}
