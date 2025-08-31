import { NextRequest, NextResponse } from "next/server"

// Configuração para evitar build estático
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

    // Importar Prisma apenas quando necessário (runtime)
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    try {
      // Buscar projetos do usuário
      const userProjects = await prisma.projectMember.findMany({
        where: { userId },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              description: true,
              createdAt: true,
              updatedAt: true
            }
          }
        }
      })

      const projects = userProjects.map(member => ({
        ...member.project,
        role: member.role,
        joinedAt: member.joinedAt
      }))

      return NextResponse.json(projects)

    } finally {
      await prisma.$disconnect()
    }

  } catch (error) {
    console.error("Erro ao buscar projetos:", error)
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, userId } = body

    if (!name || !userId) {
      return NextResponse.json(
        { message: "Nome do projeto e ID do usuário são obrigatórios" },
        { status: 400 }
      )
    }

    // Importar Prisma apenas quando necessário (runtime)
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    try {
      // Criar projeto e membro em uma transação
      const result = await prisma.$transaction(async (tx) => {
        // Criar o projeto
        const project = await tx.project.create({
          data: {
            name: name.trim(),
            description: description?.trim() || null,
            ownerId: userId,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        })

        // Criar o membro do projeto (criador como GESTOR)
        const projectMember = await tx.projectMember.create({
          data: {
            projectId: project.id,
            userId: userId,
            role: 'GESTOR',
            status: 'ATIVO',
            joinedAt: new Date(),
            updatedAt: new Date()
          }
        })

        return { project, projectMember }
      })

      return NextResponse.json({
        message: "Projeto criado com sucesso",
        project: result.project,
        role: result.projectMember.role
      })

    } finally {
      await prisma.$disconnect()
    }

  } catch (error) {
    console.error("Erro ao criar projeto:", error)
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
