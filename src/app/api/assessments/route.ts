// API de avaliações — criar e listar

import { auth } from '@/lib/auth'
import { getDb } from '@/lib/prisma'

// POST /api/assessments — criar avaliação (rascunho ou completa)
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: 'Não autenticado' }, { status: 401 })
  }

  try {
    const { title, clientId, scores, status } = await req.json()
    const prisma = await getDb()

    const assessment = await prisma.assessment.create({
      data: {
        userId: session.user.id,
        clientId: clientId || null,
        title: title || 'Nova Avaliação',
        status: status === 'COMPLETED' ? 'COMPLETED' : 'DRAFT',
        completedAt: status === 'COMPLETED' ? new Date() : null,
        scores: scores?.length > 0 ? {
          create: scores.map((s: { categoryId: string; value: number; reflectionNotes?: string }) => ({
            categoryId: s.categoryId,
            value: Math.min(10, Math.max(0, s.value ?? 5)),
            reflectionNotes: s.reflectionNotes || null,
          })),
        } : undefined,
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
export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: 'Não autenticado' }, { status: 401 })
  }

  try {
    const url = new URL(req.url)
    const filter = url.searchParams.get('status') // 'DRAFT', 'COMPLETED', ou null (todos)

    const prisma = await getDb()
    const where: any = { userId: session.user.id }
    if (filter) where.status = filter

    const assessments = await prisma.assessment.findMany({
      where,
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
