'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface GoalItem {
  id: string
  area: string
  what: string
  why: string | null
  priority: number
  completed: boolean
  createdAt: string
  habits: Array<{ id: string; streak: number }>
  assessment?: { id: string; title: string }
}

export default function GoalsPage() {
  const router = useRouter()
  const [goals, setGoals] = useState<GoalItem[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/goals')
      if (!res.ok) throw new Error()
      const data = await res.json()
      setGoals(data.goals)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function toggleComplete(id: string, current: boolean) {
    await fetch(`/api/goals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !current }),
    })
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta meta?')) return
    await fetch(`/api/goals/${id}`, { method: 'DELETE' })
    load()
  }

  const activeGoals = goals.filter(g => !g.completed)
  const completedGoals = goals.filter(g => g.completed)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f7f3ff] to-[#e9e0f5] flex items-center justify-center">
        <div className="text-[#7c3aed] text-lg font-semibold animate-pulse">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7f3ff] to-[#e9e0f5]">
      <header className="bg-white/70 backdrop-blur-xl border-b border-white/40">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold bg-gradient-to-r from-[#4a2c7a] to-[#7c3aed] bg-clip-text text-transparent">
            🎯 Metas e Hábitos
          </h1>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm text-[#6b5b7b] hover:text-[#4a2c7a]">
              ← Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm text-[#6b5b7b]">
            {activeGoals.length} meta{activeGoals.length !== 1 ? 's' : ''} ativa{activeGoals.length !== 1 ? 's' : ''}
            {completedGoals.length > 0 && ` · ${completedGoals.length} concluída${completedGoals.length !== 1 ? 's' : ''}`}
          </p>
          <Link
            href="/goals/new"
            className="px-5 py-2.5 rounded-xl bg-[#7c3aed] text-white text-sm font-semibold shadow-lg shadow-[#7c3aed]/25 hover:bg-[#6d28d9] transition-all"
          >
            + Nova Meta
          </Link>
        </div>

        {/* Metas ativas */}
        {activeGoals.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-12 border border-white/50 shadow-xl text-center">
            <div className="text-5xl mb-4">🎯</div>
            <h2 className="text-xl font-bold text-[#2d1b3d] mb-2">Nenhuma meta ainda</h2>
            <p className="text-sm text-[#6b5b7b] mb-6">
              Crie sua primeira meta baseada na sua Roda da Vida
            </p>
            <Link
              href="/goals/new"
              className="inline-block px-6 py-3 rounded-xl bg-[#7c3aed] text-white font-semibold shadow-lg hover:bg-[#6d28d9] transition-all"
            >
              Criar Primeira Meta
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {activeGoals.map((goal) => (
              <div
                key={goal.id}
                className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 border border-white/50 shadow-md hover:shadow-lg transition-all"
              >
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => toggleComplete(goal.id, goal.completed)}
                    className="mt-0.5 w-6 h-6 rounded-full border-2 border-[#c4b5d4] hover:border-[#10b981] hover:bg-[#10b981]/10 flex items-center justify-center transition-all shrink-0"
                    title="Marcar como concluída"
                  >
                    {goal.completed && <span className="text-[#10b981] text-sm">✓</span>}
                  </button>

                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/goals/${goal.id}`}
                      className="text-base font-semibold text-[#2d1b3d] hover:text-[#7c3aed] transition-colors"
                    >
                      {goal.what}
                    </Link>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs bg-[#7c3aed]/10 text-[#7c3aed] px-2 py-0.5 rounded-full font-medium">
                        {goal.area}
                      </span>
                      {goal.habits.length > 0 && (
                        <span className="text-xs text-[#6b5b7b]">
                          {goal.habits.length} hábito{goal.habits.length !== 1 ? 's' : ''}
                        </span>
                      )}
                      {goal.priority === 1 && (
                        <span className="text-xs bg-[#f59e0b]/10 text-[#f59e0b] px-2 py-0.5 rounded-full font-medium">
                          ⭐ Prioridade
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Link
                      href={`/goals/${goal.id}`}
                      className="p-2 rounded-lg hover:bg-[#f0ebf5] text-[#8a7a9a] hover:text-[#4a2c7a] transition-all text-sm"
                      title="Detalhes"
                    >
                      👁️
                    </Link>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="p-2 rounded-lg hover:bg-red-50 text-[#8a7a9a] hover:text-red-500 transition-all text-sm"
                      title="Excluir"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Metas concluídas */}
        {completedGoals.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-bold text-[#2d1b3d] mb-4">✅ Concluídas</h2>
            <div className="space-y-2 opacity-60">
              {completedGoals.map((goal) => (
                <div key={goal.id} className="bg-white/60 rounded-xl p-4 border border-white/30">
                  <div className="flex items-center gap-3">
                    <span className="text-[#10b981]">✓</span>
                    <span className="text-sm text-[#2d1b3d] line-through">{goal.what}</span>
                    <span className="text-xs text-[#6b5b7b]">{goal.area}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
