'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'INDIVIDUAL' | 'PROFESSIONAL'>('INDIVIDUAL')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password.length < 6) {
      setError('A senha deve ter ao menos 6 caracteres.')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Erro ao cadastrar.')
        setLoading(false)
        return
      }

      // Faz login automático após cadastro
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        router.push('/auth/login')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch {
      setError('Erro de conexão. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f7f3ff] to-[#e9e0f5] p-6">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/50">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#4a2c7a] to-[#7c3aed] bg-clip-text text-transparent">
            ✦ Criar Conta
          </h1>
          <p className="text-[#6b5b7b] mt-2">Comece sua jornada de autoconhecimento</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-[#2d1b3d] mb-1.5">
              Nome
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              required
              className="w-full px-4 py-3 rounded-xl border border-[#e0d8ea] bg-white/60 focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20 outline-none transition-all"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-[#2d1b3d] mb-1.5">
              Email
            </label>
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

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-[#2d1b3d] mb-1.5">
              Senha
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
            <label className="block text-sm font-semibold text-[#2d1b3d] mb-2">
              Tipo de conta
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('INDIVIDUAL')}
                className={`px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                  role === 'INDIVIDUAL'
                    ? 'border-[#7c3aed] bg-[#7c3aed]/10 text-[#4a2c7a]'
                    : 'border-[#e0d8ea] bg-white/60 text-[#6b5b7b] hover:border-[#c4b5d4]'
                }`}
              >
                🧑 Individual
              </button>
              <button
                type="button"
                onClick={() => setRole('PROFESSIONAL')}
                className={`px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                  role === 'PROFESSIONAL'
                    ? 'border-[#7c3aed] bg-[#7c3aed]/10 text-[#4a2c7a]'
                    : 'border-[#e0d8ea] bg-white/60 text-[#6b5b7b] hover:border-[#c4b5d4]'
                }`}
              >
                👨‍⚕️ Profissional
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#7c3aed] text-white font-semibold shadow-lg shadow-[#7c3aed]/25 hover:bg-[#6d28d9] transition-all disabled:opacity-60"
          >
            {loading ? 'Cadastrando...' : 'Criar Conta'}
          </button>
        </form>

        <p className="text-center text-sm text-[#8a7a9a] mt-6">
          Já tem conta?{' '}
          <Link href="/auth/login" className="text-[#7c3aed] font-semibold hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
