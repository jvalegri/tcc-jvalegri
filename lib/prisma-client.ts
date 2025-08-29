import { PrismaClient } from '@prisma/client'

// Cliente Prisma global para evitar múltiplas instâncias
declare global {
  var __prisma: PrismaClient | undefined
}

// Função para obter ou criar cliente Prisma
export function getPrismaClient(): PrismaClient {
  if (process.env.NODE_ENV === 'production') {
    return new PrismaClient()
  }
  
  if (!global.__prisma) {
    global.__prisma = new PrismaClient()
  }
  
  return global.__prisma
}

// Função para desconectar o cliente
export async function disconnectPrisma(): Promise<void> {
  if (global.__prisma) {
    await global.__prisma.$disconnect()
  }
}
