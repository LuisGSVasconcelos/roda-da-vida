'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { WheelRadar } from '@/components/radar-chart'
import { renderRadarToDataURL } from '@/lib/radar-renderer'
import { DEFAULT_CATEGORIES, calculateAverage } from '@/data/categories'
import type { CategoryData } from '@/types'

interface AssessmentData {
  id: string
  title: string
  createdAt: string
  scores: Array<{
    id: string
    value: number
    reflectionNotes: string | null
    category: { id: string; name: string; color: string }
  }>
}

export default function RadarDetailPage() {
  const params = useParams()
  const [assessment, setAssessment] = useState<AssessmentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

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

  function handleExportPNG() {
    if (!assessment) return
    setExporting(true)
    try {
      const valuesMap: Record<string, number> = {}
      assessment.scores.forEach((s) => { valuesMap[s.category.id] = s.value })

      const dataURL = renderRadarToDataURL({
        width: 600,
        height: 600,
        scale: 3,
        categories: DEFAULT_CATEGORIES as CategoryData[],
        values: valuesMap,
      })

      const link = document.createElement('a')
      link.href = dataURL
      link.download = `roda_vida_${Date.now()}.png`
      link.click()
    } catch (error) {
      console.error('Erro ao exportar:', error)
    } finally {
      setExporting(false)
    }
  }

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
            Voltar
          </Link>
        </div>
      </div>
    )
  }

  const valuesMap: Record<string, number> = {}
  assessment.scores.forEach((s) => { valuesMap[s.category.id] = s.value })
  const avg = calculateAverage(valuesMap)

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7f3ff] to-[#e9e0f5]">
      <header className="bg-white/70 backdrop-blur-xl border-b border-white/40">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold bg-gradient-to-r from-[#4a2c7a] to-[#7c3aed] bg-clip-text text-transparent">
            🖼 Radar Ampliado
          </h1>
          <div className="flex items-center gap-3">
            <Link
              href={`/assessment/${assessment.id}`}
              className="text-sm text-[#6b5b7b] hover:text-[#4a2c7a] transition-colors"
            >
              ← Voltar
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[#2d1b3d]">Roda da Vida</h2>
              <p className="text-sm text-[#6b5b7b]">
                {new Date(assessment.createdAt).toLocaleDateString('pt-BR')} · Média {avg.toFixed(1)}
              </p>
            </div>
            <button
              onClick={handleExportPNG}
              disabled={exporting}
              className="px-5 py-2.5 rounded-xl bg-[#10b981] text-white font-semibold shadow-lg shadow-[#10b981]/25 hover:bg-[#059669] transition-all text-sm disabled:opacity-60"
            >
              {exporting ? 'Exportando...' : '📷 Exportar PNG'}
            </button>
          </div>

          <WheelRadar
            categories={DEFAULT_CATEGORIES as CategoryData[]}
            values={valuesMap}
            height={600}
          />
        </div>
      </main>
    </div>
  )
}
