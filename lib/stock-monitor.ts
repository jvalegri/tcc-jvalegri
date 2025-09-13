import { PrismaClient } from '@prisma/client'
import { emailService, NotificationEvent } from './email-service'

interface LowStockEventData {
  materialId: string
  materialName: string
  projectId: string
  projectName: string
  currentStock: number
  minStock: number
  reason: 'status_change' | 'material_created' | 'movement'
}

// Função para buscar gestores do projeto
async function getProjectManagers(projectId: string) {
  try {
    const prisma = new PrismaClient()
    try {
      const projectMembers = await prisma.projectMember.findMany({
        where: {
          projectId: projectId,
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

      return projectMembers.map(member => ({
        email: member.user.email,
        name: member.user.name
      }))
    } finally {
      await prisma.$disconnect()
    }
  } catch (error) {
    console.error('Erro ao buscar gestores do projeto:', error)
    return []
  }
}

// Função para enviar notificação para gestores do projeto
async function sendNotificationToProjectManagers(projectId: string, eventData: any) {
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

export async function checkAndEmitLowStockEvent(
  materialId: string,
  projectId: string,
  currentQuantity: number,
  minStock: number
): Promise<void> {
  try {
    console.log('🔍 Verificando estoque baixo...')
    console.log('📦 Material ID:', materialId)
    console.log('📊 Estoque atual:', currentQuantity)
    console.log('📊 Estoque mínimo:', minStock)
    
    // Verificar se está com estoque baixo
    const isLowStock = currentQuantity <= minStock
    
    if (isLowStock) {
      console.log(`⚠️ Material com estoque baixo detectado!`)
      
      // Buscar informações do projeto e material
      const prisma = new PrismaClient()
      try {
        const projectMaterial = await prisma.projectMaterial.findFirst({
          where: { materialId, projectId },
          include: { 
            project: true,
            material: true
          }
        })

        if (projectMaterial) {
          const eventData: LowStockEventData = {
            materialId: projectMaterial.material.id,
            materialName: projectMaterial.material.name,
            projectId: projectMaterial.projectId,
            projectName: projectMaterial.project.name,
            currentStock: currentQuantity,
            minStock: minStock,
            reason: 'movement'
          }

          // Emitir evento de estoque baixo diretamente
          console.log('📧 Emitindo evento de estoque baixo:', eventData)
          
          // Criar dados do evento no formato esperado
          const eventDataForNotification = {
            type: 'low_stock',
            severity: 'high',
            project: eventData.projectName,
            material: eventData.materialName,
            quantity: eventData.currentStock,
            minStock: eventData.minStock,
            details: `Material ${eventData.materialName} está com estoque baixo (${eventData.currentStock} unidades). Estoque mínimo: ${eventData.minStock} unidades.`
          }
          
          // Chamar função de notificação diretamente
          await sendNotificationToProjectManagers(eventData.projectId, eventDataForNotification)
          
          console.log('✅ Evento de estoque baixo emitido com sucesso:', eventData.materialName)
        } else {
          console.warn('⚠️ Projeto ou material não encontrado')
        }
      } finally {
        await prisma.$disconnect()
      }
    } else {
      console.log('✅ Estoque dentro do limite normal')
    }
  } catch (error) {
    console.error('❌ Erro ao verificar e emitir evento de estoque baixo:', error)
  }
}

export async function checkMaterialStatusChange(
  materialId: string,
  oldQuantity: number,
  oldMinStock: number,
  newQuantity: number,
  newMinStock: number,
  projectId?: string
): Promise<void> {
  const wasLowStock = oldQuantity <= oldMinStock
  const isLowStock = newQuantity <= newMinStock
  
  // Se mudou para estoque baixo
  if (!wasLowStock && isLowStock) {
    if (projectId) {
      await checkAndEmitLowStockEvent(materialId, projectId, newQuantity, newMinStock)
    }
  }
}