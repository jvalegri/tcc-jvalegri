import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

// Configuração para evitar build estático
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

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

    console.log("Aceitando convite com token:", token, "para usuário:", userId)

    // Buscar o convite pelo token
    const invite = await prisma.projectInvite.findUnique({
      where: { token: token },
      include: {
        project: true
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
        { status: 409 }
      )
    }

    // Criar o membro do projeto
    const projectMember = await prisma.projectMember.create({
      data: {
        projectId: invite.projectId,
        userId: userId,
        role: invite.role,
        status: "ATIVO"
      }
    })

    // Atualizar o status do convite para ACEITO
    await prisma.projectInvite.update({
      where: { id: invite.id },
      data: { status: "ACEITO" }
    })

    console.log("Convite aceito com sucesso. Usuário adicionado ao projeto:", projectMember.id)

    return NextResponse.json({
      success: true,
      message: "Convite aceito com sucesso!",
      project: {
        id: invite.project.id,
        name: invite.project.name,
        description: invite.project.description
      },
      member: {
        id: projectMember.id,
        role: projectMember.role,
        status: projectMember.status
      }
    })

  } catch (error) {
    console.error("Erro ao aceitar convite:", error)
    
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
