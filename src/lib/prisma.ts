// Prisma client singleton com driver adapter para Prisma 7
// Inclui inicialização automática do schema para Turso

import { PrismaClient } from '../generated/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient; initPromise: Promise<void> | null }

const DEFAULT_CATEGORIES = [
  { id: 'saude',           name: 'Saúde e Disposição',           color: '#EF4444', order: 0 },
  { id: 'intelectual',     name: 'Desenvolvimento Intelectual',   color: '#F97316', order: 1 },
  { id: 'emocional',       name: 'Equilíbrio Emocional',           color: '#EAB308', order: 2 },
  { id: 'realizacao',      name: 'Realização e Propósito',         color: '#3B82F6', order: 3 },
  { id: 'financas',        name: 'Recursos Financeiros',           color: '#06B6D4', order: 4 },
  { id: 'contribuicao',    name: 'Contribuição Social',            color: '#14B8A6', order: 5 },
  { id: 'familia',         name: 'Família',                        color: '#8B5CF6', order: 6 },
  { id: 'amoroso',         name: 'Relacionamento Amoroso',         color: '#EC4899', order: 7 },
  { id: 'social',          name: 'Vida Social e Amizades',         color: '#F59E0B', order: 8 },
  { id: 'lazer',           name: 'Hobbies e Lazer',                color: '#34D399', order: 9 },
  { id: 'plenitude',       name: 'Plenitude e Felicidade',         color: '#F472B6', order: 10 },
  { id: 'espiritualidade', name: 'Espiritualidade',                color: '#A78BFA', order: 11 },
]

async function initializeDatabase(prismaInit: PrismaClient) {
  console.log('[DB] 🚀 Inicializando banco...')

  // Cria tabelas via $executeRawUnsafe (funciona com libSQL/Turso)
  const tables = [
    `CREATE TABLE IF NOT EXISTS "User" ("id" TEXT NOT NULL PRIMARY KEY,"name" TEXT NOT NULL,"email" TEXT NOT NULL UNIQUE,"passwordHash" TEXT NOT NULL,"role" TEXT NOT NULL DEFAULT 'INDIVIDUAL',"image" TEXT,"createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" DATETIME NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS "Category" ("id" TEXT NOT NULL PRIMARY KEY,"name" TEXT NOT NULL,"description" TEXT,"color" TEXT NOT NULL DEFAULT '#6366f1',"icon" TEXT NOT NULL DEFAULT 'circle',"order" INTEGER NOT NULL DEFAULT 0,"isDefault" INTEGER NOT NULL DEFAULT 0,"userId" TEXT,"createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" DATETIME NOT NULL,FOREIGN KEY ("userId") REFERENCES "User"("id"))`,
    `CREATE TABLE IF NOT EXISTS "Assessment" ("id" TEXT NOT NULL PRIMARY KEY,"userId" TEXT NOT NULL,"clientId" TEXT,"title" TEXT NOT NULL DEFAULT 'Avaliação',"notes" TEXT,"createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" DATETIME NOT NULL,FOREIGN KEY ("userId") REFERENCES "User"("id"),FOREIGN KEY ("clientId") REFERENCES "Client"("id"))`,
    `CREATE TABLE IF NOT EXISTS "Score" ("id" TEXT NOT NULL PRIMARY KEY,"assessmentId" TEXT NOT NULL,"categoryId" TEXT NOT NULL,"value" INTEGER NOT NULL DEFAULT 5,"reflectionNotes" TEXT,"createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE CASCADE,FOREIGN KEY ("categoryId") REFERENCES "Category"("id"),UNIQUE ("assessmentId","categoryId"))`,
    `CREATE TABLE IF NOT EXISTS "Goal" ("id" TEXT NOT NULL PRIMARY KEY,"assessmentId" TEXT,"userId" TEXT NOT NULL,"clientId" TEXT,"area" TEXT NOT NULL,"what" TEXT NOT NULL,"why" TEXT,"where" TEXT,"when" TEXT,"who" TEXT,"how" TEXT,"cost" TEXT,"priority" INTEGER NOT NULL DEFAULT 1,"completed" INTEGER NOT NULL DEFAULT 0,"createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" DATETIME NOT NULL,FOREIGN KEY ("userId") REFERENCES "User"("id"),FOREIGN KEY ("clientId") REFERENCES "Client"("id"),FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id"))`,
    `CREATE TABLE IF NOT EXISTS "Habit" ("id" TEXT NOT NULL PRIMARY KEY,"goalId" TEXT NOT NULL,"action" TEXT NOT NULL,"time" TEXT,"place" TEXT,"streak" INTEGER NOT NULL DEFAULT 0,"bestStreak" INTEGER NOT NULL DEFAULT 0,"createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE CASCADE)`,
    `CREATE TABLE IF NOT EXISTS "HabitLog" ("id" TEXT NOT NULL PRIMARY KEY,"habitId" TEXT NOT NULL,"date" DATETIME NOT NULL,"completed" INTEGER NOT NULL DEFAULT 1,"createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,FOREIGN KEY ("habitId") REFERENCES "Habit"("id") ON DELETE CASCADE,UNIQUE ("habitId","date"))`,
    `CREATE TABLE IF NOT EXISTS "Client" ("id" TEXT NOT NULL PRIMARY KEY,"professionalId" TEXT NOT NULL,"name" TEXT NOT NULL,"email" TEXT,"phone" TEXT,"notes" TEXT,"createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" DATETIME NOT NULL,FOREIGN KEY ("professionalId") REFERENCES "User"("id"))`,
  ]

  for (const sql of tables) {
    await prismaInit.$executeRawUnsafe(sql)
  }
  console.log('[DB] ✅ Tabelas criadas')

  // Seed categorias
  for (const cat of DEFAULT_CATEGORIES) {
    const existing = await prismaInit.category.findUnique({ where: { id: cat.id } })
    if (!existing) {
      await prismaInit.category.create({ data: { ...cat, isDefault: true } })
    }
  }
  console.log('[DB] ✅ Seed completo')
}

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL ?? 'file:./dev.db'

  const adapter = new PrismaLibSql({ url })
  const client = new PrismaClient({ adapter })

  // Dispara init em background (primeira query espera via await no getDb)
  if (!globalForPrisma.initPromise && !url.startsWith('file:')) {
    globalForPrisma.initPromise = initializeDatabase(client).catch(err => {
      console.error('[DB] ❌ Init failed:', err)
      globalForPrisma.initPromise = null
    })
  }

  return client
}

export const prisma: PrismaClient = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

/** Helper para API routes — retorna o singleton do Prisma */
export async function getDb(): Promise<PrismaClient> {
  if (globalForPrisma.initPromise) {
    await globalForPrisma.initPromise
  }
  return prisma
}
