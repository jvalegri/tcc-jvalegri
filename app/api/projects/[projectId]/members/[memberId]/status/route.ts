import { NextRequest, NextResponse } from "next/server"

// Configuração para evitar build estático
export const dynamic = 'force-dynamic'

export async function PUT(
  request: NextRequest,
  { params }: { params: { projectId: string; memberId: string } }
) {
  try {
    const body = await request.json()
    const { status } = body

    if (!status || !["ATIVO", "INATIVO"].includes(status)) {
      return NextResponse.json(
        { message: "Status deve ser ATIVO ou INATIVO" },
        { status: 400 }
      )
    }

    // Importar Prisma apenas quando necessário (runtime)
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    try {
      // Verificar se o membro existe
      const member = await prisma.projectMember.findUnique({
        where: { id: params.memberId },
        include: { user: true }
      })

      if (!member) {
        return NextResponse.json(
          { message: "Membro não encontrado" },
          { status: 404 }
        )
      }

      // Verificar se não está desativando o último gestor ativo
      if (member.role === "GESTOR" && status === "INATIVO") {
        const gestorCount = await prisma.projectMember.count({
          where: {
            projectId: params.projectId,
            role: "GESTOR",
            status: "ATIVO"
          }
        })

        if (gestorCount <= 1) {
          return NextResponse.json(
            { message: "Não é possível desativar o último gestor ativo do projeto" },
            { status: 400 }
          )
        }
      }

      // Atualizar status do membro
      const updatedMember = await prisma.projectMember.update({
        where: { id: params.memberId },
        data: { 
          status,
          updatedAt: new Date()
        },
        include: { user: true }
      })

      return NextResponse.json({
        message: `Membro ${status === 'ATIVO' ? 'ativado' : 'desativado'} com sucesso`,
        member: updatedMember
      })

    } finally {
      await prisma.$disconnect()
    }

  } catch (error) {
    console.error("Erro ao atualizar status do membro:", error)
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
