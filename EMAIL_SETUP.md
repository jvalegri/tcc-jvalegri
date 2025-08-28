# 📧 Configuração do Serviço de E-mail

## 🚀 Resend - Serviço de E-mail

O EasyStock usa o **Resend** para envio de e-mails de convite. É um serviço moderno, confiável e com boa taxa de entrega.

### 📋 Passos para Configuração:

#### 1. Criar Conta no Resend
- Acesse: [https://resend.com](https://resend.com)
- Crie uma conta gratuita
- Verifique seu domínio de e-mail

#### 2. Obter API Key
- No dashboard do Resend, vá em "API Keys"
- Clique em "Create API Key"
- Copie a chave gerada

#### 3. Configurar Variáveis de Ambiente
Crie um arquivo `.env.local` na raiz do projeto:

```bash
# Email Service (Resend)
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

#### 4. Verificar Configuração
- Reinicie o servidor após adicionar as variáveis
- Teste criando um convite para usuário

### 🔧 Funcionalidades Implementadas:

#### ✅ E-mail de Convite
- **Template HTML responsivo** com design profissional
- **Versão texto** para compatibilidade
- **Informações do projeto** e função
- **Senha inicial** gerada automaticamente
- **Link direto** para aceitar convite

#### ✅ Segurança
- **Token único** para cada convite
- **Expiração automática** (7 dias)
- **Validação de e-mail** e role
- **Prevenção de duplicatas**

#### ✅ UX/UI
- **Design moderno** e responsivo
- **Informações claras** e organizadas
- **Call-to-action** destacado
- **Fallback** para navegadores antigos

### 📱 Template do E-mail:

O e-mail inclui:
- Logo e branding do EasyStock
- Nome do usuário convidado
- Nome do projeto
- Função/role no projeto
- Senha inicial (⚠️ importante)
- Botão de acesso direto
- Link alternativo
- Informações de segurança

### 🧪 Teste:

1. Configure a API key do Resend
2. Crie um projeto
3. Convide um usuário
4. Verifique se o e-mail foi enviado
5. Teste o link de convite

### 💡 Dicas:

- **Domínio verificado**: Use um domínio verificado no Resend para melhor entrega
- **Rate limits**: Resend tem limites generosos para contas gratuitas
- **Monitoramento**: Dashboard do Resend mostra estatísticas de entrega
- **Suporte**: Resend oferece suporte técnico excelente

### 🚨 Troubleshooting:

#### E-mail não enviado:
- Verifique se `RESEND_API_KEY` está configurada
- Confirme se o domínio está verificado no Resend
- Verifique os logs do servidor

#### E-mail na caixa de spam:
- Configure SPF, DKIM e DMARC no seu domínio
- Use domínio verificado no Resend
- Evite palavras que ativem filtros de spam

---

**✅ Sistema de e-mail completamente funcional e profissional!**
