import { getDb } from '@/lib/prisma'
// API de metas — CRUD 5W2H

import { auth } from '@/lib/auth'



// GET /api/goals — listar metas do usuário
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: 'Não autenticado' }, { status: 401 })
  }

  try {
    const prisma = await getDb()
    const goals = await prisma.goal.findMany({
      where: { userId: session.user.id },
      include: {
        habits: {
          include: { habitLogs: true },
          orderBy: { createdAt: 'asc' },
        },
        assessment: { select: { id: true, title: true, createdAt: true } },
      },
      orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
    })

    return Response.json({ goals })
  } catch (error) {
    console.error('Erro ao listar metas:', error)
    return Response.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// POST /api/goals — criar meta
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: 'Não autenticado' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { area, what, why, where, when, who, how, cost, priority, assessmentId, clientId } = body

    if (!area || !what) {
      return Response.json({ error: 'Área e "O que fazer" são obrigatórios' }, { status: 400 })
    }

    const prisma = await getDb()
    const goal = await prisma.goal.create({
      data: {
        userId: session.user.id,
        area,
        what,
        why: why || null,
        where: where || null,
        when: when || null,
        who: who || null,
        how: how || null,
        cost: cost || null,
        priority: priority ?? 1,
        assessmentId: assessmentId || null,
        clientId: clientId || null,
      },
      include: { habits: true },
    })

    return Response.json({ goal }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar meta:', error)
    return Response.json({ error: 'Erro interno' }, { status: 500 })
  }
}
