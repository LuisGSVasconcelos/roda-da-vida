import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7f3ff] via-white to-[#e9e0f5]">
      {/* Header */}
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <h1 className="text-xl font-bold bg-gradient-to-r from-[#4a2c7a] to-[#7c3aed] bg-clip-text text-transparent">
          ✦ Roda da Vida
        </h1>
        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="px-5 py-2 rounded-xl border border-[#e0d8ea] bg-white/60 text-[#4a2c7a] font-semibold text-sm hover:bg-white/90 transition-all"
          >
            Entrar
          </Link>
          <Link
            href="/auth/register"
            className="px-5 py-2 rounded-xl bg-[#7c3aed] text-white font-semibold text-sm shadow-lg shadow-[#7c3aed]/25 hover:bg-[#6d28d9] transition-all"
          >
            Criar Conta
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-[#ede7f5] rounded-full px-4 py-1.5 mb-6">
          <span className="w-2 h-2 rounded-full bg-[#7c3aed] animate-pulse" />
          <span className="text-xs font-semibold text-[#4a2c7a]">Autoconhecimento · Foco · Metas</span>
        </div>

        <h2 className="text-5xl sm:text-6xl font-bold text-[#2d1b3d] leading-tight mb-6">
          Transforme reflexões<br />
          em{' '}
          <span className="bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] bg-clip-text text-transparent">
            dados visuais
          </span>
        </h2>

        <p className="text-lg text-[#6b5b7b] max-w-2xl mx-auto mb-10">
          Avalie as 12 áreas da sua vida, crie planos de ação com 5W2H,
          acompanhe hábitos diários e veja sua evolução ao longo do tempo.
        </p>

        <div className="flex items-center justify-center gap-4">
          <Link
            href="/auth/register"
            className="px-8 py-4 rounded-xl bg-[#7c3aed] text-white font-bold text-lg shadow-xl shadow-[#7c3aed]/30 hover:bg-[#6d28d9] transition-all hover:-translate-y-0.5"
          >
            Começar Grátis →
          </Link>
          <Link
            href="/auth/login"
            className="px-8 py-4 rounded-xl border border-[#e0d8ea] bg-white/60 text-[#4a2c7a] font-semibold text-lg hover:bg-white/90 transition-all"
          >
            Já tenho conta
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-lg">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-bold text-[#2d1b3d] mb-2">Avaliação Completa</h3>
            <p className="text-sm text-[#6b5b7b]">
              Responda perguntas reflexivas em 12 áreas da vida e visualize seu equilíbrio em um gráfico radar interativo.
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-lg">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-lg font-bold text-[#2d1b3d] mb-2">Metas 5W2H</h3>
            <p className="text-sm text-[#6b5b7b]">
              Estruture planos de ação concretos com o modelo 5W2H e desmembre em hábitos diários com streak tracking.
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-lg">
            <div className="text-4xl mb-4">📈</div>
            <h3 className="text-lg font-bold text-[#2d1b3d] mb-2">Evolução no Tempo</h3>
            <p className="text-sm text-[#6b5b7b]">
              Compare avaliações anteriores, veja sua evolução em gráficos e exporte relatórios em PDF.
            </p>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-[#2d1b3d] text-center mb-12">
          12 Áreas · 4 Pilares
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Pilar Pessoal', cats: 'Saúde · Intelectual · Emocional', color: '#EF4444' },
            { name: 'Pilar Profissional', cats: 'Propósito · Finanças · Social', color: '#3B82F6' },
            { name: 'Relacionamentos', cats: 'Família · Amoroso · Amizades', color: '#8B5CF6' },
            { name: 'Qualidade de Vida', cats: 'Lazer · Plenitude · Espiritualidade', color: '#34D399' },
          ].map((pillar) => (
            <div
              key={pillar.name}
              className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-md text-center"
            >
              <div className="w-3 h-3 rounded-full mx-auto mb-3" style={{ backgroundColor: pillar.color }} />
              <h3 className="text-sm font-bold text-[#2d1b3d] mb-1">{pillar.name}</h3>
              <p className="text-xs text-[#6b5b7b]">{pillar.cats}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
        <div className="bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] rounded-3xl p-12 shadow-xl">
          <h2 className="text-3xl font-bold text-white mb-4">
            Pronto para começar sua jornada?
          </h2>
          <p className="text-[#c4b5d4] mb-8 max-w-lg mx-auto">
            Cadastre-se grátis e comece a transformar suas reflexões em resultados concretos.
          </p>
          <Link
            href="/auth/register"
            className="inline-block px-8 py-4 rounded-xl bg-white text-[#7c3aed] font-bold text-lg shadow-xl hover:bg-[#f7f3ff] transition-all"
          >
            Criar Conta Gratuita
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-xs text-[#a08fb0]">
        <p>Roda da Vida App · Autoconhecimento e Metas</p>
      </footer>
    </div>
  )
}
