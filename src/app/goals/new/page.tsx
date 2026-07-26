'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DEFAULT_CATEGORIES } from '@/data/categories'

export default function NewGoalPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    area: '',
    what: '',
    why: '',
    where: '',
    when: '',
    who: '',
    how: '',
    cost: '',
    priority: 1,
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const update = (field: string, value: string | number) =>
    setForm((f) => ({ ...f, [field]: value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.area) { setError('Selecione uma área'); return }
    if (!form.what || form.what.length < 5) { setError('Descreva o que fazer (mín. 5 caracteres)'); return }

    setSubmitting(true)
    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          area: form.area,
          what: form.what,
          why: form.why || null,
          where: form.where || null,
          when: form.when || null,
          who: form.who || null,
          how: form.how || null,
          cost: form.cost || null,
          priority: form.priority,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao criar')

      router.push(`/goals/${data.goal.id}`)
    } catch (e: any) {
      setError(e.message || 'Erro de conexão')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7f3ff] to-[#e9e0f5]">
      <header className="bg-white/70 backdrop-blur-xl border-b border-white/40">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold bg-gradient-to-r from-[#4a2c7a] to-[#7c3aed] bg-clip-text text-transparent">
            🎯 Nova Meta
          </h1>
          <a href="/goals" className="text-sm text-[#6b5b7b] hover:text-[#4a2c7a]">
            ← Minhas Metas
          </a>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-xl space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-200">
              {error}
            </div>
          )}

          {/* Área */}
          <div>
            <label className="block text-sm font-semibold text-[#2d1b3d] mb-1.5">
              Área da Roda da Vida <span className="text-red-400">*</span>
            </label>
            <select
              value={form.area}
              onChange={(e) => update('area', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#e0d8ea] bg-white/60 focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20 outline-none transition-all text-sm"
            >
              <option value="">Selecione uma área...</option>
              {DEFAULT_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.label}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* What - O quê */}
          <div>
            <label className="block text-sm font-semibold text-[#2d1b3d] mb-1.5">
              🎯 O quê? <span className="text-red-400">*</span>
              <span className="text-xs text-[#8a7a9a] font-normal ml-2">Qual é a meta?</span>
            </label>
            <textarea
              value={form.what}
              onChange={(e) => update('what', e.target.value)}
              placeholder="Ex: Criar uma reserva de emergência de 6 meses"
              rows={2}
              className="w-full px-4 py-3 rounded-xl border border-[#e0d8ea] bg-white/60 focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20 outline-none transition-all resize-none text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Why - Por quê */}
            <div>
              <label className="block text-sm font-semibold text-[#2d1b3d] mb-1.5">
                💡 Por quê?
              </label>
              <input
                value={form.why}
                onChange={(e) => update('why', e.target.value)}
                placeholder="Motivação da meta"
                className="w-full px-4 py-3 rounded-xl border border-[#e0d8ea] bg-white/60 focus:border-[#7c3aed] outline-none transition-all text-sm"
              />
            </div>

            {/* Where - Onde */}
            <div>
              <label className="block text-sm font-semibold text-[#2d1b3d] mb-1.5">
                📍 Onde?
              </label>
              <input
                value={form.where}
                onChange={(e) => update('where', e.target.value)}
                placeholder="Ex: Banco X, conta investimento"
                className="w-full px-4 py-3 rounded-xl border border-[#e0d8ea] bg-white/60 focus:border-[#7c3aed] outline-none transition-all text-sm"
              />
            </div>

            {/* When - Quando */}
            <div>
              <label className="block text-sm font-semibold text-[#2d1b3d] mb-1.5">
                📅 Quando?
              </label>
              <input
                value={form.when}
                onChange={(e) => update('when', e.target.value)}
                placeholder="Ex: Até 31/12/2026"
                className="w-full px-4 py-3 rounded-xl border border-[#e0d8ea] bg-white/60 focus:border-[#7c3aed] outline-none transition-all text-sm"
              />
            </div>

            {/* Who - Quem */}
            <div>
              <label className="block text-sm font-semibold text-[#2d1b3d] mb-1.5">
                👤 Quem?
              </label>
              <input
                value={form.who}
                onChange={(e) => update('who', e.target.value)}
                placeholder="Responsável (ex: Eu mesmo)"
                className="w-full px-4 py-3 rounded-xl border border-[#e0d8ea] bg-white/60 focus:border-[#7c3aed] outline-none transition-all text-sm"
              />
            </div>

            {/* How - Como */}
            <div>
              <label className="block text-sm font-semibold text-[#2d1b3d] mb-1.5">
                🔧 Como?
              </label>
              <input
                value={form.how}
                onChange={(e) => update('how', e.target.value)}
                placeholder="Ex: Guardar 10% do salário todo mês"
                className="w-full px-4 py-3 rounded-xl border border-[#e0d8ea] bg-white/60 focus:border-[#7c3aed] outline-none transition-all text-sm"
              />
            </div>

            {/* Cost - Quanto */}
            <div>
              <label className="block text-sm font-semibold text-[#2d1b3d] mb-1.5">
                💰 Quanto custará?
              </label>
              <input
                value={form.cost}
                onChange={(e) => update('cost', e.target.value)}
                placeholder="Ex: R$ 200/mês"
                className="w-full px-4 py-3 rounded-xl border border-[#e0d8ea] bg-white/60 focus:border-[#7c3aed] outline-none transition-all text-sm"
              />
            </div>
          </div>

          {/* Prioridade */}
          <div>
            <label className="block text-sm font-semibold text-[#2d1b3d] mb-1.5">
              ⭐ Prioridade
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => update('priority', p)}
                  className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                    form.priority === p
                      ? 'bg-[#7c3aed] text-white shadow-md'
                      : 'bg-white border border-[#e0d8ea] text-[#6b5b7b] hover:border-[#7c3aed]'
                  }`}
                >
                  {p}
                </button>
              ))}
              <span className="text-xs text-[#6b5b7b] self-center ml-2">
                1 = máxima
              </span>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-3 rounded-xl border border-[#e0d8ea] bg-white/60 text-[#6b5b7b] font-semibold hover:bg-white/90 transition-all text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] text-white font-semibold shadow-lg shadow-[#7c3aed]/25 hover:from-[#6d28d9] hover:to-[#5b21b6] transition-all disabled:opacity-60 text-sm"
            >
              {submitting ? 'Criando...' : '✅ Criar Meta'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
