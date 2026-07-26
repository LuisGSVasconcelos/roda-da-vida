import { getDb } from '@/lib/prisma'
// API de avaliação individual — GET /api/assessments/[id]

import { auth } from '@/lib/auth'



export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { id } = await params

  try {
    const prisma = getDb()
    const assessment = await prisma.assessment.findUnique({
      where: { id },
      include: {
        scores: {
          include: { category: true },
          orderBy: { category: { order: 'asc' } },
        },
        goals: {
          include: { habits: true },
          orderBy: { priority: 'asc' },
        },
      },
    })


    if (!assessment) {
      return Response.json({ error: 'Avaliação não encontrada' }, { status: 404 })
    }

    if (assessment.userId !== session.user.id) {
      return Response.json({ error: 'Acesso negado' }, { status: 403 })
    }

    return Response.json({ assessment })
  } catch (error) {
    console.error('Erro ao buscar avaliação:', error)
    return Response.json({ error: 'Erro interno' }, { status: 500 })
  }
}
