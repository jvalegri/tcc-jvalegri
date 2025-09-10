import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    console.log('🔍 Testando envio de email via Gmail SMTP...')
    console.log('📧 Email:', email)
    console.log('🔑 Gmail User:', process.env.GMAIL_USER)
    console.log('🔑 Gmail App Password presente:', !!process.env.GMAIL_APP_PASSWORD)

    if (!email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 })
    }

    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      return NextResponse.json({ 
        error: 'Configuração Gmail incompleta',
        details: {
          hasUser: !!process.env.GMAIL_USER,
          hasPassword: !!process.env.GMAIL_APP_PASSWORD
        }
      }, { status: 500 })
    }

    // Enviar email de teste
    const success = await emailService.sendTestEmail(email)

    if (success) {
      console.log('✅ Email de teste enviado com sucesso via Gmail SMTP')
      return NextResponse.json({
        success: true,
        message: 'Email de teste enviado com sucesso via Gmail SMTP',
        config: {
          hasUser: !!process.env.GMAIL_USER,
          hasPassword: !!process.env.GMAIL_APP_PASSWORD,
          service: 'Gmail SMTP'
        }
      })
    } else {
      return NextResponse.json({
        error: 'Falha ao enviar email via Gmail SMTP',
        config: {
          hasUser: !!process.env.GMAIL_USER,
          hasPassword: !!process.env.GMAIL_APP_PASSWORD,
          service: 'Gmail SMTP'
        }
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ Erro geral:', error)
    return NextResponse.json({
      error: 'Erro interno',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
      config: {
        hasUser: !!process.env.GMAIL_USER,
        hasPassword: !!process.env.GMAIL_APP_PASSWORD,
        service: 'Gmail SMTP'
      }
    }, { status: 500 })
  }
}
