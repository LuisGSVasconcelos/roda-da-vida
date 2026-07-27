import { getDb } from '@/lib/prisma'
// API de hábitos — criar e listar

import { auth } from '@/lib/auth'



// POST /api/habits — criar hábito
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: 'Não autenticado' }, { status: 401 })
  }

  try {
    const { goalId, action, time, place } = await req.json()

    if (!goalId || !action) {
      return Response.json({ error: 'Meta e ação são obrigatórias' }, { status: 400 })
    }

    const prisma = await getDb()

    // Verificar se a meta pertence ao usuário
    const goal = await prisma.goal.findUnique({ where: { id: goalId } })
    if (!goal || goal.userId !== session.user.id) {
      return Response.json({ error: 'Meta não encontrada' }, { status: 404 })
    }

    const habit = await prisma.habit.create({
      data: {
        goalId,
        action,
        time: time || null,
        place: place || null,
      },
    })

    return Response.json({ habit }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar hábito:', error)
    return Response.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// GET /api/habits — listar hábitos do usuário (via goals)
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: 'Não autenticado' }, { status: 401 })
  }

  try {
    const prisma = await getDb()
    const habits = await prisma.habit.findMany({
      where: { goal: { userId: session.user.id } },
      include: {
        habitLogs: { orderBy: { date: 'desc' }, take: 30 },
        goal: { select: { id: true, what: true, area: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return Response.json({ habits })
  } catch (error) {
    console.error('Erro ao listar hábitos:', error)
    return Response.json({ error: 'Erro interno' }, { status: 500 })
  }
}
