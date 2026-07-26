'use client'

import { Suspense } from 'react'
import ResetPasswordForm from './form'

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f7f3ff] to-[#e9e0f5]">
        <div className="text-[#7c3aed] font-semibold animate-pulse">Carregando...</div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
