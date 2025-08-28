# 🆓 **CONFIGURAÇÃO GRATUITA DO GMAIL SMTP**

## 🎯 **Para seu TCC - 100% GRATUITO!**

### **✅ Vantagens:**
- **500 e-mails/dia** gratuitos
- **Configuração simples**
- **Funciona perfeitamente** para demonstração
- **Sem custos** mensais
- **Profissional** para apresentação

---

## 🚀 **PASSO A PASSO:**

### **1. Ativar Autenticação de 2 Fatores no Gmail:**
1. Acesse: [myaccount.google.com](https://myaccount.google.com)
2. **Segurança** → **Verificação em duas etapas**
3. **Ativar** verificação em duas etapas

### **2. Gerar Senha de App:**
1. **Segurança** → **Senhas de app**
2. **Selecionar app**: "Email"
3. **Selecionar dispositivo**: "Outro (nome personalizado)"
4. **Digite**: "EasyStock TCC"
5. **Clicar**: "Gerar"
6. **Copiar** a senha de 16 caracteres

### **3. Configurar .env:**
```bash
# Gmail SMTP (Alternativa gratuita)
GMAIL_USER="seu_email@gmail.com"
GMAIL_APP_PASSWORD="abcd efgh ijkl mnop"
```

### **4. Reiniciar Servidor:**
```bash
npm run dev
```

---

## 🔧 **CONFIGURAÇÃO ALTERNATIVA:**

### **Se preferir usar outro e-mail:**
```bash
# Outlook/Hotmail
GMAIL_USER="seu_email@outlook.com"
GMAIL_APP_PASSWORD="sua_senha_de_app"

# Ou criar e-mail específico para o TCC
GMAIL_USER="easystock.tcc@gmail.com"
GMAIL_APP_PASSWORD="senha_de_app_gerada"
```

---

## 🧪 **TESTE:**

### **1. Enviar Convite:**
- Crie um projeto
- Convide um usuário
- Verifique se o e-mail foi enviado

### **2. Verificar Logs:**
```bash
# No console do servidor você deve ver:
📧 INICIANDO ENVIO DE E-MAIL via Gmail SMTP...
✅ E-mail enviado com sucesso!
📧 Message ID: [ID_DO_EMAIL]
```

---

## 📧 **EXEMPLO DE E-MAIL ENVIADO:**

**De:** `EasyStock <seu_email@gmail.com>`
**Para:** `usuario@teste.com`
**Assunto:** `Convite para participar do projeto [Nome do Projeto]`

**Conteúdo:**
- Template HTML profissional
- Informações do projeto
- Link para aceitar convite
- Design responsivo

---

## 🎉 **RESULTADO FINAL:**

✅ **E-mails reais** enviados via Gmail
✅ **Sistema profissional** para apresentação
✅ **100% gratuito** para seu TCC
✅ **Funciona perfeitamente** para demonstração
✅ **Sem limitações** de domínio

---

## 💡 **DICAS PARA APRESENTAÇÃO:**

1. **Configure antes** da apresentação
2. **Teste com e-mails reais**
3. **Mostre o processo** de convite
4. **Demonstre** a funcionalidade completa
5. **Destaque** que é gratuito e profissional

---

## 🆘 **SOLUÇÃO DE PROBLEMAS:**

### **Erro: "Invalid login"**
- Verifique se a **senha de app** está correta
- Confirme se **2FA** está ativado

### **Erro: "Less secure app access"**
- Use **senha de app** (não senha normal)
- **2FA** deve estar ativado

### **E-mail não enviado**
- Verifique as **variáveis de ambiente**
- Confirme se o **servidor foi reiniciado**

---

**🎯 Sistema pronto para apresentação do TCC! 🚀**
