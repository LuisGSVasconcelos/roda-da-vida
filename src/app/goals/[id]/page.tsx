'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface HabitLog {
  id: string
  date: string
  completed: boolean
}

interface Habit {
  id: string
  action: string
  time: string | null
  place: string | null
  streak: number
  bestStreak: number
  habitLogs: HabitLog[]
}

interface Goal {
  id: string
  area: string
  what: string
  why: string | null
  where: string | null
  when: string | null
  who: string | null
  how: string | null
  cost: string | null
  priority: number
  completed: boolean
  createdAt: string
  habits: Habit[]
}

export default function GoalDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [goal, setGoal] = useState<Goal | null>(null)
  const [loading, setLoading] = useState(true)
  const [newHabit, setNewHabit] = useState({ action: '', time: '', place: '' })
  const [addingHabit, setAddingHabit] = useState(false)

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/goals/${params.id}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setGoal(data.goal)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [params.id])

  useEffect(() => { load() }, [load])

  async function addHabit(e: React.FormEvent) {
    e.preventDefault()
    if (!newHabit.action) return

    try {
      await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goalId: params.id,
          action: newHabit.action,
          time: newHabit.time || null,
          place: newHabit.place || null,
        }),
      })
      setNewHabit({ action: '', time: '', place: '' })
      setAddingHabit(false)
      load()
    } catch (e) {
      console.error(e)
    }
  }

  async function toggleHabit(habitId: string, completed: boolean) {
    await fetch(`/api/habits/${habitId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !completed }),
    })
    load()
  }

  async function deleteHabit(habitId: string) {
    if (!confirm('Excluir este hábito?')) return
    await fetch(`/api/habits/${habitId}`, { method: 'DELETE' })
    load()
  }

  async function toggleGoalComplete() {
    if (!goal) return
    await fetch(`/api/goals/${goal.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !goal.completed }),
    })
    load()
  }

  // Verificar se completou hoje
  function isCompletedToday(habit: Habit): boolean {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return habit.habitLogs.some(log => {
      const logDate = new Date(log.date)
      logDate.setHours(0, 0, 0, 0)
      return logDate.getTime() === today.getTime() && log.completed
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f7f3ff] to-[#e9e0f5] flex items-center justify-center">
        <div className="text-[#7c3aed] text-lg font-semibold animate-pulse">Carregando...</div>
      </div>
    )
  }

  if (!goal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f7f3ff] to-[#e9e0f5] flex items-center justify-center">
        <p className="text-red-500">Meta não encontrada</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7f3ff] to-[#e9e0f5]">
      <header className="bg-white/70 backdrop-blur-xl border-b border-white/40">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold bg-gradient-to-r from-[#4a2c7a] to-[#7c3aed] bg-clip-text text-transparent">
            📋 Detalhe da Meta
          </h1>
          <Link href="/goals" className="text-sm text-[#6b5b7b] hover:text-[#4a2c7a]">
            ← Metas
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* Card da meta 5W2H */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-xl">
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className="text-xs font-semibold bg-[#7c3aed]/10 text-[#7c3aed] px-2 py-0.5 rounded-full">
                {goal.area}
              </span>
              <h2 className="text-2xl font-bold text-[#2d1b3d] mt-2">{goal.what}</h2>
            </div>
            <button
              onClick={toggleGoalComplete}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                goal.completed
                  ? 'bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/30'
                  : 'bg-white border border-[#e0d8ea] text-[#6b5b7b] hover:border-[#10b981] hover:text-[#10b981]'
              }`}
            >
              {goal.completed ? '✅ Concluída' : '◻️ Marcar concluída'}
            </button>
          </div>

          {/* Tabela 5W2H */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#f7f3ff] rounded-2xl p-4 border border-[#e0d8ea]">
            {goal.why && (
              <div>
                <span className="text-xs font-semibold text-[#4a2c7a]">💡 Por quê</span>
                <p className="text-sm text-[#2d1b3d] mt-0.5">{goal.why}</p>
              </div>
            )}
            {goal.where && (
              <div>
                <span className="text-xs font-semibold text-[#4a2c7a]">📍 Onde</span>
                <p className="text-sm text-[#2d1b3d] mt-0.5">{goal.where}</p>
              </div>
            )}
            {goal.when && (
              <div>
                <span className="text-xs font-semibold text-[#4a2c7a]">📅 Quando</span>
                <p className="text-sm text-[#2d1b3d] mt-0.5">{goal.when}</p>
              </div>
            )}
            {goal.who && (
              <div>
                <span className="text-xs font-semibold text-[#4a2c7a]">👤 Quem</span>
                <p className="text-sm text-[#2d1b3d] mt-0.5">{goal.who}</p>
              </div>
            )}
            {goal.how && (
              <div>
                <span className="text-xs font-semibold text-[#4a2c7a]">🔧 Como</span>
                <p className="text-sm text-[#2d1b3d] mt-0.5">{goal.how}</p>
              </div>
            )}
            {goal.cost && (
              <div>
                <span className="text-xs font-semibold text-[#4a2c7a]">💰 Custo</span>
                <p className="text-sm text-[#2d1b3d] mt-0.5">{goal.cost}</p>
              </div>
            )}
          </div>
        </div>

        {/* Seção de hábitos */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#2d1b3d]">
              🔥 Hábitos
              {goal.habits.length > 0 && (
                <span className="text-sm font-normal text-[#6b5b7b] ml-2">
                  ({goal.habits.length})
                </span>
              )}
            </h3>
            <button
              onClick={() => setAddingHabit(!addingHabit)}
              className="px-4 py-2 rounded-xl bg-[#7c3aed] text-white text-sm font-semibold shadow-md hover:bg-[#6d28d9] transition-all"
            >
              {addingHabit ? '✕ Cancelar' : '+ Hábito'}
            </button>
          </div>

          {/* Fórmula da Intenção de Implementação */}
          {addingHabit && (
            <form onSubmit={addHabit} className="mb-6 bg-[#f7f3ff] rounded-2xl p-5 border border-[#e0d8ea]">
              <p className="text-xs font-semibold text-[#4a2c7a] mb-3">
                🧠 "Eu vou [AÇÃO] às [HORA] em [LUGAR]"
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-semibold text-[#4a2c7a] mb-1">Ação *</label>
                  <input
                    value={newHabit.action}
                    onChange={(e) => setNewHabit(h => ({ ...h, action: e.target.value }))}
                    placeholder="Fazer 30 min de caminhada"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-[#e0d8ea] bg-white/60 text-sm focus:border-[#7c3aed] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#4a2c7a] mb-1">Horário</label>
                  <input
                    value={newHabit.time}
                    onChange={(e) => setNewHabit(h => ({ ...h, time: e.target.value }))}
                    placeholder="07:00"
                    className="w-full px-3 py-2 rounded-xl border border-[#e0d8ea] bg-white/60 text-sm focus:border-[#7c3aed] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#4a2c7a] mb-1">Local</label>
                  <input
                    value={newHabit.place}
                    onChange={(e) => setNewHabit(h => ({ ...h, place: e.target.value }))}
                    placeholder="no parque"
                    className="w-full px-3 py-2 rounded-xl border border-[#e0d8ea] bg-white/60 text-sm focus:border-[#7c3aed] outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#10b981] text-white text-sm font-semibold hover:bg-[#059669] transition-all"
              >
                ✅ Adicionar Hábito
              </button>
            </form>
          )}

          {/* Lista de hábitos */}
          {goal.habits.length === 0 && !addingHabit ? (
            <p className="text-sm text-[#8a7a9a] text-center py-8">
              Nenhum hábito ainda. Quebre sua meta em pequenas ações diárias!
            </p>
          ) : (
            <div className="space-y-3">
              {goal.habits.map((habit) => {
                const doneToday = isCompletedToday(habit)
                return (
                  <div
                    key={habit.id}
                    className="flex items-center gap-3 bg-white rounded-xl p-4 border border-[#e0d8ea] hover:shadow-sm transition-all"
                  >
                    <button
                      onClick={() => toggleHabit(habit.id, doneToday)}
                      className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                        doneToday
                          ? 'bg-[#10b981] border-[#10b981] text-white'
                          : 'border-[#c4b5d4] hover:border-[#7c3aed]'
                      }`}
                    >
                      {doneToday && <span className="text-xs">✓</span>}
                    </button>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#2d1b3d]">
                        {habit.action}
                      </p>
                      <p className="text-xs text-[#6b5b7b] mt-0.5">
                        {habit.time && `🕐 ${habit.time}`}
                        {habit.place && ` 📍 ${habit.place}`}
                        {/* Fórmula completa: "Eu vou [ação] às [hora] em [lugar]" */}
                        <span className="ml-2 text-[#a78bfa] italic">
                          "Eu vou {habit.action}
                          {habit.time && ` às ${habit.time}`}
                          {habit.place && ` em ${habit.place}`}"
                        </span>
                      </p>
                    </div>

                    <div className="text-center shrink-0">
                      <div className="text-lg font-bold text-[#f59e0b]">{habit.streak}</div>
                      <div className="text-[9px] text-[#6b5b7b] uppercase tracking-wider">dias</div>
                    </div>

                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-[#8a7a9a] hover:text-red-500 transition-all text-xs"
                      title="Excluir hábito"
                    >
                      🗑️
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Best streak */}
        {goal.habits.some(h => h.bestStreak > 0) && (
          <div className="bg-gradient-to-r from-[#f7f3ff] to-[#ede7f5] rounded-2xl p-4 border border-[#e0d8ea] text-center">
            <p className="text-sm text-[#4a2c7a]">
              🏆 Melhor streak: <strong>{Math.max(...goal.habits.map(h => h.bestStreak))}</strong> dias consecutivos
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
