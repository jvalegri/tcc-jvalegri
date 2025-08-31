import { NextRequest, NextResponse } from "next/server"
import { sendProjectInviteEmail } from "@/lib/email-service"
import crypto from "crypto"

// Configuração para evitar build estático
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest, { params }: { params: { projectId: string } }) {
  try {
    const body = await request.json()
    const { email, name, role, sentById } = body

    if (!email || !name || !role || !sentById) {
      return NextResponse.json(
        { message: "Email, nome, função e ID do remetente são obrigatórios" },
        { status: 400 }
      )
    }

    // Importar Prisma apenas quando necessário (runtime)
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    try {
      // Verificar se já existe um convite para este email e projeto
      const existingInvite = await prisma.projectInvite.findFirst({
        where: {
          projectId: params.projectId,
          email: email.toLowerCase()
        }
      })

      if (existingInvite) {
        return NextResponse.json(
          { message: "Já existe um convite para este email neste projeto" },
          { status: 409 }
        )
      }

      // Verificar se o usuário com este email existe
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      })

      if (!existingUser) {
        return NextResponse.json(
          { message: "Usuário com este email não encontrado" },
          { status: 404 }
        )
      }

      // Verificar se o usuário já é membro do projeto
      const existingMember = await prisma.projectMember.findFirst({
        where: {
          projectId: params.projectId,
          userId: existingUser.id
        }
      })

      if (existingMember) {
        return NextResponse.json(
          { message: "Usuário já é membro deste projeto" },
          { status: 409 }
        )
      }

      // Buscar informações do projeto
      const project = await prisma.project.findUnique({
        where: { id: params.projectId },
        select: { id: true, name: true }
      })

      if (!project) {
        return NextResponse.json(
          { message: "Projeto não encontrado" },
          { status: 404 }
        )
      }

      // Gerar token único
      const token = crypto.randomBytes(32).toString('hex')
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias

      // Criar convite
      const invite = await prisma.projectInvite.create({
        data: {
          projectId: params.projectId,
          email: email.toLowerCase(),
          name: name.trim(),
          role: role,
          token: token,
          expiresAt: expiresAt,
          sentById: sentById,
          userId: existingUser.id,
          status: "PENDENTE"
        }
      })

      // Enviar e-mail de convite
      const emailResult = await sendProjectInviteEmail({
        to: email,
        name: name,
        projectName: project.name,
        role: role,
        inviteToken: token,
        userId: existingUser.id
      })

      if (!emailResult.success) {
        // Se falhar o envio, deletar o convite
        await prisma.projectInvite.delete({
          where: { id: invite.id }
        })

        return NextResponse.json(
          { message: "Convite criado, mas falha ao enviar e-mail. Tente novamente." },
          { status: 500 }
        )
      }

      return NextResponse.json({
        message: "Convite enviado com sucesso",
        invite: {
          id: invite.id,
          email: invite.email,
          name: invite.name,
          role: invite.role,
          status: invite.status
        }
      })

    } finally {
      await prisma.$disconnect()
    }

  } catch (error) {
    console.error("Erro ao enviar convite:", error)
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
