export type UserRole = 'GESTOR' | 'COLABORADOR'
export type UserStatus = 'ATIVO' | 'INATIVO' | 'PENDENTE'

export interface User {
  id: string
  email: string
  name?: string
  role: UserRole
  status: UserStatus
  createdAt: string
  updatedAt: string
}

export interface Project {
  id: string
  name: string
  description?: string
  ownerId: string
  createdAt: string
  updatedAt: string
}

export interface ProjectMember {
  id: string
  projectId: string
  userId: string
  role: UserRole
  status: UserStatus
  joinedAt: string
  updatedAt: string
  user?: User
}

export interface ProjectInvite {
  id: string
  projectId: string
  email: string
  name: string
  role: UserRole
  status: string
  token: string
  expiresAt: string
  createdAt: string
  sentById: string
}

export interface Material {
  id: string
  name: string
  description?: string
  type?: string
  quantity: number
  unit: string
  price: number
  supplier?: string
  minStock: number
  isConsumable: boolean
  projectId: string
  category?: string
  currentQuantity?: number
  status?: string
}

export interface MovementRecord {
  id: string
  quantity: number
  timestamp: string
  type: string
  location?: string
  materialName?: string
  actionType?: string
  materialType?: string
  userId: string
  materialId: string
  projectId: string
  user?: User
  material?: Material
}
