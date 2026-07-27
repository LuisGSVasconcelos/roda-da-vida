// API de avaliações — criar e listar

import { auth } from '@/lib/auth'
import { getDb } from '@/lib/prisma'

// POST /api/assessments — criar avaliação com scores
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: 'Não autenticado' }, { status: 401 })
  }

  try {
    const { title, clientId, scores } = await req.json()

    if (!scores || !Array.isArray(scores) || scores.length === 0) {
      return Response.json({ error: 'Scores são obrigatórios' }, { status: 400 })
    }

    const prisma = await getDb()

    const assessment = await prisma.assessment.create({
      data: {
        userId: session.user.id,
        clientId: clientId || null,
        title: title || 'Nova Avaliação',
        scores: {
          create: scores.map((s: { categoryId: string; value: number; reflectionNotes?: string }) => ({
            categoryId: s.categoryId,
            value: Math.min(10, Math.max(0, s.value ?? 5)),
            reflectionNotes: s.reflectionNotes || null,
          })),
        },
      },
      include: {
        scores: {
          include: { category: true },
        },
      },
    })

    return Response.json({ assessment }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar avaliação:', error)
    const message = error instanceof Error ? error.message : 'Erro interno'
    return Response.json({ error: message }, { status: 500 })
  }
}

// GET /api/assessments — listar avaliações do usuário
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: 'Não autenticado' }, { status: 401 })
  }

  try {
    const prisma = await getDb()
    const assessments = await prisma.assessment.findMany({
      where: { userId: session.user.id },
      include: {
        scores: {
          include: { category: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return Response.json({ assessments })
  } catch (error) {
    console.error('Erro ao listar avaliações:', error)
    return Response.json({ error: 'Erro interno' }, { status: 500 })
  }
}
