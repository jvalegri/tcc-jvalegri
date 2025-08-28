import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

// Configuração para evitar build estático
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json(
        { message: 'ID do projeto é obrigatório.' },
        { status: 400 }
      )
    }

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

  } catch (error) {
    console.error('Erro ao buscar movimentações:', error)
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
    console.log('POST /api/movements - Body recebido:', body)
    
    const { 
      quantity, 
      type, 
      userId, 
      materialId, 
      projectId,
      justification = 'Movimentação de estoque'
    } = body

    console.log('POST /api/movements - Dados extraídos:', {
      quantity, 
      type, 
      userId, 
      materialId, 
      projectId,
      justification
    })

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
      console.log('POST /api/movements - Validação falhou:', validationErrors)
      return NextResponse.json(
        { 
          message: 'Campos obrigatórios não preenchidos: ' + validationErrors.join(', '),
          errors: validationErrors
        },
        { status: 400 }
      )
    }

    // Verificar se o material existe
    const material = await prisma.material.findUnique({
      where: { id: materialId }
    })

    if (!material) {
      console.log('POST /api/movements - Material não encontrado:', materialId)
      return NextResponse.json(
        { message: 'Material não encontrado.' },
        { status: 404 }
      )
    }

    console.log('POST /api/movements - Material encontrado:', material)

    // Verificar se o projeto existe
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    })

    if (!project) {
      console.log('POST /api/movements - Projeto não encontrado:', projectId)
      return NextResponse.json(
        { message: 'Projeto não encontrado.' },
        { status: 404 }
      )
    }

    console.log('POST /api/movements - Projeto encontrado:', project)

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      console.log('POST /api/movements - Usuário não encontrado:', userId)
      return NextResponse.json(
        { message: 'Usuário não encontrado.' },
        { status: 404 }
      )
    }

    console.log('POST /api/movements - Usuário encontrado:', user)

    // Mapear tipo de movimentação
    const movementType = type === 'entrada' ? 'entry' : 'exit'
    console.log('POST /api/movements - Tipo mapeado:', { original: type, mapped: movementType })

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

    console.log('POST /api/movements - Movimentação criada:', newMovement)

    // Atualizar quantidade do material
    const newQuantity = type === 'entrada' 
      ? material.currentQuantity + parseFloat(quantity)
      : material.currentQuantity - parseFloat(quantity)

    console.log('POST /api/movements - Atualizando quantidade do material:', {
      materialId,
      currentQuantity: material.currentQuantity,
      delta: type === 'entrada' ? parseFloat(quantity) : -parseFloat(quantity),
      newQuantity: Math.max(0, newQuantity)
    })

    await prisma.material.update({
      where: { id: materialId },
      data: {
        currentQuantity: Math.max(0, newQuantity)
      }
    })

    console.log('POST /api/movements - Quantidade do material atualizada')

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

    console.log('POST /api/movements - Retornando resposta:', movementResponse)
    return NextResponse.json(movementResponse, { status: 201 })

  } catch (error) {
    console.error('POST /api/movements - Erro ao criar movimentação:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor.' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
