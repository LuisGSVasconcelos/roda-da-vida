'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'

interface ClientItem {
  id: string
  name: string
  email: string | null
  phone: string | null
  notes: string | null
  createdAt: string
  assessments: Array<{ id: string; title: string; createdAt: string }>
  _count: { assessments: number; goals: number }
}

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/clients')
      if (!res.ok) throw new Error()
      const data = await res.json()
      setClients(data.clients)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Erro ao criar')
        return
      }

      setShowForm(false)
      setForm({ name: '', email: '', phone: '', notes: '' })
      setSuccess('Cliente cadastrado!')
      load()
    } catch {
      setError('Erro de conexão')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f7f3ff] to-[#e9e0f5] flex items-center justify-center">
        <div className="text-[#7c3aed] font-semibold animate-pulse">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7f3ff] to-[#e9e0f5]">
      <header className="bg-white/70 backdrop-blur-xl border-b border-white/40">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold bg-gradient-to-r from-[#4a2c7a] to-[#7c3aed] bg-clip-text text-transparent">
            👥 Meus Clientes
          </h1>
          <Link href="/dashboard" className="text-sm text-[#6b5b7b] hover:text-[#4a2c7a]">
            ← Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-4 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-200">{error}</div>
        )}
        {success && (
          <div className="mb-4 bg-green-50 text-green-600 text-sm px-4 py-3 rounded-xl border border-green-200">{success}</div>
        )}

        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-[#6b5b7b]">{clients.length} cliente{clients.length !== 1 ? 's' : ''}</p>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-5 py-2.5 rounded-xl bg-[#7c3aed] text-white text-sm font-semibold shadow-lg hover:bg-[#6d28d9] transition-all"
          >
            {showForm ? '✕ Cancelar' : '+ Novo Cliente'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="mb-6 bg-white/80 backdrop-blur-xl rounded-2xl p-5 border border-white/50 shadow-md">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-[#4a2c7a] mb-1">Nome *</label>
                <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="Nome do cliente" required
                  className="w-full px-3 py-2 rounded-xl border border-[#e0d8ea] bg-white/60 text-sm focus:border-[#7c3aed] outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#4a2c7a] mb-1">Email</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="email@cliente.com"
                  className="w-full px-3 py-2 rounded-xl border border-[#e0d8ea] bg-white/60 text-sm focus:border-[#7c3aed] outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#4a2c7a] mb-1">Telefone</label>
                <input value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} placeholder="(11) 99999-9999"
                  className="w-full px-3 py-2 rounded-xl border border-[#e0d8ea] bg-white/60 text-sm focus:border-[#7c3aed] outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#4a2c7a] mb-1">Observações</label>
                <input value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} placeholder="Anotações"
                  className="w-full px-3 py-2 rounded-xl border border-[#e0d8ea] bg-white/60 text-sm focus:border-[#7c3aed] outline-none" />
              </div>
            </div>
            <button type="submit" className="px-5 py-2 rounded-xl bg-[#10b981] text-white text-sm font-semibold hover:bg-[#059669] transition-all">
              ✅ Cadastrar
            </button>
          </form>
        )}

        {clients.length === 0 && !showForm ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-12 border border-white/50 shadow-xl text-center">
            <div className="text-5xl mb-4">👥</div>
            <h2 className="text-xl font-bold text-[#2d1b3d] mb-2">Nenhum cliente ainda</h2>
            <p className="text-sm text-[#6b5b7b]">Cadastre clientes para aplicar avaliações e acompanhar o progresso</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {clients.map((client) => (
              <div key={client.id} className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 border border-white/50 shadow-md">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-[#2d1b3d]">{client.name}</h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-[#6b5b7b]">
                      {client.email && <span>📧 {client.email}</span>}
                      {client.phone && <span>📞 {client.phone}</span>}
                    </div>
                  </div>
                  <div className="text-right text-xs text-[#6b5b7b]">
                    <div>{client._count.assessments} avaliação{client._count.assessments !== 1 ? 'ões' : ''}</div>
                    <div>{client._count.goals} meta{client._count.goals !== 1 ? 's' : ''}</div>
                  </div>
                </div>

                {client.assessments.length > 0 && (
                  <div className="mt-3 flex items-center gap-2 text-xs">
                    <span className="text-[#6b5b7b]">Última avaliação:</span>
                    <Link href={`/assessment/${client.assessments[0].id}`} className="text-[#7c3aed] font-semibold hover:underline">
                      {new Date(client.assessments[0].createdAt).toLocaleDateString('pt-BR')}
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
