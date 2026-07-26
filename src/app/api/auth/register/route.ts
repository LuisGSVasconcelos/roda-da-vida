import { getDb } from '@/lib/prisma'
import { hash } from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const { name, email, password, role } = await req.json()

    if (!name || !email || !password) {
      return Response.json({ error: 'Nome, email e senha são obrigatórios.' }, { status: 400 })
    }

    if (password.length < 6) {
      return Response.json({ error: 'Senha deve ter ao menos 6 caracteres.' }, { status: 400 })
    }

    if (!['INDIVIDUAL', 'PROFESSIONAL'].includes(role)) {
      return Response.json({ error: 'Tipo de conta inválido.' }, { status: 400 })
    }

    const prisma = getDb()

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return Response.json({ error: 'Este email já está cadastrado.' }, { status: 409 })
    }

    const passwordHash = await hash(password, 12)
    const user = await prisma.user.create({
      data: { name, email, passwordHash, role },
      select: { id: true, name: true, email: true, role: true },
    })

    return Response.json({ user }, { status: 201 })
  } catch (error) {
    console.error('Erro no registro:', error)
    return Response.json({ error: 'Erro interno do servidor.' }, { status: 500 })
  }
}
