import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido.' })
  }

  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Email e senha são obrigatórios.' })
  }

  try {
    // 1. Encontrar o usuário pelo email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        projects: true // Assumindo que seu modelo User tem uma relação com Projects
      }
    })

    if (!user) {
      return res.status(401).json({ message: 'Email ou senha incorretos.' })
    }

    // 2. Comparar a senha fornecida com a senha hash no banco de dados
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email ou senha incorretos.' })
    }

    // 3. Login bem-sucedido
    // Remova a senha antes de retornar a resposta
    const { password: userPassword, ...userData } = user

    return res.status(200).json(userData)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Erro interno do servidor.' })
  } finally {
    await prisma.$disconnect()
  }
}