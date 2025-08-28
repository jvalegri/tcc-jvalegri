import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { randomBytes } from "crypto"

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

    console.log("Buscando convites do projeto:", projectId)

    // Buscar convites do projeto
    const invites = await prisma.projectInvite.findMany({
      where: {
        projectId: projectId
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    console.log(`Encontrados ${invites.length} convites no projeto ${projectId}`)

    return NextResponse.json(invites)

  } catch (error) {
    console.error("Erro ao buscar convites do projeto:", error)
    
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { projectId } = params
    const body = await request.json()
    const { name, email, role, sentById } = body

    if (!projectId || !name || !email || !role || !sentById) {
      return NextResponse.json(
        { message: "Todos os campos são obrigatórios" },
        { status: 400 }
      )
    }

    // Validar role
    if (!["GESTOR", "COLABORADOR"].includes(role)) {
      return NextResponse.json(
        { message: "Role deve ser GESTOR ou COLABORADOR" },
        { status: 400 }
      )
    }

    console.log("Criando convite para:", { name, email, role, projectId })

    // Verificar se já existe um convite para este email neste projeto
    const existingInvite = await prisma.projectInvite.findFirst({
      where: {
        projectId: projectId,
        email: email
      }
    })

    if (existingInvite) {
      return NextResponse.json(
        { message: "Já existe um convite para este email neste projeto" },
        { status: 409 }
      )
    }

    // Gerar token único para o convite
    const token = randomBytes(32).toString("hex")
    
    // Definir expiração (7 dias)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    // Criar o convite
    const invite = await prisma.projectInvite.create({
      data: {
        projectId: projectId,
        email: email.trim(),
        name: name.trim(),
        role: role,
        token: token,
        expiresAt: expiresAt,
        sentById: sentById
      }
    })

    console.log("Convite criado com sucesso:", invite.id)

    // TODO: Implementar envio de email aqui
    // Por enquanto, apenas retornamos o convite criado
    console.log("Email seria enviado para:", email)
    console.log("Token do convite:", token)

    return NextResponse.json(invite, { status: 201 })

  } catch (error) {
    console.error("Erro ao criar convite:", error)
    
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
