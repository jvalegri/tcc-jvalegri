const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testLogin() {
  try {
    console.log('Testando estrutura do banco...')
    
    // Verificar se há usuários
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
    
    console.log(`\nUsuários encontrados: ${users.length}`)
    users.forEach(user => {
      console.log(`- ${user.email}: role=${user.role}, status=${user.status}`)
    })
    
    // Testar busca de usuário específico
    const testEmail = 'joaoalegri19@gmail.com'
    console.log(`\nTestando busca por: ${testEmail}`)
    
    const user = await prisma.user.findUnique({
      where: { email: testEmail },
      include: {
        ownedProjects: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      }
    })
    
    if (user) {
      console.log('✅ Usuário encontrado:')
      console.log(`  - ID: ${user.id}`)
      console.log(`  - Email: ${user.email}`)
      console.log(`  - Role: ${user.role}`)
      console.log(`  - Status: ${user.status}`)
      console.log(`  - Projetos: ${user.ownedProjects?.length || 0}`)
      
      if (user.ownedProjects && user.ownedProjects.length > 0) {
        user.ownedProjects.forEach(project => {
          console.log(`    - ${project.name}: ${project.description}`)
        })
      }
    } else {
      console.log('❌ Usuário não encontrado')
    }
    
    // Verificar estrutura das tabelas
    console.log('\nVerificando estrutura das tabelas...')
    
    const projects = await prisma.project.findMany({
      select: { id: true, name: true, ownerId: true }
    })
    console.log(`Projetos: ${projects.length}`)
    
    const members = await prisma.projectMember.findMany({
      select: { id: true, projectId: true, userId: true, role: true }
    })
    console.log(`Membros: ${members.length}`)
    
  } catch (error) {
    console.error('❌ Erro:', error)
    console.error('Stack:', error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

testLogin()
