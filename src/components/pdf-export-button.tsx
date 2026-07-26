'use client'

import { useState } from 'react'

interface PdfExportButtonProps {
  assessmentId: string
  label?: string
}

export function PdfExportButton({ assessmentId, label = '📄 Exportar PDF' }: PdfExportButtonProps) {
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    setLoading(true)
    try {
      const res = await fetch(`/api/export/pdf?assessmentId=${assessmentId}`)
      if (!res.ok) throw new Error('Erro ao exportar')

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `roda-da-vida-${assessmentId}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Erro na exportação PDF:', err)
      alert('Erro ao exportar PDF. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ef4444] to-[#dc2626] text-white text-sm font-semibold shadow-lg shadow-[#ef4444]/25 hover:from-[#dc2626] hover:to-[#b91c1c] transition-all disabled:opacity-60"
    >
      {loading ? 'Exportando...' : label}
    </button>
  )
}
