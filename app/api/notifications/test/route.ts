import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { settings, recipientEmail } = body

    if (!recipientEmail) {
      return NextResponse.json(
        { error: 'Email do destinatário é obrigatório' },
        { status: 400 }
      )
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: 'Chave da API Resend não configurada' },
        { status: 500 }
      )
    }

    // Criar evento de teste
    const testEvent = {
      type: 'low_stock',
      severity: 'high',
      project: 'Projeto Teste',
      material: 'Material de Teste',
      quantity: 5,
      details: 'Esta é uma notificação de teste do sistema'
    }

    // Gerar template de email de teste
    const emailSubject = `🧪 TESTE: Notificação de Teste - ${testEvent.project}`
    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #1e40af; margin: 0;">🧪 Notificação de Teste</h2>
          <p style="margin: 5px 0 0 0;">Esta é uma notificação de teste do sistema de gestão de dados.</p>
        </div>
        
        <h2 style="color: #f59e0b;">Estoque Baixo Detectado</h2>
        <p><strong>Projeto:</strong> ${testEvent.project}</p>
        <p><strong>Material:</strong> ${testEvent.material}</p>
        <p><strong>Quantidade Atual:</strong> ${testEvent.quantity} unidades</p>
        <p><strong>Status:</strong> <span style="color: #f59e0b;">Atenção - Planeje Reposição</span></p>
        
        <div style="background: #fffbeb; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0;">
          <p><strong>Sugestão:</strong> Considere fazer um pedido nas próximas 48 horas.</p>
        </div>
        
        <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>✅ Teste Concluído:</strong> Se você recebeu este email, o sistema de notificações está funcionando corretamente.</p>
        </div>
        
        <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
          Esta notificação foi gerada automaticamente pelo sistema de gestão de dados.
        </p>
      </div>
    `

    // Enviar email diretamente
    const { data, error } = await resend.emails.send({
      from: 'Sistema de Gestão <noreply@estock.vercel.app>',
      to: [recipientEmail],
      subject: emailSubject,
      html: emailBody,
    })

    if (error) {
      console.error('Erro ao enviar email de teste:', error)
      return NextResponse.json(
        { error: 'Falha ao enviar email de teste', details: error },
        { status: 500 }
      )
    }

    console.log('Email de teste enviado com sucesso:', data?.id)

    return NextResponse.json({
      message: 'Email de teste enviado com sucesso',
      emailId: data?.id
    })

  } catch (error) {
    console.error('Erro no teste de notificação:', error)
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
