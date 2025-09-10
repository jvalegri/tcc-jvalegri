import nodemailer from 'nodemailer'

interface EmailTemplate {
  subject: string
  html: string
}

interface NotificationEvent {
  type: 'low_stock' | 'movement' | 'invite_accepted' | 'large_withdrawal' | 'out_of_stock'
  severity: 'low' | 'medium' | 'high' | 'critical'
  project: string
  material?: string
  quantity?: number
  minStock?: number
  userName?: string
  justification?: string
  details?: string
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null

  constructor() {
    this.initializeTransporter()
  }

  private initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD
        }
      })
      console.log('✅ Gmail SMTP configurado com sucesso')
    } catch (error) {
      console.error('❌ Erro ao configurar Gmail SMTP:', error)
    }
  }

  private generateEmailTemplate(event: NotificationEvent): EmailTemplate {
    const { type, severity, project, material, quantity, minStock, userName, justification, details } = event

    // Cores baseadas na severidade
    const severityColors = {
      low: '#10b981',      // verde
      medium: '#f59e0b',   // amarelo
      high: '#f97316',     // laranja
      critical: '#ef4444'   // vermelho
    }

    const severityIcons = {
      low: '🟢',
      medium: '🟡',
      high: '🟠',
      critical: '🔴'
    }

    const severityLabels = {
      low: 'Baixa Prioridade',
      medium: 'Média Prioridade',
      high: 'Alta Prioridade',
      critical: 'Crítica'
    }

    let subject = ''
    let html = ''

    switch (type) {
      case 'low_stock':
        subject = `${severityIcons[severity]} Estoque Baixo - ${project}`
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
            <div style="background: ${severityColors[severity]}; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">⚠️ Estoque Baixo Detectado</h1>
              <p style="margin: 5px 0 0 0; opacity: 0.9;">${severityLabels[severity]}</p>
            </div>
            
            <div style="padding: 20px;">
              <h2 style="color: #374151; margin-top: 0;">📦 Detalhes do Material</h2>
              <div style="background: #f9fafb; padding: 15px; border-radius: 6px; margin: 15px 0;">
                <p><strong>Projeto:</strong> ${project}</p>
                <p><strong>Material:</strong> ${material}</p>
                <p><strong>Quantidade Atual:</strong> <span style="color: ${severityColors[severity]}; font-weight: bold;">${quantity} unidades</span></p>
                <p><strong>Estoque Mínimo:</strong> ${minStock} unidades</p>
              </div>
              
              <div style="background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 15px 0;">
                <p><strong>💡 Recomendação:</strong> Considere fazer um pedido nas próximas 48 horas para evitar falta de estoque.</p>
              </div>
            </div>
            
            <div style="background: #f3f4f6; padding: 15px; text-align: center; color: #6b7280; font-size: 12px;">
              Sistema de Gestão de Materiais - ${new Date().toLocaleDateString('pt-BR')}
            </div>
          </div>
        `
        break

      case 'movement':
        subject = `📋 Nova Movimentação - ${project}`
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
            <div style="background: #3b82f6; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">📋 Nova Movimentação Registrada</h1>
            </div>
            
            <div style="padding: 20px;">
              <h2 style="color: #374151; margin-top: 0;">📦 Detalhes da Movimentação</h2>
              <div style="background: #f9fafb; padding: 15px; border-radius: 6px; margin: 15px 0;">
                <p><strong>Projeto:</strong> ${project}</p>
                <p><strong>Material:</strong> ${material}</p>
                <p><strong>Quantidade:</strong> ${quantity} unidades</p>
                <p><strong>Responsável:</strong> ${userName}</p>
                <p><strong>Justificativa:</strong> ${justification || 'Não informada'}</p>
              </div>
            </div>
            
            <div style="background: #f3f4f6; padding: 15px; text-align: center; color: #6b7280; font-size: 12px;">
              Sistema de Gestão de Materiais - ${new Date().toLocaleDateString('pt-BR')}
            </div>
          </div>
        `
        break

      case 'invite_accepted':
        subject = `✅ Convite Aceito - ${project}`
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
            <div style="background: #10b981; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">✅ Convite Aceito</h1>
            </div>
            
            <div style="padding: 20px;">
              <h2 style="color: #374151; margin-top: 0;">👥 Novo Membro no Projeto</h2>
              <div style="background: #f0fdf4; padding: 15px; border-radius: 6px; margin: 15px 0;">
                <p><strong>Projeto:</strong> ${project}</p>
                <p><strong>Usuário:</strong> ${userName}</p>
                <p><strong>Status:</strong> <span style="color: #10b981; font-weight: bold;">Ativo</span></p>
              </div>
            </div>
            
            <div style="background: #f3f4f6; padding: 15px; text-align: center; color: #6b7280; font-size: 12px;">
              Sistema de Gestão de Materiais - ${new Date().toLocaleDateString('pt-BR')}
            </div>
          </div>
        `
        break

      case 'large_withdrawal':
        subject = `⚠️ Retirada em Grande Escala - ${project}`
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
            <div style="background: #f59e0b; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">⚠️ Retirada em Grande Escala</h1>
            </div>
            
            <div style="padding: 20px;">
              <h2 style="color: #374151; margin-top: 0;">📦 Detalhes da Retirada</h2>
              <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin: 15px 0;">
                <p><strong>Projeto:</strong> ${project}</p>
                <p><strong>Material:</strong> ${material}</p>
                <p><strong>Quantidade Retirada:</strong> <span style="color: #f59e0b; font-weight: bold;">${quantity} unidades</span></p>
                <p><strong>Responsável:</strong> ${userName}</p>
                <p><strong>Justificativa:</strong> ${justification || 'Não informada'}</p>
              </div>
              
              <div style="background: #fef2f2; padding: 15px; border-left: 4px solid #ef4444; margin: 15px 0;">
                <p><strong>⚠️ Atenção:</strong> Esta retirada representa mais de 80% do estoque total. Verifique se é necessário repor o material.</p>
              </div>
            </div>
            
            <div style="background: #f3f4f6; padding: 15px; text-align: center; color: #6b7280; font-size: 12px;">
              Sistema de Gestão de Materiais - ${new Date().toLocaleDateString('pt-BR')}
            </div>
          </div>
        `
        break

      case 'out_of_stock':
        subject = `🚨 Estoque Esgotado - ${project}`
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
            <div style="background: #ef4444; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">🚨 Estoque Esgotado</h1>
            </div>
            
            <div style="padding: 20px;">
              <h2 style="color: #374151; margin-top: 0;">📦 Material Indisponível</h2>
              <div style="background: #fef2f2; padding: 15px; border-radius: 6px; margin: 15px 0;">
                <p><strong>Projeto:</strong> ${project}</p>
                <p><strong>Material:</strong> ${material}</p>
                <p><strong>Quantidade Atual:</strong> <span style="color: #ef4444; font-weight: bold;">0 unidades</span></p>
                <p><strong>Estoque Mínimo:</strong> ${minStock} unidades</p>
              </div>
              
              <div style="background: #fef2f2; padding: 15px; border-left: 4px solid #ef4444; margin: 15px 0;">
                <p><strong>🚨 Ação Urgente:</strong> O material está completamente esgotado. Faça um pedido imediatamente para evitar interrupções no projeto.</p>
              </div>
            </div>
            
            <div style="background: #f3f4f6; padding: 15px; text-align: center; color: #6b7280; font-size: 12px;">
              Sistema de Gestão de Materiais - ${new Date().toLocaleDateString('pt-BR')}
            </div>
          </div>
        `
        break

      default:
        subject = `📧 Notificação - ${project}`
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
            <div style="background: #6b7280; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">📧 Notificação do Sistema</h1>
            </div>
            
            <div style="padding: 20px;">
              <p><strong>Projeto:</strong> ${project}</p>
              <p><strong>Detalhes:</strong> ${details || 'Notificação do sistema'}</p>
            </div>
            
            <div style="background: #f3f4f6; padding: 15px; text-align: center; color: #6b7280; font-size: 12px;">
              Sistema de Gestão de Materiais - ${new Date().toLocaleDateString('pt-BR')}
            </div>
          </div>
        `
    }

    return { subject, html }
  }

  async sendNotification(event: NotificationEvent, recipientEmail: string): Promise<boolean> {
    if (!this.transporter) {
      console.error('❌ Transporter não inicializado')
      return false
    }

    try {
      const template = this.generateEmailTemplate(event)
      
      const mailOptions = {
        from: `Sistema de Gestão <${process.env.GMAIL_USER}>`,
        to: recipientEmail,
        subject: template.subject,
        html: template.html
      }

      const result = await this.transporter.sendMail(mailOptions)
      console.log('✅ Email enviado com sucesso:', result.messageId)
      return true

    } catch (error) {
      console.error('❌ Erro ao enviar email:', error)
      return false
    }
  }

  async sendTestEmail(recipientEmail: string): Promise<boolean> {
    const testEvent: NotificationEvent = {
      type: 'low_stock',
      severity: 'high',
      project: 'Projeto Teste',
      material: 'Material de Teste',
      quantity: 5,
      minStock: 10,
      userName: 'Sistema',
      details: 'Este é um email de teste do sistema de notificações'
    }

    return await this.sendNotification(testEvent, recipientEmail)
  }
}

export const emailService = new EmailService()
export type { NotificationEvent }