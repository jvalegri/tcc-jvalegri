const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixUsersDirect() {
  try {
    console.log('Corrigindo usuários diretamente...')
    
    // Atualizar todos os usuários com role inválida
    const result = await prisma.user.updateMany({
      where: {
        OR: [
          { role: null },
          { role: 'Usuário' },
          { status: null },
          { status: 'Usuário' }
        ]
      },
      data: {
        role: 'COLABORADOR',
        status: 'ATIVO',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
    
    console.log(`Usuários atualizados: ${result.count}`)
    
    // Verificar se há usuários com campos ainda inválidos
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    })
    
    console.log('\nUsuários após correção:')
    users.forEach(user => {
      console.log(`- ${user.email}: role=${user.role}, status=${user.status}`)
    })
    
    console.log('\nProcesso concluído!')
    
  } catch (error) {
    console.error('Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixUsersDirect()
