import { NextRequest, NextResponse } from 'next/server'
import { emailService, NotificationEvent } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventType, projectId, materialId, userEmail } = body

    console.log('🧪 Testando evento:', eventType, 'para projeto:', projectId, 'email:', userEmail)

    if (!userEmail) {
      return NextResponse.json({
        error: 'Email do usuário é obrigatório para teste'
      }, { status: 400 })
    }

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

      console.log('📧 Dados do evento de estoque baixo:', testData)

      // Criar evento de notificação
      const notificationEvent: NotificationEvent = {
        type: 'low_stock',
        severity: 'high',
        project: testData.projectName,
        material: testData.materialName,
        quantity: testData.currentStock,
        minStock: testData.minStock,
        details: `Material ${testData.materialName} está com estoque baixo (${testData.currentStock} unidades)`
      }

      // Enviar notificação de teste diretamente
      const success = await emailService.sendNotification(notificationEvent, userEmail)
      
      if (success) {
        console.log('✅ Notificação de estoque baixo enviada com sucesso para:', userEmail)
        return NextResponse.json({
          success: true,
          message: 'Evento de estoque baixo processado e notificação enviada',
          data: testData
        })
      } else {
        throw new Error('Falha ao enviar notificação de estoque baixo')
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

      console.log('📧 Dados do evento de movimentação:', testData)

      // Criar evento de notificação
      const notificationEvent: NotificationEvent = {
        type: 'movement',
        severity: 'medium',
        project: 'Projeto de Teste',
        material: testData.materialName,
        quantity: testData.quantity,
        userName: testData.userName,
        justification: testData.justification,
        details: `Movimentação de ${testData.quantity} unidades de ${testData.materialName} por ${testData.userName}`
      }

      // Enviar notificação de teste diretamente
      const success = await emailService.sendNotification(notificationEvent, userEmail)
      
      if (success) {
        console.log('✅ Notificação de movimentação enviada com sucesso para:', userEmail)
        return NextResponse.json({
          success: true,
          message: 'Evento de movimentação processado e notificação enviada',
          data: testData
        })
      } else {
        throw new Error('Falha ao enviar notificação de movimentação')
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
