import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Tipos para notificações
interface NotificationEvent {
  type: 'low_stock' | 'out_of_stock' | 'large_withdrawal' | 'invite_accepted' | 'general_update'
  severity: 'low' | 'medium' | 'high' | 'critical'
  project: string
  material?: string
  user?: string
  quantity?: number
  details?: string
}

interface NotificationSettings {
  criticalOnly: boolean
  lowStock: boolean
  outOfStock: boolean
  largeWithdrawal: boolean
  inviteAccepted: boolean
  generalUpdates: boolean
  aiDetection: boolean
}

// Interface para templates de email
interface EmailTemplate {
  subject: string
  body: string
}

// Gerador de templates de email usando IA
function generateEmailTemplate(event: NotificationEvent, settings: NotificationSettings): EmailTemplate {
  const templates: Record<string, Record<string, EmailTemplate>> = {
    low_stock: {
      critical: {
        subject: `🚨 ALERTA CRÍTICO: Estoque Baixo - ${event.project}`,
        body: `
          <h2 style="color: #dc2626;">⚠️ Estoque Baixo Detectado</h2>
          <p><strong>Projeto:</strong> ${event.project}</p>
          <p><strong>Material:</strong> ${event.material}</p>
          <p><strong>Quantidade Atual:</strong> ${event.quantity} unidades</p>
          <p><strong>Status:</strong> <span style="color: #dc2626;">CRÍTICO - Ação Imediata Necessária</span></p>
          
          <div style="background: #fef2f2; padding: 15px; border-left: 4px solid #dc2626; margin: 20px 0;">
            <p><strong>Recomendação:</strong> Faça um novo pedido imediatamente para evitar interrupção das atividades.</p>
          </div>
          
          <p>Acesse o sistema para mais detalhes e ações.</p>
        `
      },
      high: {
        subject: `⚠️ Estoque Baixo - ${event.project}`,
        body: `
          <h2 style="color: #f59e0b;">Estoque Baixo Detectado</h2>
          <p><strong>Projeto:</strong> ${event.project}</p>
          <p><strong>Material:</strong> ${event.material}</p>
          <p><strong>Quantidade Atual:</strong> ${event.quantity} unidades</p>
          <p><strong>Status:</strong> <span style="color: #f59e0b;">Atenção - Planeje Reposição</span></p>
          
          <div style="background: #fffbeb; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0;">
            <p><strong>Sugestão:</strong> Considere fazer um pedido nas próximas 48 horas.</p>
          </div>
        `
      }
    },
    out_of_stock: {
      critical: {
        subject: `🚨 EMERGÊNCIA: Produto Esgotado - ${event.project}`,
        body: `
          <h2 style="color: #dc2626;">🚨 Produto Esgotado</h2>
          <p><strong>Projeto:</strong> ${event.project}</p>
          <p><strong>Material:</strong> ${event.material}</p>
          <p><strong>Status:</strong> <span style="color: #dc2626;">ESGOTADO - Ação Urgente</span></p>
          
          <div style="background: #fef2f2; padding: 15px; border-left: 4px solid #dc2626; margin: 20px 0;">
            <p><strong>Ação Imediata:</strong> Entre em contato com fornecedores e faça pedido de emergência.</p>
            <p><strong>Impacto:</strong> Atividades podem ser interrompidas.</p>
          </div>
        `
      }
    },
    large_withdrawal: {
      critical: {
        subject: `🚨 Retirada em Grande Escala - ${event.project}`,
        body: `
          <h2 style="color: #dc2626;">Retirada em Grande Escala Detectada</h2>
          <p><strong>Projeto:</strong> ${event.project}</p>
          <p><strong>Material:</strong> ${event.material}</p>
          <p><strong>Quantidade Retirada:</strong> ${event.quantity} unidades</p>
          <p><strong>Status:</strong> <span style="color: #dc2626;">CRÍTICO - Verificação Necessária</span></p>
          
          <div style="background: #fef2f2; padding: 15px; border-left: 4px solid #dc2626; margin: 20px 0;">
            <p><strong>Atenção:</strong> Esta retirada representa mais de 80% do estoque total.</p>
            <p><strong>Ação:</strong> Verifique se a retirada está correta e planeje reposição.</p>
          </div>
        `
      }
    },
    invite_accepted: {
      medium: {
        subject: `✅ Novo Colaborador - ${event.project}`,
        body: `
          <h2 style="color: #059669;">Colaborador Aceitou Convite</h2>
          <p><strong>Projeto:</strong> ${event.project}</p>
          <p><strong>Usuário:</strong> ${event.user}</p>
          <p><strong>Status:</strong> <span style="color: #059669;">Convite Aceito</span></p>
          
          <div style="background: #f0fdf4; padding: 15px; border-left: 4px solid #059669; margin: 20px 0;">
            <p><strong>Próximos Passos:</strong> O colaborador agora tem acesso ao projeto e pode começar a trabalhar.</p>
          </div>
        `
      }
    },
    general_update: {
      low: {
        subject: `📝 Atualização - ${event.project}`,
        body: `
          <h2 style="color: #6b7280;">Atualização de Estoque</h2>
          <p><strong>Projeto:</strong> ${event.project}</p>
          <p><strong>Material:</strong> ${event.material}</p>
          <p><strong>Usuário:</strong> ${event.user}</p>
          <p><strong>Detalhes:</strong> ${event.details}</p>
          
          <p>Esta é uma atualização de rotina do sistema.</p>
        `
      }
    }
  }

  const template = (templates as any)[event.type]?.[event.severity]
  if (!template) {
    // Fallback para template padrão baseado no tipo de evento
    const fallbackTemplate = getFallbackTemplate(event)
    return fallbackTemplate
  }

  return template
}

// Função para obter template padrão quando não há template específico
function getFallbackTemplate(event: NotificationEvent) {
  const baseSubject = `Notificação - ${event.project}`
  const baseBody = `
    <h2>Evento Detectado</h2>
    <p><strong>Projeto:</strong> ${event.project}</p>
    <p><strong>Tipo:</strong> ${event.type}</p>
    <p><strong>Severidade:</strong> ${event.severity}</p>
    ${event.material ? `<p><strong>Material:</strong> ${event.material}</p>` : ''}
    ${event.user ? `<p><strong>Usuário:</strong> ${event.user}</p>` : ''}
    ${event.quantity ? `<p><strong>Quantidade:</strong> ${event.quantity}</p>` : ''}
    ${event.details ? `<p><strong>Detalhes:</strong> ${event.details}</p>` : ''}
  `

  return {
    subject: baseSubject,
    body: baseBody
  }
}

// Detecção de eventos críticos (sem IA)
function detectCriticalEvent(event: NotificationEvent): boolean {
  // Regras simples para detectar eventos críticos
  const criticalPatterns = [
    // Estoque baixo
    event.type === 'low_stock',
    
    // Produto esgotado
    event.type === 'out_of_stock',
    
    // Retirada em grande escala
    event.type === 'large_withdrawal' && event.quantity && event.quantity > 50,
    
    // Convite aceito
    event.type === 'invite_accepted'
  ]

  return criticalPatterns.some(pattern => pattern)
}

// Função principal para enviar notificação
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event, settings, recipientEmail }: {
      event: NotificationEvent
      settings: NotificationSettings
      recipientEmail: string
    } = body

    // Verificar se deve enviar notificação baseado nas configurações
    const shouldSend = 
      (settings.criticalOnly && ['low_stock', 'out_of_stock', 'large_withdrawal', 'invite_accepted'].includes(event.type)) ||
      (!settings.criticalOnly && settings.generalUpdates) ||
      (settings.aiDetection && detectCriticalEvent(event))

    if (!shouldSend) {
      return NextResponse.json({ message: 'Notificação não enviada conforme configurações' })
    }

    // Gerar template de email
    const emailTemplate = generateEmailTemplate(event, settings)
    
    // Personalizar tom baseado no perfil do gestor (simulação)
    const personalizedSubject = emailTemplate.subject
    const personalizedBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        ${emailTemplate.body}
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px;">
          <h3 style="margin-top: 0;">📊 Análise do Sistema</h3>
          <p><strong>Contexto:</strong> ${event.details || 'Evento detectado automaticamente pelo sistema'}</p>
          <p><strong>Recomendação:</strong> ${detectCriticalEvent(event) ? 'Ação imediata recomendada' : 'Monitoramento contínuo'}</p>
        </div>
        
        <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
          Esta notificação foi gerada automaticamente pelo sistema de gestão de dados.
        </p>
      </div>
    `

    // Enviar email real
    const { data, error } = await resend.emails.send({
      from: 'Sistema de Gestão <noreply@estock.vercel.app>',
      to: [recipientEmail],
      subject: personalizedSubject,
      html: personalizedBody,
    })

    if (error) {
      console.error('Erro ao enviar email:', error)
      return NextResponse.json(
        { error: 'Falha ao enviar notificação', details: error },
        { status: 500 }
      )
    }

    console.log('Email enviado com sucesso:', data?.id)

    return NextResponse.json({
      message: 'Notificação enviada com sucesso',
      emailId: data?.id
    })

  } catch (error) {
    console.error('Erro na API de notificações:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Endpoint para teste de notificação
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { settings, recipientEmail } = body

    const testEvent: NotificationEvent = {
      type: 'low_stock',
      severity: 'high',
      project: 'Projeto Teste',
      material: 'Material de Teste',
      quantity: 5,
      details: 'Esta é uma notificação de teste do sistema'
    }

    const emailTemplate = generateEmailTemplate(testEvent, settings)
    
    const { data, error } = await resend.emails.send({
      from: 'Sistema de Gestão <noreply@estock.vercel.app>',
      to: [recipientEmail],
      subject: `🧪 TESTE: ${emailTemplate.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1e40af; margin: 0;">🧪 Notificação de Teste</h2>
            <p style="margin: 5px 0 0 0;">Esta é uma notificação de teste do sistema de gestão de dados.</p>
          </div>
          
          ${emailTemplate.body}
          
          <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>✅ Teste Concluído:</strong> Se você recebeu este email, o sistema de notificações está funcionando corretamente.</p>
          </div>
        </div>
      `,
    })

    if (error) {
      return NextResponse.json(
        { error: 'Falha ao enviar email de teste' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Email de teste enviado com sucesso',
      emailId: data?.id
    })

  } catch (error) {
    console.error('Erro no teste de notificação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
