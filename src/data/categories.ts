// ─── 12 Categorias da Roda da Vida ─────────────────────────────────────────
// Dados extraídos integralmente do roda_vida_app_v009.html
// Fonte única da verdade para o app

import type { CategoryData, PillarGroup } from '@/types'

export const DEFAULT_CATEGORIES: CategoryData[] = [
  {
    id: 'saude',
    label: 'Saúde e Disposição',
    color: '#EF4444',
    pillar: 'Pilar Pessoal',
    questions: [
      'Como estão meus níveis de energia e vitalidade no dia a dia?',
      'Tenho cuidado da alimentação, sono e atividade física de forma consistente?',
      'Estou atento aos exames preventivos e aos sinais do meu corpo?',
    ],
  },
  {
    id: 'intelectual',
    label: 'Desenvolvimento Intelectual',
    color: '#F97316',
    pillar: 'Pilar Pessoal',
    questions: [
      'Tenho buscado aprender coisas novas ou adquirir novas habilidades recentemente?',
      'O que tenho consumido (livros, cursos, conteúdos) está agregando conhecimento real?',
      'Estou aplicando o que aprendo para resolver problemas ou expandir minha visão de mundo?',
    ],
  },
  {
    id: 'emocional',
    label: 'Equilíbrio Emocional',
    color: '#EAB308',
    pillar: 'Pilar Pessoal',
    questions: [
      'Como reajo diante de situações de estresse, pressão ou imprevistos?',
      'Tenho clareza sobre minhas emoções e sei gerenciá-las sem reprimi-las?',
      'Sinto estabilidade e paz interior na maior parte dos meus dias?',
    ],
  },
  {
    id: 'realizacao',
    label: 'Realização e Propósito',
    color: '#3B82F6',
    pillar: 'Pilar Profissional',
    questions: [
      'O meu trabalho atual faz sentido para mim e está alinhado aos meus valores?',
      'Sinto orgulho e satisfação com os resultados do que produzo?',
      'Tenho clareza de onde quero chegar na minha carreira nos próximos anos?',
    ],
  },
  {
    id: 'financas',
    label: 'Recursos Financeiros',
    color: '#06B6D4',
    pillar: 'Pilar Profissional',
    questions: [
      'Minha renda atual supre minhas necessidades e permite planejar o futuro?',
      'Tenho controle claro sobre meus ganhos, gastos e investimentos?',
      'Possuo uma reserva de emergência e estabilidade financeira?',
    ],
  },
  {
    id: 'contribuicao',
    label: 'Contribuição Social',
    color: '#14B8A6',
    pillar: 'Pilar Profissional',
    questions: [
      'Como meu trabalho ou minhas ações impactam positivamente a vida de outras pessoas?',
      'Dedico tempo, conhecimento ou recursos para apoiar causas ou a comunidade?',
      'Sinto que estou fazendo a diferença no ambiente em que vivo?',
    ],
  },
  {
    id: 'familia',
    label: 'Família',
    color: '#8B5CF6',
    pillar: 'Pilar dos Relacionamentos',
    questions: [
      'Qual é a qualidade do tempo que dedico aos meus familiares mais próximos?',
      'Existe diálogo aberto, respeito e apoio mútuo nas minhas relações familiares?',
      'Há conflitos não resolvidos que precisam de perdão ou alinhamento?',
    ],
  },
  {
    id: 'amoroso',
    label: 'Relacionamento Amoroso',
    color: '#EC4899',
    pillar: 'Pilar dos Relacionamentos',
    questions: [
      'Sinto que há parceria, cumplicidade e comunicação transparente no relacionamento? (Se solteiro: estou bem resolvido comigo mesmo e aberto a conexões saudáveis?)',
      'Existe equilíbrio entre a individualidade e a vida a dois?',
      'Nos apoiamos mutuamente no crescimento pessoal e objetivos de vida?',
    ],
  },
  {
    id: 'social',
    label: 'Vida Social e Amizades',
    color: '#F59E0B',
    pillar: 'Pilar dos Relacionamentos',
    questions: [
      'Tenho amigos leais com quem posso contar nos momentos bons e difíceis?',
      'Minhas amizades me impulsionam para frente ou me drenam emocionalmente?',
      'Dedico tempo de qualidade para nutrir minhas conexões sociais?',
    ],
  },
  {
    id: 'lazer',
    label: 'Hobbies e Lazer',
    color: '#34D399',
    pillar: 'Pilar da Qualidade de Vida',
    questions: [
      'Reservo momentos na semana exclusivamente para relaxar e fazer o que gosto?',
      'Consigo me desligar do trabalho e das obrigações durante meu tempo livre?',
      'Tenho atividades prazerosas que não envolvam telas ou produtividade?',
    ],
  },
  {
    id: 'plenitude',
    label: 'Plenitude e Felicidade',
    color: '#F472B6',
    pillar: 'Pilar da Qualidade de Vida',
    questions: [
      'No geral, sinto gratidão e satisfação pela vida que estou construindo?',
      'Tenho um sentimento frequente de entusiasmo ao começar o dia?',
      'Consigo encontrar alegria nas pequenas coisas do cotidiano?',
    ],
  },
  {
    id: 'espiritualidade',
    label: 'Espiritualidade',
    color: '#A78BFA',
    pillar: 'Pilar da Qualidade de Vida',
    questions: [
      'Tenho clareza sobre meus princípios, ética e valores fundamentais?',
      'Pratico algo que me conecta com algo maior (fé, reflexão, meditação, propósito)?',
      'Sinto que minhas ações diárias estão em harmonia com minhas crenças?',
    ],
  },
]

/** Retorna as categorias agrupadas por pilar */
export function getPillarGroups(): PillarGroup[] {
  const groups: Record<string, CategoryData[]> = {}
  for (const cat of DEFAULT_CATEGORIES) {
    if (!groups[cat.pillar]) groups[cat.pillar] = []
    groups[cat.pillar].push(cat)
  }
  return Object.entries(groups).map(([name, categories]) => ({ name, categories }))
}

/** Retorna o número de categorias */
export function getCategoryCount(): number {
  return DEFAULT_CATEGORIES.length
}

/** Busca uma categoria por ID */
export function getCategoryById(id: string): CategoryData | undefined {
  return DEFAULT_CATEGORIES.find(c => c.id === id)
}

/** Retorna uma pergunta reflexiva aleatória de uma categoria */
export function getRandomQuestion(categoryId: string): string {
  const cat = getCategoryById(categoryId)
  if (!cat || cat.questions.length === 0) return ''
  return cat.questions[Math.floor(Math.random() * cat.questions.length)]
}

/** Retorna todas as perguntas de uma categoria */
export function getQuestions(categoryId: string): string[] {
  const cat = getCategoryById(categoryId)
  return cat?.questions ?? []
}

/** Calcula a média geral a partir de um mapa de valores */
export function calculateAverage(values: Record<string, number>): number {
  if (DEFAULT_CATEGORIES.length === 0) return 0
  const total = DEFAULT_CATEGORIES.reduce((sum, cat) => sum + (values[cat.id] ?? 0), 0)
  return total / DEFAULT_CATEGORIES.length
}

/** Mapa de cores por id de categoria (para uso em gráficos) */
export const CATEGORY_COLORS: Record<string, string> =
  Object.fromEntries(DEFAULT_CATEGORIES.map(c => [c.id, c.color]))

/** Lista de IDs das categorias na ordem padrão */
export const CATEGORY_IDS: string[] = DEFAULT_CATEGORIES.map(c => c.id)
