import { NextRequest, NextResponse } from "next/server"

// Configuração para evitar build estático
export const dynamic = 'force-dynamic'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { projectId: string; memberId: string } }
) {
  try {
    const { projectId, memberId } = params

    if (!projectId || !memberId) {
      return NextResponse.json(
        { message: "ID do projeto e ID do membro são obrigatórios" },
        { status: 400 }
      )
    }

    // Importar Prisma apenas quando necessário (runtime)
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    try {
      // Buscar o membro
      const member = await prisma.projectMember.findUnique({
        where: { id: memberId },
        include: { user: true }
      })

      if (!member) {
        return NextResponse.json(
          { message: "Membro não encontrado" },
          { status: 404 }
        )
      }

      // Verificar se é o último gestor ativo
      if (member.role === "GESTOR") {
        const gestorCount = await prisma.projectMember.count({
          where: {
            projectId: projectId,
            role: "GESTOR",
            status: "ATIVO"
          }
        })

        if (gestorCount <= 1) {
          return NextResponse.json(
            { message: "Não é possível remover o último gestor do projeto" },
            { status: 400 }
          )
        }
      }

      // Remover o membro
      await prisma.projectMember.delete({
        where: { id: memberId }
      })

      return NextResponse.json({
        message: "Membro removido com sucesso"
      })

    } finally {
      await prisma.$disconnect()
    }

  } catch (error) {
    console.error("Erro ao remover membro:", error)
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
