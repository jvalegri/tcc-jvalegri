# 🚀 **EasyStock - Sistema de Gestão de Estoque**

## 📋 **Descrição**
Sistema completo de gestão de estoque desenvolvido como TCC, com funcionalidades de controle de materiais, movimentações, usuários e projetos.

---

## 🌐 **Acesso Online (Recomendado)**

### **URL da Aplicação:**
```
https://easystock-tcc.vercel.app
```

### **Como Acessar:**
1. **Abra o link** no seu navegador
2. **Crie uma conta** ou faça login
3. **Teste todas as funcionalidades**

---

## 💻 **Instalação Local (Para Desenvolvedores)**

### **Pré-requisitos:**
- Node.js 18+ 
- npm ou pnpm
- MongoDB (local ou Atlas)

### **Passos:**
```bash
# 1. Clonar o repositório
git clone https://github.com/seu-usuario/easystock-tcc.git
cd easystock-tcc

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações

# 4. Configurar banco de dados
npx prisma db push

# 5. Executar aplicação
npm run dev
```

---

## 🔧 **Configuração**

### **Variáveis de Ambiente (.env):**
```bash
# Banco de Dados
DATABASE_URL="mongodb://localhost:27017/easystock"

# Gmail SMTP (para e-mails)
GMAIL_USER="seu_email@gmail.com"
GMAIL_APP_PASSWORD="sua_senha_de_app"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 📱 **Funcionalidades Principais**

### **👥 Gestão de Usuários:**
- ✅ Cadastro e login
- ✅ Perfis personalizáveis
- ✅ Sistema de roles (GESTOR/COLABORADOR)
- ✅ Alteração de senha

### **🏗️ Gestão de Projetos:**
- ✅ Criação de projetos
- ✅ Convites por e-mail
- ✅ Controle de acesso
- ✅ Múltiplos projetos

### **📦 Gestão de Materiais:**
- ✅ Cadastro de materiais
- ✅ Controle de estoque
- ✅ Preços e fornecedores
- ✅ Estoque mínimo

### **📊 Movimentações:**
- ✅ Entrada e saída
- ✅ Histórico completo
- ✅ Scanner QR Code
- ✅ Relatórios

### **📧 Sistema de Convites:**
- ✅ Convites por e-mail
- ✅ Templates profissionais
- ✅ Aceite automático
- ✅ Controle de status

---

## 🧪 **Como Testar**

### **1. Criação de Conta:**
- Acesse a aplicação
- Clique em "Criar Conta"
- Preencha seus dados
- Confirme o cadastro

### **2. Criação de Projeto:**
- Faça login
- Clique em "Criar Projeto"
- Preencha nome e descrição
- Confirme a criação

### **3. Convite de Usuário:**
- No projeto criado
- Clique em "Gestão de Usuários"
- Clique em "Convidar Usuário"
- Preencha e-mail e role
- Envie o convite

### **4. Teste de E-mail:**
- Verifique se o convite foi enviado
- Confirme se chegou na caixa de entrada
- Teste o link de aceite

---

## 📊 **Estrutura do Banco**

### **Tabelas Principais:**
- **Users**: Usuários do sistema
- **Projects**: Projetos criados
- **ProjectMembers**: Membros dos projetos
- **ProjectInvites**: Convites pendentes
- **Materials**: Materiais cadastrados
- **MovementRecords**: Histórico de movimentações

---

## 🚀 **Deploy**

### **Vercel (Recomendado):**
```bash
# 1. Conectar GitHub
# 2. Configurar variáveis de ambiente
# 3. Deploy automático
```

### **Outras Opções:**
- **Netlify**: Deploy gratuito
- **Railway**: Deploy com banco
- **Heroku**: Deploy tradicional

---

## 📚 **Tecnologias Utilizadas**

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, Shadcn/UI
- **Backend**: Next.js API Routes
- **Banco**: MongoDB + Prisma ORM
- **E-mail**: Nodemailer + Gmail SMTP
- **Autenticação**: JWT + bcrypt
- **Deploy**: Vercel

---

## 🎯 **Para Apresentação do TCC**

### **Demonstração Recomendada:**
1. **Criar conta** em tempo real
2. **Criar projeto** com nome do TCC
3. **Convidar usuário** (mostrar e-mail real)
4. **Cadastrar materiais** e movimentações
5. **Mostrar dashboard** com dados
6. **Demonstrar scanner** QR Code

### **Destaques:**
- ✅ **Sistema completo** e funcional
- ✅ **E-mails reais** funcionando
- ✅ **Interface profissional** e responsiva
- ✅ **Banco de dados** persistente
- ✅ **Deploy online** para demonstração

---

## 🆘 **Suporte**

### **Problemas Comuns:**
- **E-mail não enviado**: Verificar configuração Gmail
- **Erro de banco**: Verificar DATABASE_URL
- **Build falhou**: Verificar dependências

### **Contato:**
- **Email**: seu-email@exemplo.com
- **GitHub**: https://github.com/seu-usuario
- **LinkedIn**: https://linkedin.com/in/seu-perfil

---

## 📄 **Licença**

Este projeto foi desenvolvido como Trabalho de Conclusão de Curso (TCC) e está disponível para fins educacionais.

---

**🎉 Sistema pronto para demonstração e testes! 🚀**