'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { DEFAULT_CATEGORIES, getQuestions, calculateAverage } from '@/data/categories'

interface ScoreState {
  categoryId: string
  value: number
  reflectionNotes: string
}

export default function AssessmentForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const draftId = searchParams.get('draft')

  const [step, setStep] = useState(0)
  const [scores, setScores] = useState<ScoreState[]>(
    DEFAULT_CATEGORIES.map((c) => ({
      categoryId: c.id,
      value: 5,
      reflectionNotes: '',
    }))
  )
  const [submitting, setSubmitting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(draftId)
  const [draftSaved, setDraftSaved] = useState(false)
  const [loaded, setLoaded] = useState(!draftId)

  // Carregar rascunho existente
  useEffect(() => {
    if (!draftId) return
    async function loadDraft() {
      try {
        const res = await fetch(`/api/assessments/${draftId}`)
        if (!res.ok) throw new Error('Erro ao carregar rascunho')
        const data = await res.json()
        const loadedScores = scores.map((s) => {
          const existing = data.assessment.scores.find(
            (x: any) => x.category.id === s.categoryId
          )
          return existing
            ? { categoryId: s.categoryId, value: existing.value, reflectionNotes: existing.reflectionNotes || '' }
            : s
        })
        setScores(loadedScores)

        // Pular para primeira categoria não preenchida
        let firstEmpty = loadedScores.findIndex(
          (s: ScoreState) => s.value === 5 && !s.reflectionNotes
        )
        if (firstEmpty === -1) {
          firstEmpty = loadedScores.findIndex((s: ScoreState, idx: number) => {
            const orig = data.assessment.scores.find(
              (x: any) => x.category.id === DEFAULT_CATEGORIES[idx].id
            )
            return !orig
          })
        }
        if (firstEmpty === -1) firstEmpty = loadedScores.length - 1
        setStep(Math.max(0, firstEmpty))
        setLoaded(true)
      } catch (e) {
        console.error(e)
        setLoaded(true)
      }
    }
    loadDraft()
  }, [draftId]) // eslint-disable-line react-hooks/exhaustive-deps

  const currentCat = DEFAULT_CATEGORIES[step]
  const currentScore = scores[step]
  const questions = getQuestions(currentCat?.id ?? '')
  const progress = ((step + 1) / DEFAULT_CATEGORIES.length) * 100
  const isLast = step === DEFAULT_CATEGORIES.length - 1
  const isFirst = step === 0
  const filledCount = scores.filter((s) => s.value !== 5 || s.reflectionNotes).length

  const updateScore = useCallback(
    (value: number) => {
      setScores((prev) => {
        const next = [...prev]
        next[step] = { ...next[step], value }
        return next
      })
      setDraftSaved(false)
    },
    [step]
  )

  const updateNotes = useCallback(
    (reflectionNotes: string) => {
      setScores((prev) => {
        const next = [...prev]
        next[step] = { ...next[step], reflectionNotes }
        return next
      })
      setDraftSaved(false)
    },
    [step]
  )

  const goNext = useCallback(() => {
    if (isLast) {
      handleSubmit()
    } else {
      setStep((s) => s + 1)
    }
  }, [isLast])

  const goPrev = useCallback(() => {
    if (!isFirst) setStep((s) => s - 1)
  }, [isFirst])

  async function saveDraft() {
    setSaving(true)
    setDraftSaved(false)
    try {
      const action = currentDraftId ? 'update' : 'create'
      let assessmentId = currentDraftId

      const scoresToSave = scores.filter((s) => s.value !== 5 || s.reflectionNotes)

      if (action === 'create' || !assessmentId) {
        const res = await fetch('/api/assessments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: `Avaliação - ${new Date().toLocaleDateString('pt-BR')}`,
            scores: scoresToSave,
            status: 'DRAFT',
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        assessmentId = data.assessment.id
        setCurrentDraftId(assessmentId)
        window.history.replaceState(null, '', `/assessment/new?draft=${assessmentId}`)
      } else {
        await fetch(`/api/assessments/${assessmentId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scores: scoresToSave }),
        })
      }

      setDraftSaved(true)
    } catch (error) {
      console.error('Erro ao salvar rascunho:', error)
      alert('Erro ao salvar rascunho. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  async function handleSubmit() {
    setSubmitting(true)
    try {
      const allScores = scores.map((s) => ({
        categoryId: s.categoryId,
        value: s.value,
        reflectionNotes: s.reflectionNotes || null,
      }))

      if (currentDraftId) {
        const res = await fetch(`/api/assessments/${currentDraftId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scores: allScores, status: 'COMPLETED' }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        router.push(`/assessment/${currentDraftId}`)
      } else {
        const res = await fetch('/api/assessments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: `Avaliação - ${new Date().toLocaleDateString('pt-BR')}`,
            scores: allScores,
            status: 'COMPLETED',
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        router.push(`/assessment/${data.assessment.id}`)
      }
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error)
      alert('Erro ao salvar. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!loaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f7f3ff] to-[#e9e0f5] flex items-center justify-center">
        <div className="text-[#7c3aed] text-lg font-semibold animate-pulse">Carregando rascunho...</div>
      </div>
    )
  }

  if (!currentCat) return null

  const currentAvg = calculateAverage(
    Object.fromEntries(scores.map((s) => [s.categoryId, s.value]))
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7f3ff] to-[#e9e0f5]">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-xl border-b border-white/40 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-[#4a2c7a] to-[#7c3aed] bg-clip-text text-transparent">
              ✦ {currentDraftId ? 'Continuar Avaliação' : 'Nova Avaliação'}
            </h1>
            {currentDraftId && (
              <p className="text-xs text-[#6b5b7b] mt-0.5">
                Rascunho salvo · {filledCount}/{DEFAULT_CATEGORIES.length} áreas
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#6b5b7b]">
              {step + 1}/{DEFAULT_CATEGORIES.length}
            </span>
            <div className="bg-white/80 rounded-full px-4 py-1.5 shadow-sm border border-white/40">
              <span className="text-sm font-semibold text-[#4a2c7a]">
                Média: {currentAvg.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
        <div className="h-1 bg-[#e0d8ea]">
          <div
            className="h-full bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div
          className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-xl"
          style={{ borderLeftColor: currentCat.color, borderLeftWidth: 4 }}
        >
          <div className="flex items-start gap-4 mb-6">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-md shrink-0"
              style={{ backgroundColor: currentCat.color }}
            >
              {step + 1}
            </div>
            <div className="flex-1">
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: currentCat.color }}
              >
                {currentCat.pillar}
              </span>
              <h2 className="text-2xl font-bold text-[#2d1b3d] mt-0.5">
                {currentCat.label}
              </h2>
            </div>
          </div>

          <div className="bg-[#f7f3ff] rounded-2xl p-5 mb-6 border border-[#e0d8ea]">
            <h3 className="text-sm font-semibold text-[#4a2c7a] mb-3 flex items-center gap-2">
              <span>💡</span> Reflita antes de avaliar
            </h3>
            <ul className="space-y-2">
              {questions.map((q, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-[#2d1b3d]">
                  <span className="text-[#7c3aed] mt-0.5 shrink-0">✦</span>
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#6b5b7b]">0 — Totalmente insatisfeito</span>
              <span className="text-xs font-semibold text-[#6b5b7b]">10 — Totalmente satisfeito</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-lg font-bold text-[#8a7a9a] min-w-[24px] text-right">0</span>
              <input
                type="range"
                min={0}
                max={10}
                step={1}
                value={currentScore.value}
                onChange={(e) => updateScore(parseInt(e.target.value, 10))}
                className="flex-1 h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${currentCat.color}33, ${currentCat.color} ${currentScore.value * 10}%, #e0d8ea ${currentScore.value * 10}%)`,
                }}
              />
              <span className="text-lg font-bold text-[#8a7a9a] min-w-[24px]">10</span>
            </div>
            <div className="text-center mt-2">
              <span
                className="inline-flex items-center justify-center w-14 h-14 rounded-full text-2xl font-bold text-white shadow-lg"
                style={{ backgroundColor: currentCat.color }}
              >
                {currentScore.value}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#2d1b3d] mb-1.5">
              Anotações (opcional)
            </label>
            <textarea
              value={currentScore.reflectionNotes}
              onChange={(e) => updateNotes(e.target.value)}
              placeholder="O que motivou essa nota? Quer registrar algo?"
              rows={2}
              className="w-full px-4 py-3 rounded-xl border border-[#e0d8ea] bg-white/60 focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20 outline-none transition-all resize-none text-sm"
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-8">
          <button
            onClick={goPrev}
            disabled={isFirst}
            className="px-6 py-3 rounded-xl border border-[#e0d8ea] bg-white/60 text-[#6b5b7b] font-semibold hover:bg-white/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Anterior
          </button>

          <div className="flex gap-2">
            {DEFAULT_CATEGORIES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setStep(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  idx === step
                    ? 'bg-[#7c3aed] scale-125'
                    : scores[idx]?.value !== 5 || scores[idx]?.reflectionNotes
                    ? 'bg-[#10b981]'
                    : 'bg-[#e0d8ea]'
                }`}
              />
            ))}
          </div>

          <button
            onClick={goNext}
            disabled={submitting}
            className={`px-8 py-3 rounded-xl font-semibold text-white shadow-lg transition-all ${
              isLast
                ? 'bg-gradient-to-r from-[#10b981] to-[#059669] hover:from-[#059669] hover:to-[#047857]'
                : 'bg-[#7c3aed] hover:bg-[#6d28d9]'
            } disabled:opacity-60`}
          >
            {submitting ? 'Salvando...' : isLast ? '✅ Finalizar Avaliação' : 'Próximo →'}
          </button>
        </div>

        <div className="flex items-center justify-center mt-6 gap-3">
          <button
            onClick={saveDraft}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl border-2 border-dashed border-[#c4b5d4] bg-white/40 text-[#6b5b7b] font-semibold hover:bg-white/70 hover:border-[#7c3aed] hover:text-[#7c3aed] transition-all text-sm disabled:opacity-60"
          >
            {saving ? 'Salvando...' : '💾 Salvar Rascunho'}
          </button>
          {draftSaved && (
            <span className="text-xs text-[#10b981] font-semibold animate-pulse">
              ✓ Salvo!
            </span>
          )}
          {currentDraftId && (
            <a
              href={`/assessment/${currentDraftId}`}
              className="text-xs text-[#6b5b7b] hover:text-[#7c3aed] underline"
            >
              Ver rascunho
            </a>
          )}
        </div>

        <div className="text-center mt-4">
          <p className="text-xs text-[#8a7a9a]">
            {filledCount} de {DEFAULT_CATEGORIES.length} áreas respondidas
            {currentDraftId && ' · Rascunho salvo'}
          </p>
        </div>
      </main>
    </div>
  )
}
