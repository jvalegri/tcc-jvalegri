const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixUsersIndividual() {
  try {
    console.log('Corrigindo usuários individualmente...')
    
    // Primeiro, vamos ver quais usuários existem
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true
      }
    })
    
    console.log(`Encontrados ${users.length} usuários`)
    
    for (const user of users) {
      try {
        console.log(`\nCorrigindo usuário: ${user.email}`)
        
        // Tentar atualizar o usuário com valores padrão
        const updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: {
            role: 'COLABORADOR',
            status: 'ATIVO',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        })
        
        console.log(`  ✅ Usuário corrigido: ${updatedUser.email}`)
        
      } catch (error) {
        console.log(`  ❌ Erro ao corrigir usuário ${user.email}:`, error.message)
        
        // Se falhar, tentar uma abordagem mais específica
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              updatedAt: new Date()
            }
          })
          console.log(`  ✅ Pelo menos updatedAt foi corrigido`)
        } catch (secondError) {
          console.log(`  ❌❌ Falha total ao corrigir usuário`)
        }
      }
    }
    
    console.log('\nProcesso concluído!')
    
  } catch (error) {
    console.error('Erro geral:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixUsersIndividual()
