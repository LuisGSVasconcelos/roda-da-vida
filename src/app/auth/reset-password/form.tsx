'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const t = searchParams.get('token')
    if (t) setToken(t)
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!token) { setError('Token é obrigatório'); return }
    if (password.length < 6) { setError('Senha deve ter ao menos 6 caracteres'); return }
    if (password !== confirmPassword) { setError('Senhas não conferem'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erro ao redefinir')
        setLoading(false)
        return
      }

      setSuccess(true)
    } catch {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f7f3ff] to-[#e9e0f5] p-6">
        <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/50 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-[#2d1b3d] mb-2">Senha Redefinida!</h1>
          <p className="text-sm text-[#6b5b7b] mb-6">Sua senha foi alterada com sucesso.</p>
          <Link
            href="/auth/login"
            className="inline-block px-8 py-3 rounded-xl bg-[#7c3aed] text-white font-semibold shadow-lg hover:bg-[#6d28d9] transition-all"
          >
            Fazer Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f7f3ff] to-[#e9e0f5] p-6">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/50">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#4a2c7a] to-[#7c3aed] bg-clip-text text-transparent">
            🔑 Nova Senha
          </h1>
          <p className="text-[#6b5b7b] mt-2">Digite o token recebido e sua nova senha</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-200">{error}</div>
          )}

          <div>
            <label htmlFor="token" className="block text-sm font-semibold text-[#2d1b3d] mb-1.5">
              Token de Redefinição
            </label>
            <input
              id="token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Cole o token recebido"
              required
              className="w-full px-4 py-3 rounded-xl border border-[#e0d8ea] bg-white/60 focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20 outline-none transition-all font-mono text-sm"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-[#2d1b3d] mb-1.5">
              Nova Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-xl border border-[#e0d8ea] bg-white/60 focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20 outline-none transition-all"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-[#2d1b3d] mb-1.5">
              Confirmar Nova Senha
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repita a nova senha"
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-xl border border-[#e0d8ea] bg-white/60 focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20 outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#10b981] text-white font-semibold shadow-lg shadow-[#10b981]/25 hover:bg-[#059669] transition-all disabled:opacity-60"
          >
            {loading ? 'Redefinindo...' : 'Redefinir Senha'}
          </button>
        </form>

        <p className="text-center text-sm text-[#8a7a9a] mt-6">
          <Link href="/auth/forgot-password" className="text-[#7c3aed] font-semibold hover:underline">
            ← Solicitar novo token
          </Link>
          {' · '}
          <Link href="/auth/login" className="text-[#7c3aed] font-semibold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}
