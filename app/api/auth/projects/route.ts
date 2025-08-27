import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { message: 'ID do usuário é obrigatório.' },
        { status: 400 }
      )
    }

    // Buscar projetos do usuário específico
    const projects = await prisma.project.findMany({
      where: {
        ownerId: userId
      },
      select: {
        id: true,
        name: true,
        description: true
      }
    })

    return NextResponse.json(projects)

  } catch (error) {
    console.error('Erro ao buscar projetos:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor.' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, userId } = await request.json()

    // Validação dos campos obrigatórios
    if (!name || !userId) {
      return NextResponse.json(
        { message: 'Nome do projeto e ID do usuário são obrigatórios.' },
        { status: 400 }
      )
    }

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'Usuário não encontrado.' },
        { status: 404 }
      )
    }

    // Criar novo projeto
    const newProject = await prisma.project.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        ownerId: userId
      },
      select: {
        id: true,
        name: true,
        description: true
      }
    })

    return NextResponse.json(newProject, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar projeto:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor.' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
