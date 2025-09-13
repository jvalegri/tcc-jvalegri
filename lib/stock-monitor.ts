import { PrismaClient } from '@prisma/client'

interface LowStockEventData {
  materialId: string
  materialName: string
  projectId: string
  projectName: string
  currentStock: number
  minStock: number
  reason: 'status_change' | 'material_created' | 'movement'
}

export async function checkAndEmitLowStockEvent(
  materialId: string,
  currentQuantity: number,
  minStock: number,
  reason: 'status_change' | 'material_created' | 'movement',
  projectId?: string
): Promise<void> {
  try {
    // Se não foi fornecido projectId, buscar
    if (!projectId) {
      const prisma = new PrismaClient()
      try {
        const projectMaterial = await prisma.projectMaterial.findFirst({
          where: { materialId },
          include: { project: true }
        })
        
        if (!projectMaterial) {
          console.warn('Projeto não encontrado para material:', materialId)
          return
        }
        
        projectId = projectMaterial.projectId
      } finally {
        await prisma.$disconnect()
      }
    }

    // Verificar se está com estoque baixo
    const isLowStock = currentQuantity <= minStock
    
    if (isLowStock) {
      console.log(`⚠️ Material com estoque baixo detectado (${reason}):`, materialId)
      
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
            reason: reason
          }

          // Emitir evento de estoque baixo diretamente
          console.log('📧 Emitindo evento de estoque baixo:', eventData)
          
          try {
            // Importar e chamar diretamente o sistema de eventos
            const { sendNotificationToProjectManagers } = await import('@/api/events/route')
            
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
          } catch (error) {
            console.error('❌ Erro ao emitir evento de estoque baixo:', error)
          }
        }
      } finally {
        await prisma.$disconnect()
      }
    }
  } catch (error) {
    console.warn('Erro ao verificar e emitir evento de estoque baixo:', error)
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
    await checkAndEmitLowStockEvent(materialId, newQuantity, newMinStock, 'status_change', projectId)
  }
}
