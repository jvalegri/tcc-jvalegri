import { NextRequest, NextResponse } from "next/server"

// Configuração para evitar build estático
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, { params }: { params: { projectId: string } }) {
  try {
    const { projectId } = params

    if (!projectId) {
      return NextResponse.json(
        { message: "ID do projeto é obrigatório" },
        { status: 400 }
      )
    }

    // Importar Prisma apenas quando necessário (runtime)
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    try {
      // Buscar membros do projeto
      const members = await prisma.projectMember.findMany({
        where: { projectId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              status: true
            }
          }
        },
        orderBy: { joinedAt: 'desc' }
      })

      return NextResponse.json(members)

    } finally {
      await prisma.$disconnect()
    }

  } catch (error) {
    console.error("Erro ao buscar membros do projeto:", error)
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
