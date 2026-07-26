import { getDb } from '@/lib/prisma'
// API de hábito individual — registrar conclusão, editar, excluir

import { auth } from '@/lib/auth'



// PATCH /api/habits/[id] — registrar conclusão do dia ou editar
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
    const prisma = getDb()
    const habit = await prisma.habit.findUnique({
      where: { id },
      include: { goal: { select: { userId: true } } },
    })


    const body = await req.json()

    // Se for toggle de conclusão
    if (body.completed !== undefined) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      if (body.completed) {
        // Marcar como concluído hoje
        const existingLog = await prisma.habitLog.findFirst({
          where: { habitId: id, date: { gte: today, lt: tomorrow } },
        })

        if (!existingLog) {
          await prisma.habitLog.create({
            data: { habitId: id, date: today },
          })

          // Atualizar streak
          const h = habit as any // non-null (checked above)
          const streak = (h.streak || 0) + 1
          const bestStreak = Math.max(streak, h.bestStreak || 0)
          await prisma.habit.update({
            where: { id },
            data: { streak, bestStreak },
          })
        }
      } else {
        // Desmarcar
        await prisma.habitLog.deleteMany({
          where: { habitId: id, date: { gte: today, lt: tomorrow } },
        })
        const h = habit as any
        await prisma.habit.update({
          where: { id },
          data: { streak: Math.max(0, (h.streak || 0) - 1) },
        })
      }
    }

    // Se for edição dos campos
    if (body.action || body.time || body.place !== undefined) {
      await prisma.habit.update({
        where: { id },
        data: {
          ...(body.action && { action: body.action }),
          ...(body.time !== undefined && { time: body.time }),
          ...(body.place !== undefined && { place: body.place }),
        },
      })
    }

    const updated = await prisma.habit.findUnique({
      where: { id },
      include: { habitLogs: { orderBy: { date: 'desc' }, take: 31 } },
    })

    return Response.json({ habit: updated })
  } catch (error) {
    console.error('Erro ao atualizar hábito:', error)
    return Response.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// DELETE /api/habits/[id]
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
    const prisma = getDb()
    const habit = await prisma.habit.findUnique({
      where: { id },
      include: { goal: { select: { userId: true } } },
    })


    await prisma.habit.delete({ where: { id } })
    return Response.json({ success: true })
  } catch (error) {
    console.error('Erro ao excluir hábito:', error)
    return Response.json({ error: 'Erro interno' }, { status: 500 })
  }
}
