# Testando as APIs de Autenticação

## 1. Teste de Cadastro (Signup)

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@exemplo.com",
    "password": "123456"
  }'
```

**Resposta esperada (sucesso):**
```json
{
  "id": "user_id_here",
  "email": "joao@exemplo.com",
  "name": "João Silva",
  "projects": []
}
```

## 2. Teste de Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@exemplo.com",
    "password": "123456"
  }'
```

**Resposta esperada (sucesso):**
```json
{
  "id": "user_id_here",
  "email": "joao@exemplo.com",
  "name": "João Silva",
  "projects": []
}
```

## 3. Teste de Login com Credenciais Inválidas

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario_inexistente@exemplo.com",
    "password": "senha_errada"
  }'
```

**Resposta esperada (erro):**
```json
{
  "message": "Email ou senha incorretos."
}
```

## 4. Teste de Busca de Projetos

```bash
curl "http://localhost:3000/api/auth/projects?userId=USER_ID_AQUI"
```

**Resposta esperada:**
```json
[]
```

## 5. Teste de Criação de Projeto

```bash
curl -X POST http://localhost:3000/api/auth/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Meu Primeiro Projeto",
    "description": "Descrição do projeto",
    "userId": "USER_ID_AQUI"
  }'
```

**Resposta esperada (sucesso):**
```json
{
  "id": "project_id_here",
  "name": "Meu Primeiro Projeto",
  "description": "Descrição do projeto"
}
```

## 6. Teste de Criação de Projeto sem Nome

```bash
curl -X POST http://localhost:3000/api/auth/projects \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Descrição do projeto",
    "userId": "USER_ID_AQUI"
  }'
```

**Resposta esperada (erro):**
```json
{
  "message": "Nome do projeto e ID do usuário são obrigatórios."
}
```

## 7. Teste de Cadastro com Email Duplicado

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Outro Usuário",
    "email": "joao@exemplo.com",
    "password": "123456"
  }'
```

**Resposta esperada (erro):**
```json
{
  "message": "Este email já está cadastrado."
}
```

## 8. Teste de Validação de Campos

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "",
    "email": "email_invalido",
    "password": "123"
  }'
```

**Resposta esperada (erro):**
```json
{
  "message": "Email e senha são obrigatórios."
}
```

## Verificações no Frontend

1. **Login com credenciais válidas**: Deve redirecionar para seleção de projetos
2. **Login com credenciais inválidas**: Deve mostrar mensagem de erro
3. **Cadastro com dados válidos**: Deve criar conta e fazer login
4. **Cadastro com email duplicado**: Deve mostrar erro
5. **Seleção de projetos**: Deve mostrar apenas projetos do usuário (ou mensagem se não houver)
6. **Criação de projeto**: Deve permitir criar novo projeto com nome e descrição
7. **Navegação sem autenticação**: Deve redirecionar para login
8. **Interface consistente**: Deve usar o mesmo CSS do resto do projeto

## Fluxo Completo de Teste

1. **Criar conta**: Use signup para criar um usuário
2. **Fazer login**: Use as credenciais criadas
3. **Verificar projetos vazios**: Deve mostrar mensagem de "sem projetos"
4. **Criar projeto**: Use o botão "Novo Projeto"
5. **Verificar projeto criado**: Deve aparecer na lista
6. **Selecionar projeto**: Deve permitir continuar para o dashboard

## Problemas Comuns

- **Erro 500**: Verificar se o MongoDB está rodando
- **Erro de conexão**: Verificar DATABASE_URL no .env
- **Erro de bcrypt**: Verificar se bcryptjs está instalado
- **Página não encontrada**: Verificar se as APIs estão na pasta correta (app/api/auth/)
- **CSS inconsistente**: Verificar se os componentes UI estão sendo importados corretamente
- **Projeto não criado**: Verificar se o userId está sendo passado corretamente
