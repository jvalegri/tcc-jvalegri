import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"

// Configuração para evitar build estático
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    // Validação dos campos obrigatórios
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email e senha são obrigatórios.' },
        { status: 400 }
      )
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Formato de email inválido.' },
        { status: 400 }
      )
    }

    // Validação de senha (mínimo 6 caracteres)
    if (password.length < 6) {
      return NextResponse.json(
        { message: 'A senha deve ter pelo menos 6 caracteres.' },
        { status: 400 }
      )
    }

    // Importar Prisma apenas quando necessário (runtime)
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    try {
      // Testar conexão com o banco
      await prisma.$connect()
      console.log('Conexão com banco estabelecida (signup)')

      // Verificar se o usuário já existe
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      })

      if (existingUser) {
        return NextResponse.json(
          { message: 'Este email já está cadastrado.' },
          { status: 409 }
        )
      }

      // Hash da senha
      const saltRounds = 12
      const hashedPassword = await bcrypt.hash(password, saltRounds)

      // Criar novo usuário
      const newUser = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          password: hashedPassword,
          name: name || null,
          role: 'COLABORADOR',
          status: 'ATIVO'
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true
        }
      })

      console.log('Usuário criado com sucesso:', newUser.id)

      return NextResponse.json({
        ...newUser,
        projects: [] // Array vazio para compatibilidade com o frontend
      })

    } catch (dbError) {
      console.error('Erro específico do banco (signup):', dbError)
      throw dbError
    } finally {
      await prisma.$disconnect()
    }

  } catch (error) {
    console.error('Erro no cadastro:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor.' },
      { status: 500 }
    )
  }
}
