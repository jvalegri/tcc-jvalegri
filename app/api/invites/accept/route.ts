import { NextRequest, NextResponse } from "next/server"

// Configuração para evitar build estático
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, userId } = body

    if (!token || !userId) {
      return NextResponse.json(
        { message: "Token e ID do usuário são obrigatórios" },
        { status: 400 }
      )
    }

    // Importar Prisma apenas quando necessário (runtime)
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    try {
      // Buscar o convite pelo token
      const invite = await prisma.projectInvite.findUnique({
        where: { token },
        include: {
          project: {
            select: {
              id: true,
              name: true
            }
          }
        }
      })

      if (!invite) {
        return NextResponse.json(
          { message: "Convite não encontrado" },
          { status: 404 }
        )
      }

      // Verificar se o convite expirou
      if (new Date() > invite.expiresAt) {
        return NextResponse.json(
          { message: "Convite expirado" },
          { status: 400 }
        )
      }

      // Verificar se o convite já foi aceito
      if (invite.status === "ACEITO") {
        return NextResponse.json(
          { message: "Convite já foi aceito" },
          { status: 400 }
        )
      }

      // Verificar se o usuário já é membro do projeto
      const existingMember = await prisma.projectMember.findFirst({
        where: {
          projectId: invite.projectId,
          userId: userId
        }
      })

      if (existingMember) {
        return NextResponse.json(
          { message: "Usuário já é membro deste projeto" },
          { status: 400 }
        )
      }

      // Criar membro do projeto
      await prisma.projectMember.create({
        data: {
          projectId: invite.projectId,
          userId: userId,
          role: invite.role,
          status: 'ATIVO',
          joinedAt: new Date(),
          updatedAt: new Date()
        }
      })

      // Atualizar status do convite
      await prisma.projectInvite.update({
        where: { token },
        data: {
          status: "ACEITO",
          userId: userId
        }
      })

      return NextResponse.json({
        message: "Convite aceito com sucesso",
        project: invite.project
      })

    } finally {
      await prisma.$disconnect()
    }

  } catch (error) {
    console.error("Erro ao aceitar convite:", error)
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
