import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { randomBytes } from "crypto"
import { sendProjectInviteEmail } from "@/lib/email-service"

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

    console.log("Verificando convite para:", { name, email, role, projectId })

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

    // Verificar se o usuário já é membro do projeto
    const existingMember = await prisma.projectMember.findFirst({
      where: {
        projectId: projectId,
        user: {
          email: email
        }
      }
    })

    if (existingMember) {
      return NextResponse.json(
        { message: "Este usuário já é membro do projeto" },
        { status: 409 }
      )
    }

    // Verificar se o usuário existe na base
    const existingUser = await prisma.user.findUnique({
      where: { email: email.trim() }
    })

    if (!existingUser) {
      return NextResponse.json(
        { message: "Usuário com este e-mail não encontrado. É necessário ter uma conta no sistema para receber convites." },
        { status: 404 }
      )
    }

    console.log("Usuário encontrado:", existingUser.name, "ID:", existingUser.id)

    // Gerar token único para o convite
    const token = randomBytes(32).toString("hex")
    
    // Definir expiração (7 dias)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    // Buscar informações do projeto para o e-mail
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { name: true, description: true }
    })

    if (!project) {
      return NextResponse.json(
        { message: "Projeto não encontrado" },
        { status: 404 }
      )
    }

    // Criar o convite
    const invite = await prisma.projectInvite.create({
      data: {
        projectId: projectId,
        email: email.trim(),
        name: name.trim(),
        role: role,
        token: token,
        expiresAt: expiresAt,
        sentById: sentById,
        userId: existingUser.id // Associar ao usuário existente
      }
    })

    console.log("Convite criado com sucesso:", invite.id)

    // Enviar e-mail de convite real
    try {
      console.log("📧 Enviando e-mail de convite real para:", email)
      
      const emailResult = await sendProjectInviteEmail({
        to: email.trim(),
        name: existingUser.name || name.trim(),
        projectName: project.name,
        role: role,
        initialPassword: null, // Não precisa de senha para usuário existente
        inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/accept-invite?token=${token}`
      })

      if (emailResult.success) {
        console.log("✅ E-mail de convite enviado com sucesso para:", email)
        
        // Atualizar o convite com status de enviado
        await prisma.projectInvite.update({
          where: { id: invite.id },
          data: { 
            status: "ENVIADO"
          }
        })

        return NextResponse.json({
          ...invite,
          emailSent: true,
          message: "Convite criado e e-mail enviado com sucesso!"
        }, { status: 201 })
      } else {
        console.error("❌ Erro ao enviar e-mail:", emailResult.message)
        
        return NextResponse.json({
          ...invite,
          emailSent: false,
          message: "Convite criado, mas falha ao enviar e-mail. Tente novamente."
        }, { status: 201 })
      }

    } catch (emailError) {
      console.error("❌ Erro ao enviar e-mail:", emailError)
      
      return NextResponse.json({
        ...invite,
        emailSent: false,
        message: "Convite criado, mas falha ao enviar e-mail. Tente novamente."
      }, { status: 201 })
    }

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
