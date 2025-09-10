import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar eventos reais do banco de dados
    const events = await getRealEvents(projectId, limit)

    return NextResponse.json(events)

  } catch (error) {
    console.error('Erro ao buscar eventos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Função para buscar eventos reais do banco de dados
async function getRealEvents(projectId: string, limit: number) {
  const events = []

  try {
    // Importar Prisma dinamicamente
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    // Buscar movimentações recentes
    const movements = await prisma.movementRecord.findMany({
      where: { projectId },
      include: {
        user: { select: { name: true } },
        material: { select: { name: true, type: true, currentQuantity: true, minStock: true } }
      },
      orderBy: { timestamp: 'desc' },
      take: limit
    })

    // Converter movimentações em eventos
    for (const movement of movements) {
      const event = {
        id: movement.id,
        type: 'movement',
        severity: determineSeverity(movement),
        title: `${movement.type === 'entry' ? 'Entrada' : 'Saída'} de ${movement.material.name}`,
        description: `${movement.user.name || 'Usuário'} ${movement.type === 'entry' ? 'adicionou' : 'removeu'} ${movement.quantity} unidades de ${movement.material.name}`,
        timestamp: movement.timestamp,
        project: 'Projeto Atual', // Você pode buscar o nome do projeto
        material: movement.material.name,
        user: movement.user.name,
        quantity: movement.quantity,
        currentStock: movement.material.currentQuantity,
        minStock: movement.material.minStock
      }
      events.push(event)
    }

    // Buscar materiais com estoque baixo do projeto
    const projectMaterials = await prisma.projectMaterial.findMany({
      where: { projectId },
      include: {
        material: true,
        project: { select: { name: true } }
      }
    })

    // Filtrar materiais com estoque baixo
    for (const projectMaterial of projectMaterials) {
      const material = projectMaterial.material
      if (material && material.currentQuantity <= material.minStock) {
        const event = {
          id: `low-stock-${material.id}`,
          type: 'low_stock',
          severity: 'high',
          title: 'Estoque Baixo Detectado',
          description: `Material ${material.name} está com estoque baixo (${material.currentQuantity}/${material.minStock})`,
          timestamp: new Date(),
          project: projectMaterial.project?.name || 'Projeto Atual',
          material: material.name,
          quantity: material.currentQuantity,
          minStock: material.minStock
        }
        events.push(event)
      }
    }

    await prisma.$disconnect()

    // Ordenar eventos por timestamp (mais recentes primeiro)
    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return events.slice(0, limit)

  } catch (error) {
    console.error('Erro ao buscar eventos do banco:', error)
    return []
  }
}

// Função para determinar severidade baseada na movimentação
function determineSeverity(movement: any): 'low' | 'medium' | 'high' | 'critical' {
  const quantity = movement.quantity
  const currentStock = movement.material.currentQuantity
  const minStock = movement.material.minStock

  // Retirada em grande escala
  if (movement.type === 'exit' && quantity > 50) {
    return 'critical'
  }

  // Estoque baixo após movimentação
  if (movement.type === 'exit' && currentStock <= minStock) {
    return 'high'
  }

  // Movimentação grande
  if (quantity > 20) {
    return 'medium'
  }

  return 'low'
}
