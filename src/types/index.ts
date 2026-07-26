// ─── Tipos para a Roda da Vida ──────────────────────────────────────────────
// Extraídos e adaptados do roda_vida_app_v009.html

export interface CategoryData {
  id: string
  label: string
  color: string
  pillar: string
  questions: string[]
}

export interface PillarGroup {
  name: string
  categories: CategoryData[]
}

export interface ScoreEntry {
  categoryId: string
  value: number
  reflectionNotes?: string
}

export interface AssessmentData {
  id: string
  title: string
  nome: string
  data: string
  timestamp: number
  scores: ScoreEntry[]
  media: number
}

export interface HistoryEntry {
  id: number
  nome: string
  data: string
  timestamp: number
  valores: Record<string, number>
  media: number
}

export interface RadarRenderOptions {
  width: number
  height: number
  scale?: number
  categories: CategoryData[]
  values: Record<string, number>
  maxValue?: number
}

export interface ExportImageOptions {
  fileName?: string
}

export interface Goal5W2H {
  id: string
  area: string
  what: string
  why?: string
  where?: string
  when?: string
  who?: string
  how?: string
  cost?: string
  priority: number
  completed: boolean
}

export interface HabitData {
  id: string
  goalId: string
  action: string
  time?: string
  place?: string
  streak: number
  bestStreak: number
}
