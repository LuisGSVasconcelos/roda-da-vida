import { getDb } from '@/lib/prisma'
// API de categorias — listar, criar
// Profissionais podem criar categorias personalizadas

import { auth } from '@/lib/auth'



// GET /api/categories — lista categorias (padrão + do usuário logado)
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: 'Não autenticado' }, { status: 401 })
  }

  try {
    const prisma = getDb()
    const categories = await prisma.category.findMany({
      where: {
        OR: [
          { isDefault: true },
          { userId: session.user.id },
        ],
      },
      orderBy: { order: 'asc' },
    })

    return Response.json({ categories })
  } catch (error) {
    console.error('Erro ao listar categorias:', error)
    return Response.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// POST /api/categories — cria categoria personalizada (só PROFESSIONAL)
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: 'Não autenticado' }, { status: 401 })
  }

  if (session.user.role !== 'PROFESSIONAL') {
    return Response.json({ error: 'Apenas profissionais podem criar categorias' }, { status: 403 })
  }

  try {
    const { name, description, color, icon, order } = await req.json()

    if (!name || name.trim().length < 2) {
      return Response.json({ error: 'Nome deve ter ao menos 2 caracteres' }, { status: 400 })
    }

    const prisma = getDb()

    // Verificar se já existe categoria com mesmo nome para este usuário
    const existing = await prisma.category.findFirst({
      where: { name: name.trim(), userId: session.user.id },
    })
    if (existing) {
      return Response.json({ error: 'Você já tem uma categoria com este nome' }, { status: 409 })
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        description: description || null,
        color: color || '#6366f1',
        icon: icon || 'circle',
        order: order ?? 0,
        isDefault: false,
        userId: session.user.id,
      },
    })

    return Response.json({ category }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar categoria:', error)
    return Response.json({ error: 'Erro interno' }, { status: 500 })
  }
}
