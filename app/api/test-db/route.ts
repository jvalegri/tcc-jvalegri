import { NextRequest, NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Verificar se a variável de ambiente está definida
    const databaseUrl = process.env.DATABASE_URL
    console.log('DATABASE_URL definida:', !!databaseUrl)
    
    if (!databaseUrl) {
      return NextResponse.json(
        { error: 'DATABASE_URL não está definida' },
        { status: 500 }
      )
    }

    // Testar conexão com o banco
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    try {
      await prisma.$connect()
      console.log('Conexão com banco estabelecida com sucesso')
      
      // Testar uma query simples
      const userCount = await prisma.user.count()
      console.log('Número de usuários no banco:', userCount)

      return NextResponse.json({
        success: true,
        message: 'Conexão com banco funcionando',
        userCount: userCount,
        databaseUrl: databaseUrl.substring(0, 20) + '...' // Mostrar apenas o início da URL
      })

    } catch (dbError) {
      console.error('Erro na conexão com banco:', dbError)
      return NextResponse.json(
        { 
          error: 'Erro na conexão com banco',
          details: dbError instanceof Error ? dbError.message : 'Erro desconhecido'
        },
        { status: 500 }
      )
    } finally {
      await prisma.$disconnect()
    }

  } catch (error) {
    console.error('Erro geral:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
