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

    console.log('Buscando projetos para usuário:', userId)

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

    console.log(`Encontrados ${projects.length} projetos para usuário ${userId}`)

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
    const body = await request.json()
    const { name, description, userId } = body

    console.log('Tentativa de criar projeto:', { name, description, userId })

    // Validação dos campos obrigatórios
    if (!name || !userId) {
      console.log('Campos obrigatórios faltando:', { name: !!name, userId: !!userId })
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
      console.log('Usuário não encontrado:', userId)
      return NextResponse.json(
        { message: 'Usuário não encontrado.' },
        { status: 404 }
      )
    }

    console.log('Usuário encontrado, criando projeto...')

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

    console.log('Projeto criado com sucesso:', newProject)

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
