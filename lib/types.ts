export enum UserRole {
  GESTOR = 'GESTOR',
  COLABORADOR = 'COLABORADOR'
}

export enum UserStatus {
  ATIVO = 'ATIVO',
  INATIVO = 'INATIVO',
  PENDENTE = 'PENDENTE'
}

export interface ProjectMember {
  id: string
  projectId: string
  userId: string
  role: UserRole
  status: UserStatus
  joinedAt: Date
  updatedAt: Date
  user?: {
    id: string
    name?: string
    email: string
  }
}

export interface ProjectInvite {
  id: string
  projectId: string
  email: string
  name: string
  role: UserRole
  status: string
  token: string
  expiresAt: Date
  createdAt: Date
  sentById: string
  userId?: string
  sentBy?: {
    name?: string
    email: string
  }
  project?: {
    id: string
    name: string
  }
}

export interface Material {
  id: string
  name: string
  description?: string
  category?: string
  type?: string
  quantity?: number
  currentQuantity?: number
  unit: string
  price?: number
  supplier?: string
  minStock?: number
  status?: string
  notes?: string
  isConsumable?: boolean
  projectId?: string
}

export interface MovementRecord {
  id: string
  userId: string
  materialId: string
  projectId: string
  quantity: number
  type: 'entry' | 'exit'
  timestamp: Date
  materialName?: string
  materialType?: string
  actionType?: 'entrada' | 'saída'
  location?: string
  userName?: string
  justification?: string
}

export interface Invite {
  id: string
  token: string
  project: {
    id: string
    name: string
    description?: string
  }
  role: string
  sentBy: {
    name?: string
    email: string
  }
  expiresAt: string
  userId: string
}