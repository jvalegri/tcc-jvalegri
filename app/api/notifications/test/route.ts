import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { settings, recipientEmail } = body

    // Simular envio de notificação de teste
    const testEvent = {
      type: 'low_stock',
      severity: 'high',
      project: 'Projeto Teste',
      material: 'Material de Teste',
      quantity: 5,
      details: 'Esta é uma notificação de teste do sistema'
    }

    // Chamar a API principal de notificações
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: testEvent,
        settings,
        recipientEmail
      })
    })

    if (!response.ok) {
      throw new Error('Falha ao enviar notificação de teste')
    }

    const result = await response.json()

    return NextResponse.json({
      message: 'Notificação de teste enviada com sucesso',
      ...result
    })

  } catch (error) {
    console.error('Erro no teste de notificação:', error)
    return NextResponse.json(
      { error: 'Erro ao enviar notificação de teste' },
      { status: 500 }
    )
  }
}
