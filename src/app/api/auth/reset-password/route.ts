import { getDb } from '@/lib/prisma'
// API de redefinir senha — valida token + atualiza senha

import { hash } from 'bcryptjs'



export async function POST(req: Request) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return Response.json({ error: 'Token e nova senha são obrigatórios' }, { status: 400 })
    }

    if (password.length < 6) {
      return Response.json({ error: 'Senha deve ter ao menos 6 caracteres' }, { status: 400 })
    }

    const prisma = await getDb()

    // Busca o token
    const resetToken = await prisma.verificationToken.findUnique({
      where: { token },
    })

    if (!resetToken) {
      return Response.json({ error: 'Token inválido' }, { status: 404 })
    }

    // Verifica expiração
    if (new Date() > new Date(resetToken.expires)) {
      await prisma.verificationToken.delete({ where: { token } })
      return Response.json({ error: 'Token expirado. Solicite uma nova redefinição.' }, { status: 410 })
    }

    // Busca o usuário pelo email (identifier)
    const user = await prisma.user.findUnique({
      where: { email: resetToken.identifier },
    })

    if (!user) {
      await prisma.verificationToken.delete({ where: { token } })
      return Response.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Atualiza a senha
    const passwordHash = await hash(password, 12)
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    })

    // Remove o token (uso único)
    await prisma.verificationToken.delete({ where: { token } })

    return Response.json({ success: true, message: 'Senha redefinida com sucesso!' })
  } catch (error) {
    console.error('Erro ao redefinir senha:', error)
    return Response.json({ error: 'Erro interno' }, { status: 500 })
  }
}
