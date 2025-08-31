import { NextRequest, NextResponse } from "next/server"

// Configuração para evitar build estático
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json(
        { message: "ID do projeto é obrigatório" },
        { status: 400 }
      )
    }

    // Importar Prisma apenas quando necessário (runtime)
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    try {
      // Buscar movimentações do projeto específico
      const movements = await prisma.movementRecord.findMany({
        where: {
          projectId: projectId
        },
        include: {
          user: {
            select: {
              name: true
            }
          },
          material: {
            select: {
              name: true,
              type: true
            }
          }
        },
        orderBy: {
          timestamp: 'desc'
        }
      })

      // Transformar dados para o formato esperado pelo frontend
      const transformedMovements = movements.map(movement => ({
        id: movement.id,
        userId: movement.userId,
        userName: movement.user.name || 'Usuário',
        actionType: movement.type === 'entry' ? 'entrada' : 'saída',
        materialId: movement.materialId,
        materialName: movement.material.name,
        materialCategory: movement.material.type || 'Geral',
        quantity: movement.quantity,
        date: movement.timestamp,
        location: 'Local do Projeto', // Campo não existe no schema atual
        justification: 'Movimentação de estoque' // Campo não existe no schema atual
      }))

      return NextResponse.json(transformedMovements)

    } finally {
      await prisma.$disconnect()
    }

  } catch (error) {
    console.error("Erro ao buscar movimentações:", error)
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      quantity, 
      type, 
      userId, 
      materialId, 
      projectId,
      justification = 'Movimentação de estoque'
    } = body

    // Validação detalhada dos campos obrigatórios
    const validationErrors = []
    
    if (!quantity && quantity !== 0) {
      validationErrors.push('Quantidade é obrigatória')
    }
    if (!type) {
      validationErrors.push('Tipo é obrigatório')
    }
    if (!userId) {
      validationErrors.push('Usuário é obrigatório')
    }
    if (!materialId) {
      validationErrors.push('Material é obrigatório')
    }
    if (!projectId) {
      validationErrors.push('Projeto é obrigatório')
    }

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          message: 'Campos obrigatórios não preenchidos: ' + validationErrors.join(', '),
          errors: validationErrors
        },
        { status: 400 }
      )
    }

    // Importar Prisma apenas quando necessário (runtime)
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    try {
      // Verificar se o material existe
      const material = await prisma.material.findUnique({
        where: { id: materialId }
      })

      if (!material) {
        return NextResponse.json(
          { message: "Material não encontrado" },
          { status: 404 }
        )
      }

      // Verificar se o projeto existe
      const project = await prisma.project.findUnique({
        where: { id: projectId }
      })

      if (!project) {
        return NextResponse.json(
          { message: "Projeto não encontrado" },
          { status: 404 }
        )
      }

      // Verificar se o usuário existe
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })

      if (!user) {
        return NextResponse.json(
          { message: "Usuário não encontrado" },
          { status: 404 }
        )
      }

      // Mapear tipo de movimentação
      const movementType = type === 'entrada' ? 'entry' : 'exit'

      // Criar nova movimentação
      const newMovement = await prisma.movementRecord.create({
        data: {
          quantity: parseFloat(quantity),
          type: movementType,
          userId: userId,
          materialId: materialId,
          projectId: projectId
        },
        include: {
          user: {
            select: {
              name: true
            }
          },
          material: {
            select: {
              name: true,
              type: true
            }
          }
        }
      })

      // Atualizar quantidade do material
      if (movementType === 'entry') {
        await prisma.material.update({
          where: { id: materialId },
          data: {
            currentQuantity: {
              increment: parseFloat(quantity) || 0
            }
          }
        })
      } else if (movementType === 'exit') {
        await prisma.material.update({
          where: { id: materialId },
          data: {
            currentQuantity: {
              decrement: parseFloat(quantity) || 0
            }
          }
        })
      }

      // Retornar movimentação criada no formato esperado pelo frontend
      const movementResponse = {
        id: newMovement.id,
        userId: newMovement.userId,
        userName: newMovement.user.name || 'Usuário',
        actionType: newMovement.type === 'entry' ? 'entrada' : 'saída',
        materialId: newMovement.materialId,
        materialName: newMovement.material.name,
        materialCategory: newMovement.material.type || 'Geral',
        quantity: newMovement.quantity,
        date: newMovement.timestamp,
        location: 'Local do Projeto',
        justification: justification
      }

      return NextResponse.json(movementResponse, { status: 201 })

    } finally {
      await prisma.$disconnect()
    }

  } catch (error) {
    console.error("Erro ao criar movimentação:", error)
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
