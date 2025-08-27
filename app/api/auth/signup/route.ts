import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

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
        name: name || null
      },
      select: {
        id: true,
        email: true,
        name: true,
        projects: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      }
    })

    return NextResponse.json({
      ...newUser,
      projects: newUser.projects || []
    })

  } catch (error) {
    console.error('Erro no cadastro:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor.' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
