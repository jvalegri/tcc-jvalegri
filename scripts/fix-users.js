const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixUsers() {
  try {
    console.log('Verificando usuários existentes...')
    
    // Buscar todos os usuários
    const users = await prisma.user.findMany()
    console.log(`Encontrados ${users.length} usuários`)
    
    for (const user of users) {
      console.log(`Verificando usuário: ${user.email}`)
      
      // Verificar se o usuário tem os campos obrigatórios
      const updateData = {}
      
      // Corrigir role inválida
      if (!user.role || user.role === 'Usuário') {
        updateData.role = 'COLABORADOR'
        console.log(`  - Corrigindo role inválida para: COLABORADOR`)
      }
      
      if (!user.status || user.status === 'Usuário') {
        updateData.status = 'ATIVO'
        console.log(`  - Corrigindo status inválido para: ATIVO`)
      }
      
      if (!user.createdAt) {
        updateData.createdAt = new Date()
        console.log(`  - Adicionando createdAt: ${updateData.createdAt}`)
      }
      
      if (!user.updatedAt) {
        updateData.updatedAt = new Date()
        console.log(`  - Adicionando updatedAt: ${updateData.updatedAt}`)
      }
      
      // Atualizar usuário se necessário
      if (Object.keys(updateData).length > 0) {
        await prisma.user.update({
          where: { id: user.id },
          data: updateData
        })
        console.log(`  - Usuário atualizado`)
      } else {
        console.log(`  - Usuário já está correto`)
      }
    }
    
    console.log('Processo concluído!')
    
  } catch (error) {
    console.error('Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixUsers()
