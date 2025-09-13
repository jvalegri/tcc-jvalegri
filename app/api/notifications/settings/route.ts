import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { settings, userId, projectId } = body

    console.log('💾 Salvando configurações de notificação:', {
      userId,
      projectId,
      settings
    })

    // Importar Prisma apenas quando necessário (runtime)
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    try {
      // Buscar ou criar configurações do usuário para o projeto
      const existingSettings = await prisma.userNotificationSettings.findFirst({
        where: {
          userId: userId,
          projectId: projectId
        }
      })

      if (existingSettings) {
        // Atualizar configurações existentes
        await prisma.userNotificationSettings.update({
          where: { id: existingSettings.id },
          data: {
            criticalOnly: settings.criticalOnly,
            lowStock: settings.lowStock,
            movementAlerts: settings.movementAlerts,
            aiDetection: settings.aiDetection,
            generalUpdates: settings.generalUpdates,
            updatedAt: new Date()
          }
        })
        console.log('✅ Configurações atualizadas')
      } else {
        // Criar novas configurações
        await prisma.userNotificationSettings.create({
          data: {
            userId: userId,
            projectId: projectId,
            criticalOnly: settings.criticalOnly,
            lowStock: settings.lowStock,
            movementAlerts: settings.movementAlerts,
            aiDetection: settings.aiDetection,
            generalUpdates: settings.generalUpdates
          }
        })
        console.log('✅ Configurações criadas')
      }

      return NextResponse.json({
        success: true,
        message: 'Configurações salvas com sucesso'
      })

    } finally {
      await prisma.$disconnect()
    }

  } catch (error) {
    console.error('❌ Erro ao salvar configurações:', error)
    return NextResponse.json({
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const projectId = searchParams.get('projectId')

    if (!userId || !projectId) {
      return NextResponse.json({
        error: 'userId e projectId são obrigatórios'
      }, { status: 400 })
    }

    // Importar Prisma apenas quando necessário (runtime)
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    try {
      const settings = await prisma.userNotificationSettings.findFirst({
        where: {
          userId: userId,
          projectId: projectId
        }
      })

      if (settings) {
        return NextResponse.json({
          settings: {
            criticalOnly: settings.criticalOnly,
            lowStock: settings.lowStock,
            movementAlerts: settings.movementAlerts,
            aiDetection: settings.aiDetection,
            generalUpdates: settings.generalUpdates
          }
        })
      } else {
        // Retornar configurações padrão se não existirem
        return NextResponse.json({
          settings: {
            criticalOnly: true,
            lowStock: true,
            movementAlerts: false,
            aiDetection: false,
            generalUpdates: false
          }
        })
      }

    } finally {
      await prisma.$disconnect()
    }

  } catch (error) {
    console.error('❌ Erro ao buscar configurações:', error)
    return NextResponse.json({
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
