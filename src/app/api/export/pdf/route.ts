import { getDb } from '@/lib/prisma'
// API de exportação PDF — gera PDF com resultado da avaliação

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

    // Cabeçalho
    doc.setFontSize(22)
    doc.setTextColor(124, 58, 237)
    doc.text('✦ Roda da Vida', 105, 25, { align: 'center' })

    doc.setFontSize(11)
    doc.setTextColor(45, 27, 61)
    doc.text(`Avaliação: ${assessment.title}`, 20, 42)
    doc.text(`Data: ${new Date(assessment.createdAt).toLocaleDateString('pt-BR')}`, 20, 50)
    doc.text(`Nome: ${assessment.user.name || '—'}`, 20, 58)

    // Média geral
    const scores = assessment.scores
    const avg = scores.length > 0
      ? (scores.reduce((sum: number, s: any) => sum + s.value, 0) / scores.length).toFixed(1)
      : '—'

    doc.setFontSize(16)
    doc.setTextColor(124, 58, 237)
    doc.text(`Média Geral: ${avg}/10`, 105, 72, { align: 'center' })

    // Tabela de resultados
    doc.setFontSize(13)
    doc.setTextColor(45, 27, 61)
    doc.text('Resultados por Área', 20, 88)

    let y = 98
    doc.setFontSize(10)

    // Cabeçalho da tabela
    doc.setFillColor(247, 243, 255)
    doc.rect(20, y - 5, 170, 7, 'F')
    doc.setTextColor(74, 44, 122)
    doc.text('Área', 25, y)
    doc.text('Nota', 160, y)
    doc.text('Status', 175, y)
    y += 10

    scores.forEach((s: any) => {
      const status = s.value >= 7 ? '✅' : s.value >= 4 ? '⚠️' : '❌'
      doc.setTextColor(45, 27, 61)
      doc.text(s.category.name, 25, y)
      doc.text(`${s.value}/10`, 160, y)
      doc.text(status, 175, y)
      y += 7

      if (s.reflectionNotes) {
        doc.setFontSize(8)
        doc.setTextColor(107, 91, 123)
        doc.text(`   📝 ${s.reflectionNotes}`, 25, y)
        y += 5
        doc.setFontSize(10)
      }

      if (y > 270) {
        doc.addPage()
        y = 20
      }
    })

    // Metas
    if (assessment.goals.length > 0) {
      y += 10
      if (y > 250) { doc.addPage(); y = 20 }

      doc.setFontSize(13)
      doc.setTextColor(45, 27, 61)
      doc.text('Plano de Ação (5W2H)', 20, y)
      y += 10

      assessment.goals.forEach((goal: any) => {
        doc.setFontSize(10)
        doc.setTextColor(45, 27, 61)
        doc.text(`🎯 ${goal.what}`, 25, y); y += 6
        doc.setFontSize(8)
        doc.setTextColor(107, 91, 123)
        if (goal.why) { doc.text(`   💡 Por quê: ${goal.why}`, 25, y); y += 5 }
        if (goal.when) { doc.text(`   📅 Quando: ${goal.when}`, 25, y); y += 5 }
        if (goal.how) { doc.text(`   🔧 Como: ${goal.how}`, 25, y); y += 5 }
        if (goal.cost) { doc.text(`   💰 Custo: ${goal.cost}`, 25, y); y += 5 }
        y += 3

        // Hábitos da meta
        if (goal.habits && goal.habits.length > 0) {
          doc.setFontSize(8)
          doc.setTextColor(163, 120, 250)
          goal.habits.forEach((habit: any) => {
            doc.text(`   🔥 ${habit.action}${habit.time ? ` às ${habit.time}` : ''}${habit.place ? ` em ${habit.place}` : ''} (streak: ${habit.streak} dias)`, 25, y)
            y += 4
          })
        }

        y += 3
        if (y > 270) { doc.addPage(); y = 20 }
      })
    }

    // Rodapé
    doc.setFontSize(8)
    doc.setTextColor(160, 143, 176)
    doc.text('Gerado por Roda da Vida App', 105, 285, { align: 'center' })
    doc.text(new Date().toLocaleString('pt-BR'), 105, 291, { align: 'center' })

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
