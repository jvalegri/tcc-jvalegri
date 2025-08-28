import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

// Configuração para evitar build estático
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, name, email } = body

    // Validar campos obrigatórios
    if (!userId || !name || !email) {
      return NextResponse.json(
        { message: "ID do usuário, nome e email são obrigatórios" },
        { status: 400 }
      )
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Formato de email inválido" },
        { status: 400 }
      )
    }

    // Verificar se o usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      return NextResponse.json(
        { message: "Usuário não encontrado" },
        { status: 404 }
      )
    }

    // Verificar se o email já está sendo usado por outro usuário
    if (email !== existingUser.email) {
      const emailInUse = await prisma.user.findFirst({
        where: {
          email: email,
          id: { not: userId }
        }
      })

      if (emailInUse) {
        return NextResponse.json(
          { message: "Este email já está sendo usado por outro usuário" },
          { status: 409 }
        )
      }
    }

    // Atualizar o usuário
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name.trim(),
        email: email.trim(),
        updatedAt: new Date()
      }
    })

    // Retornar dados atualizados (sem senha)
    const { password, ...userWithoutPassword } = updatedUser

    return NextResponse.json(userWithoutPassword)

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

  } catch (error) {
    console.error("Erro ao buscar perfil:", error)
    
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
