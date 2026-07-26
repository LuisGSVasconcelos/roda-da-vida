'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [step, setStep] = useState<'form' | 'done'>('form')
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erro ao solicitar')
        setLoading(false)
        return
      }

      // Em dev, exibe o token
      if (data.token) {
        setToken(data.token)
      }
      setStep('done')
    } catch {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f7f3ff] to-[#e9e0f5] p-6">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/50">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#4a2c7a] to-[#7c3aed] bg-clip-text text-transparent">
            🔑 Redefinir Senha
          </h1>
          <p className="text-[#6b5b7b] mt-2">
            {step === 'form'
              ? 'Digite seu email para receber um token de redefinição'
              : 'Token gerado! Abaixo está seu token para redefinir a senha.'}
          </p>
        </div>

        {step === 'form' ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-200">{error}</div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-[#2d1b3d] mb-1.5">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-[#e0d8ea] bg-white/60 focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20 outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#7c3aed] text-white font-semibold shadow-lg shadow-[#7c3aed]/25 hover:bg-[#6d28d9] transition-all disabled:opacity-60"
            >
              {loading ? 'Enviando...' : 'Enviar Token'}
            </button>
          </form>
        ) : (
          <div className="space-y-5">
            {token && (
              <div>
                <label className="block text-sm font-semibold text-[#2d1b3d] mb-1.5">Seu token (desenvolvimento)</label>
                <div className="bg-[#f7f3ff] rounded-xl p-4 border border-[#e0d8ea]">
                  <code className="text-xs text-[#4a2c7a] break-all select-all">{token}</code>
                </div>
                <p className="text-xs text-[#8a7a9a] mt-2">
                  Em produção, este token seria enviado por email. Copie-o e vá para a página de redefinição.
                </p>
              </div>
            )}

            <Link
              href={`/auth/reset-password${token ? `?token=${token}` : ''}`}
              className="block w-full text-center py-3 rounded-xl bg-[#10b981] text-white font-semibold shadow-lg hover:bg-[#059669] transition-all"
            >
              Redefinir Senha →
            </Link>

            <p className="text-center text-sm text-[#8a7a9a]">
              <Link href="/auth/login" className="text-[#7c3aed] font-semibold hover:underline">
                Voltar ao login
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
