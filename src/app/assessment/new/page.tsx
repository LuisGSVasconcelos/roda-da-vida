// Server component wrapper — necessário para Suspense com useSearchParams
import { Suspense } from 'react'
import AssessmentForm from './form'

export default function NewAssessmentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#f7f3ff] to-[#e9e0f5] flex items-center justify-center">
        <div className="text-[#7c3aed] text-lg font-semibold animate-pulse">Carregando...</div>
      </div>
    }>
      <AssessmentForm />
    </Suspense>
  )
}
