import { getDb } from '@/lib/prisma'
// API de meta individual — GET, PATCH, DELETE

import { auth } from '@/lib/auth'



// GET /api/goals/[id]
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
    const goal = await prisma.goal.findUnique({
      where: { id },
      include: {
        habits: {
          include: { habitLogs: { orderBy: { date: 'desc' } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    })


    if (!goal) return Response.json({ error: 'Meta não encontrada' }, { status: 404 })
    if (goal.userId !== session.user.id) return Response.json({ error: 'Acesso negado' }, { status: 403 })

    return Response.json({ goal })
  } catch (error) {
    console.error('Erro ao buscar meta:', error)
    return Response.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// PATCH /api/goals/[id]
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
    const goal = await prisma.goal.findUnique({ where: { id } })

    const updates = await req.json()
    const updated = await prisma.goal.update({
      where: { id },
      data: updates,
    })

    return Response.json({ goal: updated })
  } catch (error) {
    console.error('Erro ao editar meta:', error)
    return Response.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// DELETE /api/goals/[id]
export async function DELETE(
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
    const goal = await prisma.goal.findUnique({ where: { id } })

    await prisma.goal.delete({ where: { id } })
    return Response.json({ success: true })
  } catch (error) {
    console.error('Erro ao excluir meta:', error)
    return Response.json({ error: 'Erro interno' }, { status: 500 })
  }
}
