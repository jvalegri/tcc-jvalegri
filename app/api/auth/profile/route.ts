import { NextRequest, NextResponse } from "next/server"

// Configuração para evitar build estático
export const dynamic = 'force-dynamic'

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, email } = body

    // Validação dos campos obrigatórios
    if (!id || !name || !email) {
      return NextResponse.json(
        { message: "ID, nome e email são obrigatórios" },
        { status: 400 }
      )
    }

    // Importar Prisma apenas quando necessário (runtime)
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    try {
      // Atualizar usuário
      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          updatedAt: new Date()
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true
        }
      })

      return NextResponse.json({
        message: "Perfil atualizado com sucesso",
        user: updatedUser
      })

    } finally {
      await prisma.$disconnect()
    }

  } catch (error) {
    console.error("Erro ao atualizar perfil:", error)
    
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { message: "ID do usuário é obrigatório" },
        { status: 400 }
      )
    }

    // Buscar usuário
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      })

      if (!user) {
        return NextResponse.json(
          { message: "Usuário não encontrado" },
          { status: 404 }
        )
      }

      return NextResponse.json(user)

    } finally {
      await prisma.$disconnect()
    }

  } catch (error) {
    console.error("Erro ao buscar perfil:", error)
    
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
