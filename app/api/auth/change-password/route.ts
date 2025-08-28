import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

// Configuração para evitar build estático
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, currentPassword, newPassword } = body

    // Validar campos obrigatórios
    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json(
        { message: "ID do usuário, senha atual e nova senha são obrigatórios" },
        { status: 400 }
      )
    }

    // Validar tamanho da nova senha
    if (newPassword.length < 6) {
      return NextResponse.json(
        { message: "A nova senha deve ter pelo menos 6 caracteres" },
        { status: 400 }
      )
    }

    // Buscar usuário com senha
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        password: true,
        email: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { message: "Usuário não encontrado" },
        { status: 404 }
      )
    }

    // Verificar se a senha atual está correta
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
    
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { message: "Senha atual incorreta" },
        { status: 401 }
      )
    }

    // Hash da nova senha
    const hashedNewPassword = await bcrypt.hash(newPassword, 12)

    // Atualizar senha no banco
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedNewPassword,
        updatedAt: new Date()
      }
    })

    // Log da alteração (sem expor dados sensíveis)
    console.log(`Senha alterada para usuário: ${user.email}`)

    return NextResponse.json({
      message: "Senha alterada com sucesso"
    })

  } catch (error) {
    console.error("Erro ao alterar senha:", error)
    
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
