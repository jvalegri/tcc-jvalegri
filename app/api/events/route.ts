import { NextRequest, NextResponse } from 'next/server'
import { emailService, NotificationEvent } from '@/lib/email-service'

// Sistema de Event Listeners para capturar eventos em tempo real
class EventListenerSystem {
  private static instance: EventListenerSystem
  private listeners: Map<string, Function[]> = new Map()
  private eventQueue: any[] = []
  private isProcessing = false

  static getInstance(): EventListenerSystem {
    if (!EventListenerSystem.instance) {
      EventListenerSystem.instance = new EventListenerSystem()
    }
    return EventListenerSystem.instance
  }

  // Registrar listener para um tipo de evento
  on(eventType: string, callback: Function) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, [])
    }
    this.listeners.get(eventType)!.push(callback)
  }

  // Emitir evento
  emit(eventType: string, data: any) {
    const event = {
      type: eventType,
      data,
      timestamp: new Date(),
      id: Math.random().toString(36).substr(2, 9)
    }

    this.eventQueue.push(event)
    this.processEvents()
  }

  // Processar eventos da fila
  private async processEvents() {
    if (this.isProcessing) return
    this.isProcessing = true

    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift()
      const callbacks = this.listeners.get(event.type) || []

      for (const callback of callbacks) {
        try {
          await callback(event.data, event)
        } catch (error) {
          console.error(`Erro ao processar evento ${event.type}:`, error)
        }
      }
    }

    this.isProcessing = false
  }

  // Detectar eventos críticos usando IA
  detectCriticalEvent(eventData: any): boolean {
    const patterns = [
      // Padrão: estoque baixo em material crítico
      eventData.type === 'low_stock' && 
      eventData.material?.toLowerCase().includes('cimento'),
      
      // Padrão: retirada muito grande
      eventData.type === 'movement' && 
      eventData.quantity > 100,
      
      // Padrão: múltiplas movimentações em sequência
      eventData.type === 'movement' && 
      eventData.quantity > 50 &&
      new Date().getHours() < 8, // Antes das 8h
      
      // Padrão: fim de semana
      (new Date().getDay() === 0 || new Date().getDay() === 6) &&
      eventData.type === 'movement'
    ]

    return patterns.some(pattern => pattern)
  }

  // Gerar insights de IA
  generateAIInsights(eventData: any): string {
    const insights = []

    if (eventData.type === 'low_stock') {
      insights.push(`Material ${eventData.material} está com estoque baixo. Considere aumentar o estoque mínimo.`)
    }

    if (eventData.type === 'movement' && eventData.quantity > 50) {
      insights.push(`Movimentação grande detectada. Verifique se está correta.`)
    }

    if (this.detectCriticalEvent(eventData)) {
      insights.push(`Evento crítico detectado por IA. Ação imediata recomendada.`)
    }

    return insights.join(' ')
  }
}

// Instância global do sistema
const eventSystem = EventListenerSystem.getInstance()

// Configurar listeners para eventos do sistema
eventSystem.on('low_stock', async (data: any) => {
  console.log('Evento de estoque baixo detectado:', data)
  
  // Enviar notificação real para gestores do projeto
  try {
    await sendNotificationToProjectManagers(data.projectId, {
      type: 'low_stock',
      severity: 'high',
      project: data.projectName || 'Projeto',
      material: data.materialName,
      quantity: data.currentStock,
      details: `Material ${data.materialName} está com estoque baixo (${data.currentStock} unidades)`
    })
  } catch (error) {
    console.error('Erro ao enviar notificação de estoque baixo:', error)
  }
})

eventSystem.on('movement', async (data: any) => {
  console.log('Movimentação detectada:', data)
  
  // Detectar se é uma movimentação crítica
  if (eventSystem.detectCriticalEvent(data)) {
    console.log('Movimentação crítica detectada')
    
    // Enviar notificação para gestores
    try {
      await sendNotificationToProjectManagers(data.projectId, {
        type: 'large_withdrawal',
        severity: 'critical',
        project: data.projectName || 'Projeto',
        material: data.materialName,
        quantity: data.quantity,
        user: data.userName,
        details: `Retirada de ${data.quantity} unidades de ${data.materialName} por ${data.userName}`
      })
    } catch (error) {
      console.error('Erro ao enviar notificação de movimentação crítica:', error)
    }
  }
})

eventSystem.on('invite_accepted', async (data: any) => {
  console.log('Convite aceito:', data)
  
  // Enviar notificação para gestores
  try {
    await sendNotificationToProjectManagers(data.projectId, {
      type: 'invite_accepted',
      severity: 'medium',
      project: data.projectName || 'Projeto',
      user: data.userName,
      details: `${data.userName} aceitou o convite para participar do projeto`
    })
  } catch (error) {
    console.error('Erro ao enviar notificação de convite aceito:', error)
  }
})

// Função para enviar notificação para gestores do projeto
export async function sendNotificationToProjectManagers(projectId: string, eventData: any) {
  try {
    console.log('🔍 Debug: Iniciando envio de notificação para gestores')
    console.log('📧 Projeto ID:', projectId)
    console.log('📧 Evento:', eventData)
    
    // Buscar gestores do projeto
    const managers = await getProjectManagers(projectId)
    
    console.log(`📧 Encontrados ${managers.length} gestores para o projeto ${projectId}`)
    console.log('📧 Gestores:', managers.map(m => m.email))
    
    if (managers.length === 0) {
      console.warn('⚠️ Nenhum gestor encontrado para o projeto:', projectId)
      return
    }
    
    for (const manager of managers) {
      try {
        console.log(`📧 Enviando notificação para: ${manager.email}`)
        
        // Converter eventData para NotificationEvent
        const notificationEvent: NotificationEvent = {
          type: eventData.type || 'movement',
          severity: eventData.severity || 'medium',
          project: eventData.project || 'Projeto Atual',
          material: eventData.materialName || eventData.material,
          quantity: eventData.quantity,
          minStock: eventData.minStock,
          userName: eventData.userName || eventData.user,
          justification: eventData.justification,
          details: eventData.details
        }

        console.log('📧 Evento de notificação:', notificationEvent)

        // Enviar notificação diretamente via Gmail SMTP
        const success = await emailService.sendNotification(notificationEvent, manager.email)
        
        if (success) {
          console.log(`✅ Notificação enviada com sucesso para ${manager.email}`)
        } else {
          console.error(`❌ Falha ao enviar notificação para ${manager.email}`)
        }
      } catch (error) {
        console.error(`❌ Erro ao enviar notificação para ${manager.email}:`, error)
      }
    }
  } catch (error) {
    console.error('❌ Erro geral ao enviar notificação para gestores:', error)
  }
}

// Função para buscar gestores do projeto (implementar com Prisma)
async function getProjectManagers(projectId: string) {
  try {
    // Importar Prisma dinamicamente
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    // Buscar gestores do projeto
    const managers = await prisma.projectMember.findMany({
      where: {
        projectId,
        role: 'GESTOR',
        status: 'ATIVO'
      },
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
    })

    await prisma.$disconnect()

    return managers.map(member => ({
      email: member.user.email,
      name: member.user.name
    }))

  } catch (error) {
    console.error('Erro ao buscar gestores:', error)
    return []
  }
}

// Endpoint para emitir eventos (usado por outras APIs)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventType, data } = body

    // Emitir evento
    eventSystem.emit(eventType, data)

    return NextResponse.json({
      message: 'Evento emitido com sucesso',
      eventId: Math.random().toString(36).substr(2, 9)
    })

  } catch (error) {
    console.error('Erro ao emitir evento:', error)
    return NextResponse.json(
      { error: 'Erro ao emitir evento' },
      { status: 500 }
    )
  }
}

// Endpoint para registrar listeners (para desenvolvimento/teste)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventType, callback } = body

    // Registrar listener
    eventSystem.on(eventType, callback)

    return NextResponse.json({
      message: 'Listener registrado com sucesso'
    })

  } catch (error) {
    console.error('Erro ao registrar listener:', error)
    return NextResponse.json(
      { error: 'Erro ao registrar listener' },
      { status: 500 }
    )
  }
}

// Endpoint para obter status do sistema
export async function GET() {
  return NextResponse.json({
    status: 'active',
    listeners: Array.from(eventSystem['listeners'].keys()),
    queueLength: eventSystem['eventQueue'].length,
    isProcessing: eventSystem['isProcessing']
  })
}
