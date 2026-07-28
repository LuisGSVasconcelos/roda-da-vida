// API de avaliação individual — GET, PATCH

import { auth } from '@/lib/auth'
import { getDb } from '@/lib/prisma'

// GET /api/assessments/[id]
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
    const prisma = await getDb()
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

// PATCH /api/assessments/[id] — atualizar scores / status
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { id } = await params

  try {
    const prisma = await getDb()
    const assessment = await prisma.assessment.findUnique({ where: { id } })

    if (!assessment) {
      return Response.json({ error: 'Avaliação não encontrada' }, { status: 404 })
    }
    if (assessment.userId !== session.user.id) {
      return Response.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await req.json()

    // Atualizar status/completedAt
    const data: any = {}
    if (body.status) {
      data.status = body.status
      if (body.status === 'COMPLETED') data.completedAt = new Date()
    }

    // Atualizar scores (upsert)
    if (body.scores?.length > 0) {
      for (const s of body.scores) {
        await prisma.score.upsert({
          where: { assessmentId_categoryId: { assessmentId: id, categoryId: s.categoryId } },
          create: {
            assessmentId: id,
            categoryId: s.categoryId,
            value: Math.min(10, Math.max(0, s.value ?? 5)),
            reflectionNotes: s.reflectionNotes || null,
          },
          update: {
            value: Math.min(10, Math.max(0, s.value ?? 5)),
            reflectionNotes: s.reflectionNotes || null,
          },
        })
      }
    }

    const updated = await prisma.assessment.update({
      where: { id },
      data,
      include: {
        scores: { include: { category: true } },
      },
    })

    return Response.json({ assessment: updated })
  } catch (error) {
    console.error('Erro ao atualizar avaliação:', error)
    return Response.json({ error: 'Erro interno' }, { status: 500 })
  }
}
