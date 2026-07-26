'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { WheelRadar } from '@/components/radar-chart'
import { PdfExportButton } from '@/components/pdf-export-button'
import { DEFAULT_CATEGORIES, calculateAverage } from '@/data/categories'
import type { CategoryData } from '@/types'

interface ScoreWithCategory {
  id: string
  value: number
  reflectionNotes: string | null
  category: {
    id: string
    name: string
    color: string
    order: number
  }
}

interface AssessmentData {
  id: string
  title: string
  createdAt: string
  scores: ScoreWithCategory[]
}

export default function AssessmentResultPage() {
  const params = useParams()
  const [assessment, setAssessment] = useState<AssessmentData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/assessments/${params.id}`)
        if (!res.ok) throw new Error('Erro ao carregar')
        const data = await res.json()
        setAssessment(data.assessment)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f7f3ff] to-[#e9e0f5] flex items-center justify-center">
        <div className="text-[#7c3aed] text-lg font-semibold animate-pulse">Carregando...</div>
      </div>
    )
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f7f3ff] to-[#e9e0f5] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Avaliação não encontrada</p>
          <Link href="/dashboard" className="text-[#7c3aed] font-semibold hover:underline">
            Voltar ao dashboard
          </Link>
        </div>
      </div>
    )
  }

  // Mapa de valores por categoryId
  const valuesMap: Record<string, number> = {}
  assessment.scores.forEach((s) => {
    valuesMap[s.category.id] = s.value
  })

  const avg = calculateAverage(valuesMap)

  // Ordenar scores por nota (crescente) para destacar prioridades
  const sortedScores = [...assessment.scores].sort((a, b) => a.value - b.value)
  const lowest = sortedScores.slice(0, 2)

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7f3ff] to-[#e9e0f5]">
      <header className="bg-white/70 backdrop-blur-xl border-b border-white/40">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold bg-gradient-to-r from-[#4a2c7a] to-[#7c3aed] bg-clip-text text-transparent">
            ✦ Resultado
          </h1>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-sm text-[#6b5b7b] hover:text-[#4a2c7a] transition-colors"
            >
              ← Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-5xl mx-auto px-6 py-8">
        {/* Score geral */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-4 bg-white/80 backdrop-blur-xl rounded-2xl px-8 py-4 border border-white/50 shadow-lg">
            <div>
              <p className="text-sm text-[#6b5b7b]">Média Geral</p>
              <p className="text-4xl font-bold text-[#2d1b3d]">{avg.toFixed(1)}</p>
            </div>
            <div className="w-px h-12 bg-[#e0d8ea]" />
            <div className="text-left">
              <p className="text-sm text-[#6b5b7b]">Data</p>
              <p className="text-lg font-semibold text-[#2d1b3d]">
                {new Date(assessment.createdAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Radar chart */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-xl">
            <h2 className="text-lg font-bold text-[#2d1b3d] mb-4">📊 Sua Roda da Vida</h2>
            <WheelRadar
              categories={DEFAULT_CATEGORIES as CategoryData[]}
              values={valuesMap}
              height={400}
            />
            {/* Guia de interpretação */}
            <div className="mt-6 bg-[#f7f3ff] rounded-2xl p-4 border border-[#e0d8ea] space-y-2">
              <p className="text-xs text-[#6b5b7b] flex items-center gap-2">
                <span>🎯</span> Não busque uma roda perfeitamente redonda — desníveis são naturais.
              </p>
              <p className="text-xs text-[#6b5b7b] flex items-center gap-2">
                <span>💡</span> Identifique a área com MAIOR impacto sobre as demais.
              </p>
              <p className="text-xs text-[#6b5b7b] flex items-center gap-2">
                <span>✅</span> Olhe também para as notas altas: quais hábitos estão funcionando?
              </p>
            </div>
          </div>

          {/* Scores por categoria */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[#2d1b3d]">📋 Suas Notas</h2>

            {/* Destaque: áreas prioritárias */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-5 border border-white/50 shadow-xl">
              <h3 className="text-sm font-semibold text-[#4a2c7a] mb-3">🔑 Áreas que mais precisam de atenção</h3>
              <div className="space-y-3">
                {lowest.map((s) => {
                  const cat = DEFAULT_CATEGORIES.find((c) => c.id === s.category.id)
                  return (
                    <div key={s.id} className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: cat?.color ?? '#7c3aed' }}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-[#2d1b3d]">{s.category.name}</p>
                        {s.reflectionNotes && (
                          <p className="text-xs text-[#6b5b7b] mt-0.5">{s.reflectionNotes}</p>
                        )}
                      </div>
                      <span
                        className="text-lg font-bold"
                        style={{ color: s.value < 5 ? '#ef4444' : s.value < 7 ? '#f59e0b' : '#22c55e' }}
                      >
                        {s.value}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Lista completa */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-5 border border-white/50 shadow-xl max-h-80 overflow-y-auto">
              <div className="space-y-2">
                {assessment.scores
                  .sort((a, b) => (a.category.order ?? 99) - (b.category.order ?? 99))
                  .map((s) => {
                    const cat = DEFAULT_CATEGORIES.find((c) => c.id === s.category.id)
                    return (
                      <div
                        key={s.id}
                        className="flex items-center gap-3 py-2 border-b border-[#f0ebf5] last:border-0"
                      >
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: cat?.color ?? '#7c3aed' }}
                        />
                        <span className="flex-1 text-sm text-[#2d1b3d]">{s.category.name}</span>
                        <span className="text-sm font-bold text-[#4a2c7a]">{s.value}/10</span>
                      </div>
                    )
                  })}
              </div>
            </div>

            {/* Ações */}
            <div className="flex gap-3">
              <Link
                href="/assessment/new"
                className="flex-1 text-center py-3 rounded-xl bg-[#7c3aed] text-white font-semibold shadow-lg shadow-[#7c3aed]/25 hover:bg-[#6d28d9] transition-all text-sm"
              >
                🔄 Nova Avaliação
              </Link>
              <Link
                href={`/assessment/${assessment.id}/radar`}
                className="flex-1 text-center py-3 rounded-xl border border-[#e0d8ea] bg-white/60 text-[#4a2c7a] font-semibold hover:bg-white/90 transition-all text-sm"
              >
                🖼 Radar Ampliado
              </Link>
              <div className="flex-1">
                <PdfExportButton assessmentId={assessment.id} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
