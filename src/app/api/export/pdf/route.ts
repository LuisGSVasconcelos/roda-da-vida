import { getDb } from '@/lib/prisma'
import { auth } from '@/lib/auth'

const { jsPDF } = require('jspdf')

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const url = new URL(req.url)
  const assessmentId = url.searchParams.get('assessmentId')

  if (!assessmentId) {
    return Response.json({ error: 'assessmentId é obrigatório' }, { status: 400 })
  }

  try {
    const prisma = await getDb()
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        scores: {
          include: { category: true },
          orderBy: { category: { order: 'asc' } },
        },
        goals: {
          include: { habits: true },
          orderBy: { priority: 'asc' },
        },
        user: { select: { name: true, email: true } },
      },
    })

    if (!assessment) {
      return Response.json({ error: 'Avaliação não encontrada' }, { status: 404 })
    }

    if (assessment.userId !== session.user.id) {
      return Response.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 20
    const contentWidth = pageWidth - margin * 2

    // ─── Cabeçalho ───────────────────────────────────────────────────
    doc.setFontSize(24)
    doc.setTextColor(124, 58, 237)
    doc.text('Roda da Vida', pageWidth / 2, 25, { align: 'center' })

    // Linha decorativa
    doc.setDrawColor(124, 58, 237)
    doc.setLineWidth(0.5)
    doc.line(margin, 30, pageWidth - margin, 30)

    doc.setFontSize(11)
    doc.setTextColor(45, 27, 61)
    doc.text(`Avaliacao: ${assessment.title}`, margin, 42)
    doc.text(`Data: ${new Date(assessment.createdAt).toLocaleDateString('pt-BR')}`, margin, 50)
    doc.text(`Nome: ${assessment.user.name || '-'}`, margin, 58)

    // ─── Media geral ───────────────────────────────────────────────
    const scores = assessment.scores
    const avg = scores.length > 0
      ? (scores.reduce((sum: number, s: any) => sum + s.value, 0) / scores.length).toFixed(1)
      : '-'

    doc.setFontSize(18)
    doc.setTextColor(124, 58, 237)
    doc.text(`Media Geral: ${avg}/10`, pageWidth / 2, 75, { align: 'center' })

    // ─── Tabela de resultados ──────────────────────────────────────
    doc.setFontSize(13)
    doc.setTextColor(45, 27, 61)
    doc.text('Resultados por Area', margin, 92)

    let y = 102

    // Cabecalho da tabela
    doc.setFillColor(247, 243, 255)
    doc.rect(margin, y - 5, contentWidth, 7, 'F')
    doc.setFontSize(9)
    doc.setTextColor(74, 44, 122)
    doc.text('Area', margin + 2, y)
    doc.text('Nota', margin + 130, y)
    doc.text('Status', margin + 150, y)
    y += 10

    // Linhas
    doc.setFontSize(9)
    scores.forEach((s: any) => {
      const statusText = s.value >= 7 ? 'Bom' : s.value >= 4 ? 'Atencao' : 'Critico'
      const statusColor = s.value >= 7 ? [16, 185, 129] : s.value >= 4 ? [245, 158, 11] : [239, 68, 68]

      doc.setTextColor(45, 27, 61)
      doc.text(s.category.name, margin + 2, y)

      doc.setTextColor(74, 44, 122)
      doc.text(`${s.value}/10`, margin + 130, y)

      doc.setTextColor(statusColor[0], statusColor[1], statusColor[2])
      doc.text(statusText, margin + 150, y)

      y += 6

      // Anotacoes
      if (s.reflectionNotes) {
        doc.setTextColor(107, 91, 123)
        doc.setFontSize(8)
        doc.text(`Obs: ${s.reflectionNotes}`, margin + 5, y)
        y += 4
        doc.setFontSize(9)
      }

      if (y > 265) {
        doc.addPage()
        y = 20
      }
    })

    // ─── Metas ─────────────────────────────────────────────────────
    if (assessment.goals.length > 0) {
      y += 8
      if (y > 250) { doc.addPage(); y = 20 }

      doc.setFontSize(13)
      doc.setTextColor(45, 27, 61)
      doc.text('Plano de Acao (5W2H)', margin, y)
      y += 10

      assessment.goals.forEach((goal: any, gi: number) => {
        doc.setFontSize(10)
        doc.setTextColor(45, 27, 61)
        doc.text(`${gi + 1}. ${goal.what}${goal.completed ? ' (Concluida)' : ''}`, margin + 2, y)
        y += 6

        doc.setFontSize(8)
        doc.setTextColor(107, 91, 123)
        const items: string[] = []
        if (goal.why) items.push(`Por que: ${goal.why}`)
        if (goal.when) items.push(`Quando: ${goal.when}`)
        if (goal.how) items.push(`Como: ${goal.how}`)
        if (goal.where) items.push(`Onde: ${goal.where}`)
        if (goal.who) items.push(`Quem: ${goal.who}`)
        if (goal.cost) items.push(`Custo: ${goal.cost}`)

        items.forEach((item) => {
          doc.text(`   - ${item}`, margin + 5, y)
          y += 4
        })

        // Habitos
        if (goal.habits && goal.habits.length > 0) {
          doc.setTextColor(124, 58, 237)
          doc.text('   Habitos:', margin + 5, y)
          y += 4
          doc.setTextColor(107, 91, 123)
          goal.habits.forEach((habit: any) => {
            const habitStr = `${habit.action}${habit.time ? ` as ${habit.time}` : ''}${habit.place ? ` em ${habit.place}` : ''}`
            doc.text(`     - ${habitStr} (${habit.streak} dias consecutivos)`, margin + 5, y)
            y += 4
          })
        }

        y += 3
        if (y > 260) { doc.addPage(); y = 20 }
      })
    }

    // ─── Rodape ────────────────────────────────────────────────────
    doc.setFontSize(8)
    doc.setTextColor(160, 143, 176)
    const footer = `Gerado por Roda da Vida App em ${new Date().toLocaleString('pt-BR')}`
    doc.text(footer, pageWidth / 2, 288, { align: 'center' })

    // Gerar buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))

    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="roda-da-vida-${assessmentId}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Erro ao gerar PDF:', error)
    return Response.json({ error: 'Erro ao gerar PDF' }, { status: 500 })
  }
}
