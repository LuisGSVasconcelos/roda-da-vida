import { getDb } from '@/lib/prisma'
// API de categoria individual — editar (PATCH) e excluir (DELETE)

import { auth } from '@/lib/auth'



// PATCH /api/categories/[id] — editar categoria
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

    // Buscar a categoria
    const category = await prisma.category.findUnique({ where: { id } })
    if (!category) {
      return Response.json({ error: 'Categoria não encontrada' }, { status: 404 })
    }

    // Verificar permissão: categorias padrão só admin pode editar
    // Categorias personalizadas só o dono pode editar
    if (category.isDefault) {
      return Response.json({ error: 'Categorias padrão não podem ser editadas' }, { status: 403 })
    }

    if (category.userId !== session.user.id) {
      return Response.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { name, description, color, icon, order } = await req.json()

    const updated = await prisma.category.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description }),
        ...(color !== undefined && { color }),
        ...(icon !== undefined && { icon }),
        ...(order !== undefined && { order }),
      },
    })

    return Response.json({ category: updated })
  } catch (error) {
    console.error('Erro ao editar categoria:', error)
    return Response.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// DELETE /api/categories/[id] — excluir categoria personalizada
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

    const category = await prisma.category.findUnique({ where: { id } })
    if (!category) {
      return Response.json({ error: 'Categoria não encontrada' }, { status: 404 })
    }

    if (category.isDefault) {
      return Response.json({ error: 'Categorias padrão não podem ser excluídas' }, { status: 403 })
    }

    if (category.userId !== session.user.id) {
      return Response.json({ error: 'Acesso negado' }, { status: 403 })
    }

    await prisma.category.delete({ where: { id } })

    return Response.json({ success: true })
  } catch (error) {
    console.error('Erro ao excluir categoria:', error)
    return Response.json({ error: 'Erro interno' }, { status: 500 })
  }
}
