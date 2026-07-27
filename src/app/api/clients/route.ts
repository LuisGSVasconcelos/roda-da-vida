import { getDb } from '@/lib/prisma'
// API de clientes (profissionais)

import { auth } from '@/lib/auth'



// GET /api/clients — lista clientes do profissional
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: 'Não autenticado' }, { status: 401 })
  }

  try {
    const prisma = await getDb()
    const clients = await prisma.client.findMany({
      where: { professionalId: session.user.id },
      include: {
        assessments: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { id: true, title: true, createdAt: true },
        },
        _count: { select: { assessments: true, goals: true } },
      },
      orderBy: { name: 'asc' },
    })

    return Response.json({ clients })
  } catch (error) {
    console.error('Erro ao listar clientes:', error)
    return Response.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// POST /api/clients — cria cliente
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: 'Não autenticado' }, { status: 401 })
  }

  if (session.user.role !== 'PROFESSIONAL') {
    return Response.json({ error: 'Apenas profissionais' }, { status: 403 })
  }

  try {
    const { name, email, phone, notes } = await req.json()
    if (!name || name.trim().length < 2) {
      return Response.json({ error: 'Nome obrigatório' }, { status: 400 })
    }

    const prisma = await getDb()
    const client = await prisma.client.create({
      data: {
        professionalId: session.user.id,
        name: name.trim(),
        email: email || null,
        phone: phone || null,
        notes: notes || null,
      },
    })

    return Response.json({ client }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar cliente:', error)
    return Response.json({ error: 'Erro interno' }, { status: 500 })
  }
}
