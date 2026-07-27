import { getDb } from '@/lib/prisma'
// API de solicitar redefinição de senha — gera token de reset

import { randomBytes } from 'crypto'



export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email) {
      return Response.json({ error: 'Email é obrigatório' }, { status: 400 })
    }

    const prisma = getDb()

    // Verifica se o usuário existe
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } })
    if (!user) {
      // Não revelar se o email existe ou não (segurança)
      return Response.json({ success: true, message: 'Se o email existir, um token de redefinição será gerado.' })
    }

    // Remove tokens anteriores deste usuário (identificador = email)
    const identifier = email.toLowerCase().trim()
    await prisma.verificationToken.deleteMany({
      where: { identifier },
    })

    // Gera novo token (expira em 1 hora)
    const token = randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

    await prisma.verificationToken.create({
      data: { identifier, token, expires },
    })


    // Em produção, enviar email com link contendo o token
    // Para desenvolvimento, retornamos o token na resposta
    return Response.json({
      success: true,
      message: 'Token de redefinição gerado.',
      token, // apenas em dev — remover em produção
      expires: expires.toISOString(),
    })
  } catch (error) {
    console.error('Erro ao solicitar redefinição:', error)
    return Response.json({ error: 'Erro interno' }, { status: 500 })
  }
}
