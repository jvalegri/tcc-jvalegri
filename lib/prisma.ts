import { PrismaClient } from '@prisma/client'

// Função para obter PrismaClient de forma segura
export function getPrismaClient() {
  return new PrismaClient()
}
