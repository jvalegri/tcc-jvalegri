import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

// Configuração para evitar build estático
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string; memberId: string } }
) {
  try {
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

    return NextResponse.json(member)
  } catch (error) {
    console.error("Erro ao buscar membro:", error)
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { projectId: string; memberId: string } }
) {
  try {
    const body = await request.json()
    const { status } = body

    if (!status || !["ATIVO", "INATIVO"].includes(status)) {
      return NextResponse.json(
        { message: "Status inválido" },
        { status: 400 }
      )
    }

    const member = await prisma.projectMember.update({
      where: { id: params.memberId },
      data: { status },
      include: { user: true }
    })

    return NextResponse.json(member)
  } catch (error) {
    console.error("Erro ao atualizar status:", error)
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { projectId: string; memberId: string } }
) {
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

    // Verificar se não é o último gestor do projeto
    if (member.role === "GESTOR") {
      const gestorCount = await prisma.projectMember.count({
        where: {
          projectId: params.projectId,
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
      where: { id: params.memberId }
    })

    return NextResponse.json(
      { message: "Membro removido com sucesso" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Erro ao remover membro:", error)
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
