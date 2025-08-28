const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkUserRole() {
  try {
    console.log('Verificando roles dos usuários nos projetos...')
    
    // Buscar todos os ProjectMembers
    const members = await prisma.projectMember.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true
          }
        },
        project: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })
    
    console.log(`\nEncontrados ${members.length} membros de projeto:`)
    
    members.forEach(member => {
      console.log(`\n- Projeto: ${member.project.name} (${member.project.id})`)
      console.log(`  Usuário: ${member.user.name || member.user.email} (${member.user.id})`)
      console.log(`  Role no projeto: ${member.role}`)
      console.log(`  Role global: ${member.user.role}`)
      console.log(`  Status: ${member.status}`)
    })
    
    // Verificar se há usuários com role GESTOR
    const gestores = members.filter(m => m.role === 'GESTOR')
    console.log(`\nTotal de GESTORes: ${gestores.length}`)
    
    gestores.forEach(gestor => {
      console.log(`- ${gestor.user.name || gestor.user.email} é GESTOR em ${gestor.project.name}`)
    })
    
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUserRole()
