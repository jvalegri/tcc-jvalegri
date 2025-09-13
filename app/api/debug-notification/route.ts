import { NextRequest, NextResponse } from 'next/server'
import { emailService, NotificationEvent } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userEmail, projectId } = body

    console.log('🔍 Debug: Testando fluxo completo de notificação')
    console.log('📧 Email:', userEmail)
    console.log('🏗️ Projeto:', projectId)

    if (!userEmail) {
      return NextResponse.json({
        error: 'Email do usuário é obrigatório'
      }, { status: 400 })
    }

    // Simular evento de estoque baixo real
    const testEvent: NotificationEvent = {
      type: 'low_stock',
      severity: 'high',
      project: 'Projeto de Teste',
      material: 'Material de Teste',
      quantity: 2,
      minStock: 5,
      details: 'Material de teste está com estoque baixo (2 unidades)'
    }

    console.log('📧 Enviando notificação de teste:', testEvent)

    // Enviar notificação diretamente
    const success = await emailService.sendNotification(testEvent, userEmail)
    
    if (success) {
      console.log('✅ Notificação enviada com sucesso para:', userEmail)
      return NextResponse.json({
        success: true,
        message: 'Notificação de teste enviada com sucesso',
        event: testEvent
      })
    } else {
      console.error('❌ Falha ao enviar notificação para:', userEmail)
      return NextResponse.json({
        error: 'Falha ao enviar notificação',
        details: 'Verifique a configuração do Gmail SMTP'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ Erro no debug de notificação:', error)
    return NextResponse.json({
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
