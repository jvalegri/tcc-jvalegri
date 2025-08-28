import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { projectId } = params

    if (!projectId) {
      return NextResponse.json(
        { message: "ID do projeto é obrigatório" },
        { status: 400 }
      )
    }

    console.log("Buscando membros do projeto:", projectId)

    // Buscar membros do projeto com informações do usuário
    const members = await prisma.projectMember.findMany({
      where: {
        projectId: projectId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true
          }
        }
      },
      orderBy: {
        joinedAt: "asc"
      }
    })

    console.log(`Encontrados ${members.length} membros no projeto ${projectId}`)

    return NextResponse.json(members)

  } catch (error) {
    console.error("Erro ao buscar membros do projeto:", error)
    
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
