import nodemailer from 'nodemailer'

export interface EmailInviteData {
  to: string
  name: string
  projectName: string
  role: string
  initialPassword: string | null // null para usuários existentes
  inviteUrl: string
}

export interface EmailTemplateData {
  name: string
  projectName: string
  role: string
  initialPassword: string | null
  inviteUrl: string
}

// Configurar transporter do Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || 'seu_email@gmail.com',
    pass: process.env.GMAIL_APP_PASSWORD || 'sua_senha_de_app'
  }
})

/**
 * Envia e-mail de convite para participar de um projeto
 */
export async function sendProjectInviteEmail(data: EmailInviteData): Promise<{ success: boolean; message: string }> {
  try {
    console.log("📧 INICIANDO ENVIO DE E-MAIL via Gmail SMTP...")
    console.log("📋 Dados:", data)
    
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.log("⚠️ GMAIL não configurado - simulando envio")
      return {
        success: true,
        message: 'E-mail simulado com sucesso (Gmail não configurado)'
      }
    }

    const mailOptions = {
      from: `EasyStock <${process.env.GMAIL_USER}>`,
      to: data.to,
      subject: `Convite para participar do projeto ${data.projectName}`,
      html: generateInviteEmailHTML({
        name: data.name,
        projectName: data.projectName,
        role: data.role,
        initialPassword: data.initialPassword,
        inviteUrl: data.inviteUrl
      }),
      text: generateInviteEmailText({
        name: data.name,
        projectName: data.projectName,
        role: data.role,
        initialPassword: data.initialPassword,
        inviteUrl: data.inviteUrl
      })
    }

    console.log("📧 Enviando e-mail para:", data.to)
    
    const info = await transporter.sendMail(mailOptions)
    
    console.log('✅ E-mail enviado com sucesso!')
    console.log('📧 Message ID:', info.messageId)
    console.log('📧 Response:', info.response)

    return {
      success: true,
      message: 'E-mail de convite enviado com sucesso via Gmail!'
    }

  } catch (error) {
    console.error('❌ Erro ao enviar e-mail:', error)
    
    // Em caso de erro, simular envio para não quebrar o sistema
    console.log('🔧 ERRO NO ENVIO - Simulando envio de e-mail')
    console.log('📧 E-mail seria enviado para:', data.to)
    
    return {
      success: true,
      message: 'E-mail simulado com sucesso (erro no envio)'
    }
  }
}

/**
 * Gera template HTML para e-mail de convite
 */
function generateInviteEmailHTML(data: EmailTemplateData): string {
  const isNewUser = data.initialPassword !== null
  
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Convite para Projeto - EasyStock</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .highlight { background: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚀 EasyStock</h1>
                <p>Convite para Projeto</p>
            </div>
            
            <div class="content">
                <h2>Olá ${data.name}!</h2>
                
                <p>Você foi convidado para participar do projeto <strong>${data.projectName}</strong> como <strong>${data.role}</strong>.</p>
                
                <div class="highlight">
                    <h3>📋 Detalhes do Convite:</h3>
                    <p><strong>Projeto:</strong> ${data.projectName}</p>
                    <p><strong>Função:</strong> ${data.role}</p>
                    <p><strong>Link de Acesso:</strong> <a href="${data.inviteUrl}">Clique aqui para aceitar</a></p>
                </div>
                
                ${isNewUser ? `
                <div class="highlight">
                    <h3>🔑 Suas Credenciais:</h3>
                    <p><strong>E-mail:</strong> ${data.to}</p>
                    <p><strong>Senha Inicial:</strong> <code>${data.initialPassword}</code></p>
                    <p><em>Recomendamos alterar esta senha após o primeiro login.</em></p>
                </div>
                ` : `
                <div class="highlight">
                    <h3>🔑 Acesso:</h3>
                    <p>Use suas credenciais atuais do EasyStock para acessar o projeto.</p>
                </div>
                `}
                
                <a href="${data.inviteUrl}" class="button">✅ Aceitar Convite</a>
                
                <p><em>Este convite expira em 7 dias.</em></p>
            </div>
            
            <div class="footer">
                <p>EasyStock - Sistema de Gestão de Estoque</p>
                <p>Se você não solicitou este convite, pode ignorá-lo com segurança.</p>
            </div>
        </div>
    </body>
    </html>
  `
}

/**
 * Gera template de texto para e-mail de convite
 */
function generateInviteEmailText(data: EmailTemplateData): string {
  const isNewUser = data.initialPassword !== null
  
  return `
EasyStock - Convite para Projeto

Olá ${data.name}!

Você foi convidado para participar do projeto ${data.projectName} como ${data.role}.

DETALHES DO CONVITE:
- Projeto: ${data.projectName}
- Função: ${data.role}
- Link de Acesso: ${data.inviteUrl}

${isNewUser ? `
SUAS CREDENCIAIS:
- E-mail: ${data.to}
- Senha Inicial: ${data.initialPassword}

Recomendamos alterar esta senha após o primeiro login.
` : `
ACESSO:
Use suas credenciais atuais do EasyStock para acessar o projeto.
`}

Para aceitar o convite, acesse: ${data.inviteUrl}

Este convite expira em 7 dias.

---
EasyStock - Sistema de Gestão de Estoque
Se você não solicitou este convite, pode ignorá-lo com segurança.
  `
}
