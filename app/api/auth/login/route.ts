import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { getPrismaClient, disconnectPrisma } from "@/lib/prisma-client"

// Configuração para evitar build estático
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validação dos campos obrigatórios
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email e senha são obrigatórios.' },
        { status: 400 }
      )
    }

    // Obter cliente Prisma
    const prisma = getPrismaClient()

    // Buscar usuário pelo email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        ownedProjects: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      }
    })

    // Verificar se o usuário existe
    if (!user) {
      return NextResponse.json(
        { message: 'Email ou senha incorretos.' },
        { status: 401 }
      )
    }

    // Verificar se a senha está correta
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Email ou senha incorretos.' },
        { status: 401 }
      )
    }

    // Remover a senha dos dados retornados
    const { password: userPassword, ...userData } = user

    // Retornar dados do usuário com projetos (pode ser array vazio)
    return NextResponse.json({
      ...userData,
      projects: userData.ownedProjects || [] // Mapear ownedProjects para projects para compatibilidade
    })

  } catch (error) {
    console.error('Erro no login:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor.' },
      { status: 500 }
    )
  } finally {
    // Desconectar Prisma se necessário
    await disconnectPrisma()
  }
}
