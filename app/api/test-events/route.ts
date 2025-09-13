import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventType, projectId, materialId } = body

    console.log('🧪 Testando evento:', eventType, 'para projeto:', projectId)

    // Simular evento de estoque baixo
    if (eventType === 'low_stock') {
      const testData = {
        type: 'low_stock',
        materialId: materialId || 'test-material-id',
        materialName: 'Material de Teste',
        projectId: projectId || 'test-project-id',
        projectName: 'Projeto de Teste',
        currentStock: 2,
        minStock: 5
      }

      // Emitir evento
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'low_stock',
          data: testData
        })
      })

      if (response.ok) {
        console.log('✅ Evento de estoque baixo emitido com sucesso')
        return NextResponse.json({
          success: true,
          message: 'Evento de estoque baixo emitido',
          data: testData
        })
      } else {
        throw new Error('Falha ao emitir evento')
      }
    }

    // Simular evento de movimentação
    if (eventType === 'movement') {
      const testData = {
        type: 'movement',
        materialId: materialId || 'test-material-id',
        materialName: 'Material de Teste',
        materialType: 'Teste',
        quantity: 10,
        movementType: 'exit',
        userId: 'test-user-id',
        userName: 'Usuário de Teste',
        projectId: projectId || 'test-project-id',
        justification: 'Teste de movimentação',
        timestamp: new Date(),
        currentStock: 5,
        minStock: 10
      }

      // Emitir evento
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'movement',
          data: testData
        })
      })

      if (response.ok) {
        console.log('✅ Evento de movimentação emitido com sucesso')
        return NextResponse.json({
          success: true,
          message: 'Evento de movimentação emitido',
          data: testData
        })
      } else {
        throw new Error('Falha ao emitir evento')
      }
    }

    return NextResponse.json({
      error: 'Tipo de evento não suportado',
      supportedTypes: ['low_stock', 'movement']
    }, { status: 400 })

  } catch (error) {
    console.error('❌ Erro no teste de evento:', error)
    return NextResponse.json({
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
