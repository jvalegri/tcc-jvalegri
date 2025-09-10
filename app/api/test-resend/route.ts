import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    console.log('🔍 Testando configuração Resend...')
    console.log('📧 Email:', email)
    console.log('🔑 API Key presente:', !!process.env.RESEND_API_KEY)
    console.log('🔑 API Key (primeiros 10 chars):', process.env.RESEND_API_KEY?.substring(0, 10))

    if (!email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 })
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: 'RESEND_API_KEY não configurada' }, { status: 500 })
    }

    // Teste simples
    const { data, error } = await resend.emails.send({
      from: 'Teste <noreply@estock.vercel.app>',
      to: [email],
      subject: 'Teste Simples',
      html: '<p>Este é um teste simples do Resend.</p>',
    })

    if (error) {
      console.error('❌ Erro do Resend:', error)
      return NextResponse.json({ 
        error: 'Erro do Resend', 
        details: error,
        config: {
          hasApiKey: !!process.env.RESEND_API_KEY,
          apiKeyPrefix: process.env.RESEND_API_KEY?.substring(0, 10),
          from: 'noreply@estock.vercel.app'
        }
      }, { status: 500 })
    }

    console.log('✅ Email enviado com sucesso:', data?.id)

    return NextResponse.json({
      success: true,
      message: 'Email enviado com sucesso',
      emailId: data?.id,
      config: {
        hasApiKey: !!process.env.RESEND_API_KEY,
        apiKeyPrefix: process.env.RESEND_API_KEY?.substring(0, 10),
        from: 'noreply@estock.vercel.app'
      }
    })

  } catch (error) {
    console.error('❌ Erro geral:', error)
    return NextResponse.json({
      error: 'Erro interno',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
      config: {
        hasApiKey: !!process.env.RESEND_API_KEY,
        apiKeyPrefix: process.env.RESEND_API_KEY?.substring(0, 10)
      }
    }, { status: 500 })
  }
}
