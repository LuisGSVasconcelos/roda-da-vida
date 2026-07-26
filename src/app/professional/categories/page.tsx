'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface CategoryItem {
  id: string
  name: string
  description: string | null
  color: string
  icon: string
  order: number
  isDefault: boolean
  userId: string | null
}

const PRESET_COLORS = [
  '#EF4444', '#F97316', '#EAB308', '#22c55e', '#34D399',
  '#14B8A6', '#06B6D4', '#3B82F6', '#6366f1', '#8B5CF6',
  '#A78BFA', '#EC4899', '#F472B6', '#F59E0B',
]

export default function CategoriesManagerPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: '', color: '' })
  const [showNewForm, setShowNewForm] = useState(false)
  const [newForm, setNewForm] = useState({ name: '', color: '#6366f1' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories')
      if (!res.ok) throw new Error('Erro ao carregar')
      const data = await res.json()
      setCategories(data.categories)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadCategories() }, [loadCategories])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newForm),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Erro ao criar')
        return
      }

      setShowNewForm(false)
      setNewForm({ name: '', color: '#6366f1' })
      setSuccess('Categoria criada!')
      loadCategories()
    } catch {
      setError('Erro de conexão')
    }
  }

  async function handleEdit(id: string) {
    if (!editForm.name || editForm.name.trim().length < 2) {
      setError('Nome deve ter ao menos 2 caracteres')
      return
    }

    setError('')
    setSuccess('')

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Erro ao editar')
        return
      }

      setEditingId(null)
      setSuccess('Categoria atualizada!')
      loadCategories()
    } catch {
      setError('Erro de conexão')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta categoria? As avaliações existentes não serão afetadas.')) return

    setError('')
    setSuccess('')

    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Erro ao excluir')
        return
      }

      setSuccess('Categoria excluída!')
      loadCategories()
    } catch {
      setError('Erro de conexão')
    }
  }

  async function handleMoveUp(id: string, currentOrder: number) {
    const above = categories.find(c => c.order < currentOrder && !c.isDefault)
    if (!above) return
    await fetch(`/api/categories/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: above.order }),
    })
    await fetch(`/api/categories/${above.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: currentOrder }),
    })
    loadCategories()
  }

  async function handleMoveDown(id: string, currentOrder: number) {
    const below = categories.find(c => c.order > currentOrder && !c.isDefault)
    if (!below) return
    await fetch(`/api/categories/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: below.order }),
    })
    await fetch(`/api/categories/${below.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: currentOrder }),
    })
    loadCategories()
  }

  const defaultCats = categories.filter(c => c.isDefault)
  const customCats = categories.filter(c => !c.isDefault)

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
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold bg-gradient-to-r from-[#4a2c7a] to-[#7c3aed] bg-clip-text text-transparent">
            🏷️ Gerenciar Categorias
          </h1>
          <a href="/dashboard" className="text-sm text-[#6b5b7b] hover:text-[#4a2c7a] transition-colors">
            ← Dashboard
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-4 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-200">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 bg-green-50 text-green-600 text-sm px-4 py-3 rounded-xl border border-green-200">
            {success}
          </div>
        )}

        {/* Categorias padrão (read-only) */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-xl mb-6">
          <h2 className="text-lg font-bold text-[#2d1b3d] mb-4">📌 Categorias Padrão</h2>
          <p className="text-xs text-[#6b5b7b] mb-4">
            Estas categorias estão disponíveis para todos os usuários. Não podem ser editadas.
          </p>
          <div className="grid gap-2">
            {defaultCats.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#f7f3ff]/60 border border-[#e0d8ea]"
              >
                <div
                  className="w-4 h-4 rounded-full shrink-0 border-2 border-white shadow-sm"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="flex-1 text-sm font-medium text-[#2d1b3d]">{cat.name}</span>
                <span className="text-xs text-[#8a7a9a] bg-white/60 px-2 py-0.5 rounded-full">
                  Padrão
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Categorias personalizadas (editável) */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#2d1b3d]">✨ Minhas Categorias</h2>
            <button
              onClick={() => setShowNewForm(!showNewForm)}
              className="px-4 py-2 rounded-xl bg-[#7c3aed] text-white text-sm font-semibold shadow-md hover:bg-[#6d28d9] transition-all"
            >
              {showNewForm ? '✕ Cancelar' : '+ Nova Categoria'}
            </button>
          </div>

          {/* Formulário de nova categoria */}
          {showNewForm && (
            <form onSubmit={handleCreate} className="mb-6 bg-[#f7f3ff] rounded-2xl p-5 border border-[#e0d8ea]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-[#4a2c7a] mb-1">Nome</label>
                  <input
                    type="text"
                    value={newForm.name}
                    onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                    placeholder="Ex: Carreira"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-[#e0d8ea] bg-white/60 text-sm focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#4a2c7a] mb-1">Cor</label>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewForm({ ...newForm, color })}
                        className={`w-7 h-7 rounded-full border-2 transition-all ${
                          newForm.color === color ? 'border-[#2d1b3d] scale-110' : 'border-white shadow-sm'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#10b981] text-white text-sm font-semibold shadow-md hover:bg-[#059669] transition-all"
                >
                  ✅ Criar
                </button>
              </div>
            </form>
          )}

          {/* Lista de categorias personalizadas */}
          {customCats.length === 0 && !showNewForm ? (
            <p className="text-sm text-[#8a7a9a] text-center py-8">
              Nenhuma categoria personalizada ainda. Clique em "+ Nova Categoria" para criar.
            </p>
          ) : (
            <div className="space-y-2">
              {customCats.map((cat, idx) => (
                <div
                  key={cat.id}
                  className="rounded-xl border border-[#e0d8ea] overflow-hidden"
                >
                  {editingId === cat.id ? (
                    /* Modo edição */
                    <div className="p-4 bg-[#f7f3ff]">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-xs font-semibold text-[#4a2c7a] mb-1">Nome</label>
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-[#e0d8ea] bg-white/60 text-sm focus:border-[#7c3aed] outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#4a2c7a] mb-1">Cor</label>
                          <div className="flex flex-wrap gap-1.5">
                            {PRESET_COLORS.map((color) => (
                              <button
                                key={color}
                                type="button"
                                onClick={() => setEditForm({ ...editForm, color })}
                                className={`w-6 h-6 rounded-full border-2 transition-all ${
                                  editForm.color === color ? 'border-[#2d1b3d] scale-110' : 'border-white shadow-sm'
                                }`}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1.5 rounded-xl border border-[#e0d8ea] bg-white/60 text-xs font-semibold text-[#6b5b7b]"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => handleEdit(cat.id)}
                          className="px-3 py-1.5 rounded-xl bg-[#7c3aed] text-white text-xs font-semibold"
                        >
                          Salvar
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Modo visualização */
                    <div className="flex items-center gap-3 px-4 py-3 bg-white/60">
                      <div
                        className="w-4 h-4 rounded-full shrink-0 border-2 border-white shadow-sm"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="flex-1 text-sm font-medium text-[#2d1b3d]">{cat.name}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingId(cat.id)
                            setEditForm({ name: cat.name, color: cat.color })
                          }}
                          className="p-1.5 rounded-lg hover:bg-[#f0ebf5] text-[#8a7a9a] hover:text-[#4a2c7a] transition-all"
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-[#8a7a9a] hover:text-red-500 transition-all"
                          title="Excluir"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
