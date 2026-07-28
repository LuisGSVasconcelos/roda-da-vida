import { auth, signOut } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getDb } from '@/lib/prisma'

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  const user = session.user

  // Buscar rascunhos pendentes
  const prisma = await getDb()
  const drafts = await prisma.assessment.findMany({
    where: { userId: session.user.id, status: 'DRAFT' },
    include: { scores: true },
    orderBy: { updatedAt: 'desc' },
    take: 5,
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7f3ff] to-[#e9e0f5]">
      <header className="bg-white/70 backdrop-blur-xl border-b border-white/40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-to-r from-[#4a2c7a] to-[#7c3aed] bg-clip-text text-transparent">
            ✦ Roda da Vida
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#6b5b7b]">
              {user.name}
              {user.role === 'PROFESSIONAL' && (
                <span className="ml-2 text-xs bg-[#7c3aed]/10 text-[#7c3aed] px-2 py-0.5 rounded-full font-semibold">
                  Profissional
                </span>
              )}
            </span>
            <form
              action={async () => {
                'use server'
                await signOut()
              }}
            >
              <button
                type="submit"
                className="text-sm text-[#8a7a9a] hover:text-red-500 transition-colors"
              >
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#2d1b3d]">
            Olá, {user.name}! 👋
          </h2>
          <p className="text-[#6b5b7b] mt-2">
            Bem-vindo à sua jornada de autoconhecimento
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/assessment/new"
            className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-white/50 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
          >
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-bold text-[#2d1b3d] mb-2">Nova Avaliação</h3>
            <p className="text-sm text-[#6b5b7b]">
              Responda às perguntas reflexivas e avalie cada área da sua vida
            </p>
          </Link>

          <Link
            href="/history"
            className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-white/50 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
          >
            <div className="text-4xl mb-4">📈</div>
            <h3 className="text-lg font-bold text-[#2d1b3d] mb-2">Meu Histórico</h3>
            <p className="text-sm text-[#6b5b7b]">
              Acompanhe sua evolução ao longo do tempo com gráficos comparativos
            </p>
          </Link>

          <Link
            href="/goals"
            className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-white/50 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
          >
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-lg font-bold text-[#2d1b3d] mb-2">Metas e Hábitos</h3>
            <p className="text-sm text-[#6b5b7b]">
              Crie planos de ação 5W2H e acompanhe seus hábitos diários
            </p>
          </Link>
        </div>

        {/* Rascunhos pendentes */}
        {drafts.length > 0 && (
          <div className="mt-10">
            <h3 className="text-lg font-bold text-[#2d1b3d] mb-4 flex items-center gap-2">
              <span>📝</span> Rascunhos Pendentes ({drafts.length})
            </h3>
            <div className="grid gap-3">
              {drafts.map((draft) => {
                const filled = draft.scores.length
                return (
                  <Link
                    key={draft.id}
                    href={`/assessment/new?draft=${draft.id}`}
                    className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 border border-[#e0d8ea] border-dashed shadow-sm hover:shadow-md hover:border-[#7c3aed] transition-all flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-[#2d1b3d]">{draft.title}</p>
                      <p className="text-xs text-[#6b5b7b] mt-1">
                        {filled}/12 áreas preenchidas · {new Date(draft.updatedAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-sm text-[#7c3aed] font-semibold">
                      Continuar →
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {user.role === 'PROFESSIONAL' && (
          <div className="mt-8">
            <Link
              href="/professional/clients"
              className="block bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-white/50 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-lg font-bold text-[#2d1b3d] mb-2">Meus Clientes</h3>
              <p className="text-sm text-[#6b5b7b]">
                Gerencie seus clientes, crie avaliações e acompanhe o progresso deles
              </p>
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
