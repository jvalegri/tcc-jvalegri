import { NextRequest, NextResponse } from 'next/server'
import { emailService, NotificationEvent } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event, settings, recipientEmail } = body

    console.log('📧 Enviando notificação:', event.type, 'para:', recipientEmail)

    if (!event || !recipientEmail) {
      return NextResponse.json(
        { error: 'Evento e email do destinatário são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se deve enviar notificação baseado nas configurações
    const shouldSend = shouldSendNotification(event, settings)
    
    if (!shouldSend) {
      console.log('⏭️ Notificação não enviada - configurações não permitem')
      return NextResponse.json({
        message: 'Notificação não enviada - configurações não permitem',
        skipped: true
      })
    }

    // Enviar notificação
    const success = await emailService.sendNotification(event, recipientEmail)

    if (success) {
      console.log('✅ Notificação enviada com sucesso')
      return NextResponse.json({
        message: 'Notificação enviada com sucesso',
        sent: true
      })
    } else {
      console.error('❌ Falha ao enviar notificação')
      return NextResponse.json(
        { error: 'Falha ao enviar notificação' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('❌ Erro ao processar notificação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

function shouldSendNotification(event: NotificationEvent, settings: any): boolean {
  if (!settings) return true // Se não há configurações, enviar por padrão

  const { criticalOnly, lowStock, outOfStock, largeWithdrawal, inviteAccepted, generalUpdates } = settings

  // Notificações críticas sempre enviadas
  if (event.severity === 'critical') return true

  // Verificar configurações específicas
  switch (event.type) {
    case 'low_stock':
      return lowStock !== false
    case 'out_of_stock':
      return outOfStock !== false
    case 'large_withdrawal':
      return largeWithdrawal !== false
    case 'invite_accepted':
      return inviteAccepted !== false
    case 'movement':
      return generalUpdates !== false
    default:
      return !criticalOnly
  }
}