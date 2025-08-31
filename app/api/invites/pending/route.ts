import { NextRequest, NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { message: "ID do usuário é obrigatório" },
        { status: 400 }
      )
    }

    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    try {
      // Buscar convites pendentes para o usuário
      const pendingInvites = await prisma.projectInvite.findMany({
        where: {
          userId: userId,
          status: "PENDENTE",
          expiresAt: {
            gt: new Date()
          }
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              description: true
            }
          },
          sentBy: {
            select: {
              name: true,
              email: true
            }
          }
        }
      })

      const invites = pendingInvites.map(invite => ({
        id: invite.id,
        token: invite.token,
        project: invite.project,
        role: invite.role,
        sentBy: invite.sentBy,
        expiresAt: invite.expiresAt,
        userId: invite.userId
      }))

      return NextResponse.json(invites)

    } finally {
      await prisma.$disconnect()
    }

  } catch (error) {
    console.error("Erro ao buscar convites pendentes:", error)
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
