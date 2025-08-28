import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

// Configuração para evitar build estático
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

export async function PUT(
  request: NextRequest,
  { params }: { params: { projectId: string; memberId: string } }
) {
  try {
    const { projectId, memberId } = params
    const body = await request.json()
    const { status } = body

    if (!projectId || !memberId) {
      return NextResponse.json(
        { message: "ID do projeto e ID do membro são obrigatórios" },
        { status: 400 }
      )
    }

    if (!status || !["ATIVO", "INATIVO"].includes(status)) {
      return NextResponse.json(
        { message: "Status deve ser ATIVO ou INATIVO" },
        { status: 400 }
      )
    }

    console.log(`Alterando status do membro ${memberId} para ${status} no projeto ${projectId}`)

    // Verificar se o membro existe e não é um gestor
    const member = await prisma.projectMember.findUnique({
      where: {
        id: memberId
      },
      include: {
        user: true
      }
    })

    if (!member) {
      return NextResponse.json(
        { message: "Membro não encontrado" },
        { status: 404 }
      )
    }

    // Não permitir desativar gestores
    if (member.role === "GESTOR" && status === "INATIVO") {
      return NextResponse.json(
        { message: "Não é possível desativar gestores do projeto" },
        { status: 403 }
      )
    }

    // Atualizar o status do membro
    const updatedMember = await prisma.projectMember.update({
      where: {
        id: memberId
      },
      data: {
        status: status,
        updatedAt: new Date()
      },
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
      }
    })

    console.log(`Status do membro ${memberId} alterado para ${status}`)

    return NextResponse.json(updatedMember)

  } catch (error) {
    console.error("Erro ao alterar status do membro:", error)
    
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
