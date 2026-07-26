'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { WheelRadar } from '@/components/radar-chart'
import { DEFAULT_CATEGORIES, calculateAverage } from '@/data/categories'
import type { CategoryData } from '@/types'

interface ScoreData {
  id: string
  value: number
  category: { id: string; name: string; color: string }
}

interface AssessmentEntry {
  id: string
  title: string
  createdAt: string
  scores: ScoreData[]
}

export default function HistoryPage() {
  const [assessments, setAssessments] = useState<AssessmentEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [compareIds, setCompareIds] = useState<string[]>([])

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/assessments')
      if (!res.ok) throw new Error()
      const data = await res.json()
      setAssessments(data.assessments)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  function getValues(entry: AssessmentEntry): Record<string, number> {
    const map: Record<string, number> = {}
    entry.scores.forEach((s) => { map[s.category.id] = s.value })
    return map
  }

  function getAverageScore(entry: AssessmentEntry): number {
    return calculateAverage(getValues(entry))
  }

  function toggleCompare(id: string) {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= 2) return [prev[1], id]
      return [...prev, id]
    })
  }

  const sorted = [...assessments].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  const chronological = [...assessments].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )

  const selectedForCompare = assessments.filter((a) => compareIds.includes(a.id))

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
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold bg-gradient-to-r from-[#4a2c7a] to-[#7c3aed] bg-clip-text text-transparent">
            📈 Histórico de Avaliações
          </h1>
          <Link href="/dashboard" className="text-sm text-[#6b5b7b] hover:text-[#4a2c7a]">
            ← Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {assessments.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-12 border border-white/50 shadow-xl text-center">
            <div className="text-5xl mb-4">📊</div>
            <h2 className="text-xl font-bold text-[#2d1b3d] mb-2">Nenhuma avaliação ainda</h2>
            <p className="text-sm text-[#6b5b7b] mb-6">
              Faça sua primeira avaliação para começar a acompanhar sua evolução
            </p>
            <Link
              href="/assessment/new"
              className="inline-block px-6 py-3 rounded-xl bg-[#7c3aed] text-white font-semibold shadow-lg hover:bg-[#6d28d9] transition-all"
            >
              Nova Avaliação
            </Link>
          </div>
        ) : (
          <>
            {/* Gráfico de evolução */}
            {chronological.length >= 2 && (
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-xl mb-8">
                <h2 className="text-lg font-bold text-[#2d1b3d] mb-4">📈 Evolução da Média Geral</h2>
                <EvolutionChart assessments={chronological} />
                <p className="text-xs text-[#6b5b7b] text-center mt-3">
                  Recomendação: avalie a cada 3-6 meses para acompanhar sua evolução
                </p>
              </div>
            )}

            {/* Comparação selecionada */}
            {selectedForCompare.length === 2 && (
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-xl mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-[#2d1b3d]">🔄 Comparação</h2>
                  <button
                    onClick={() => setCompareIds([])}
                    className="text-xs text-[#6b5b7b] hover:text-red-500"
                  >
                    Limpar comparação
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedForCompare.map((entry) => (
                    <div key={entry.id} className="text-center">
                      <p className="text-sm font-semibold text-[#2d1b3d]">
                        {new Date(entry.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-2xl font-bold text-[#7c3aed]">
                        {getAverageScore(entry).toFixed(1)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 bg-[#f7f3ff] rounded-2xl p-4 border border-[#e0d8ea]">
                  {DEFAULT_CATEGORIES.map((cat) => {
                    const v1 = getValues(selectedForCompare[0])[cat.id] ?? 0
                    const v2 = getValues(selectedForCompare[1])[cat.id] ?? 0
                    const diff = v2 - v1
                    return (
                      <div key={cat.id} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                        <span className="flex-1 text-[#2d1b3d]">{cat.label}</span>
                        <span className="font-semibold">{v1} → {v2}</span>
                        <span className={`text-xs font-bold ${diff > 0 ? 'text-green-500' : diff < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                          {diff > 0 ? `+${diff}` : diff}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Lista de avaliações */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[#2d1b3d]">
                  📋 Todas as Avaliações ({assessments.length})
                </h2>
                <Link
                  href="/assessment/new"
                  className="px-4 py-2 rounded-xl bg-[#7c3aed] text-white text-sm font-semibold shadow-md hover:bg-[#6d28d9] transition-all"
                >
                  + Nova
                </Link>
              </div>

              <div className="space-y-2">
                {sorted.map((entry) => {
                  const avg = getAverageScore(entry)
                  const isSelected = compareIds.includes(entry.id)
                  return (
                    <div
                      key={entry.id}
                      className={`flex items-center gap-4 px-4 py-3 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-[#7c3aed]/10 border-[#7c3aed]/30'
                          : 'bg-white/60 border-[#e0d8ea] hover:bg-white/90'
                      }`}
                    >
                      <button
                        onClick={() => toggleCompare(entry.id)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all shrink-0 ${
                          isSelected
                            ? 'bg-[#7c3aed] border-[#7c3aed] text-white'
                            : 'border-[#c4b5d4] hover:border-[#7c3aed]'
                        }`}
                        title="Selecionar para comparar"
                      >
                        {isSelected && <span className="text-xs">✓</span>}
                      </button>

                      <div className="flex-1">
                        <p className="text-sm font-semibold text-[#2d1b3d]">
                          {entry.title}
                        </p>
                        <p className="text-xs text-[#6b5b7b]">
                          {new Date(entry.createdAt).toLocaleDateString('pt-BR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>

                      <div className="text-center mr-2">
                        <div className="text-xl font-bold text-[#4a2c7a]">{avg.toFixed(1)}</div>
                        <div className="text-[9px] text-[#6b5b7b] uppercase">média</div>
                      </div>

                      <Link
                        href={`/assessment/${entry.id}`}
                        className="px-3 py-1.5 rounded-lg bg-[#f0ebf5] text-[#4a2c7a] text-xs font-semibold hover:bg-[#e0d8ea] transition-all"
                      >
                        Ver
                      </Link>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

// Componente de gráfico de evolução inline (SVG simples)
function EvolutionChart({ assessments }: { assessments: AssessmentEntry[] }) {
  const getAvg = (a: AssessmentEntry) => calculateAverage(
    Object.fromEntries(a.scores.map((s) => [s.category.id, s.value]))
  )

  const data = assessments.map((a) => ({
    date: new Date(a.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    avg: getAvg(a),
    fullDate: new Date(a.createdAt).toLocaleDateString('pt-BR'),
  }))

  const maxVal = 10
  const minVal = 0
  const w = 100
  const h = 50
  const pad = { top: 5, bottom: 15, left: 5, right: 5 }
  const chartW = w - pad.left - pad.right
  const chartH = h - pad.top - pad.bottom

  const points = data.map((d, i) => {
    const x = pad.left + (i / Math.max(data.length - 1, 1)) * chartW
    const y = pad.top + chartH - ((d.avg - minVal) / (maxVal - minVal)) * chartH
    return { x, y, ...d }
  })

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-32" preserveAspectRatio="xMidYMid meet">
        {/* Grid lines */}
        {[0, 5, 10].map((val) => {
          const y = pad.top + chartH - ((val - minVal) / (maxVal - minVal)) * chartH
          return (
            <g key={val}>
              <line x1={pad.left} y1={y} x2={w - pad.right} y2={y} stroke="rgba(100,80,120,0.1)" strokeWidth={0.3} />
              <text x={pad.left - 1} y={y} textAnchor="end" fontSize={3} fill="#8a7a9a">{val}</text>
            </g>
          )
        })}

        {/* Line */}
        <path d={pathD} fill="none" stroke="#7c3aed" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />

        {/* Dots + values */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={2} fill="#7c3aed" stroke="#fff" strokeWidth={0.8} />
            {data.length <= 10 && (
              <text x={p.x} y={p.y - 3.5} textAnchor="middle" fontSize={2.8} fill="#2d1b3d" fontWeight="bold">
                {p.avg.toFixed(1)}
              </text>
            )}
          </g>
        ))}

        {/* Date labels */}
        {points.map((p, i) => (
          <text
            key={i}
            x={p.x}
            y={h - 2}
            textAnchor="middle"
            fontSize={2.8}
            fill="#6b5b7b"
            transform={data.length > 6 ? `rotate(-30, ${p.x}, ${h - 2})` : undefined}
          >
            {p.date}
          </text>
        ))}
      </svg>
    </div>
  )
}
