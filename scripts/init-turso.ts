/**
 * Inicialização do banco Turso — schema + seed
 * Usa @libsql/client diretamente (DDL não funciona via $executeRawUnsafe)
 * Roda uma vez na primeira inicialização do Render
 */

import { createClient } from '@libsql/client'
import { PrismaClient } from '../src/generated/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

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

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "passwordHash" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'INDIVIDUAL',
  "image" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS "Category" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "color" TEXT NOT NULL DEFAULT '#6366f1',
  "icon" TEXT NOT NULL DEFAULT 'circle',
  "order" INTEGER NOT NULL DEFAULT 0,
  "isDefault" INTEGER NOT NULL DEFAULT 0,
  "userId" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  FOREIGN KEY ("userId") REFERENCES "User"("id")
);

CREATE TABLE IF NOT EXISTS "Assessment" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "clientId" TEXT,
  "title" TEXT NOT NULL DEFAULT 'Avaliação',
  "notes" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  FOREIGN KEY ("userId") REFERENCES "User"("id"),
  FOREIGN KEY ("clientId") REFERENCES "Client"("id")
);

CREATE TABLE IF NOT EXISTS "Score" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "assessmentId" TEXT NOT NULL,
  "categoryId" TEXT NOT NULL,
  "value" INTEGER NOT NULL DEFAULT 5,
  "reflectionNotes" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE CASCADE,
  FOREIGN KEY ("categoryId") REFERENCES "Category"("id"),
  UNIQUE ("assessmentId", "categoryId")
);

CREATE TABLE IF NOT EXISTS "Goal" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "assessmentId" TEXT,
  "userId" TEXT NOT NULL,
  "clientId" TEXT,
  "area" TEXT NOT NULL,
  "what" TEXT NOT NULL,
  "why" TEXT,
  "where" TEXT,
  "when" TEXT,
  "who" TEXT,
  "how" TEXT,
  "cost" TEXT,
  "priority" INTEGER NOT NULL DEFAULT 1,
  "completed" INTEGER NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  FOREIGN KEY ("userId") REFERENCES "User"("id"),
  FOREIGN KEY ("clientId") REFERENCES "Client"("id"),
  FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id")
);

CREATE TABLE IF NOT EXISTS "Habit" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "goalId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "time" TEXT,
  "place" TEXT,
  "streak" INTEGER NOT NULL DEFAULT 0,
  "bestStreak" INTEGER NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "HabitLog" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "habitId" TEXT NOT NULL,
  "date" DATETIME NOT NULL,
  "completed" INTEGER NOT NULL DEFAULT 1,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("habitId") REFERENCES "Habit"("id") ON DELETE CASCADE,
  UNIQUE ("habitId", "date")
);

CREATE TABLE IF NOT EXISTS "Client" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "professionalId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT,
  "phone" TEXT,
  "notes" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  FOREIGN KEY ("professionalId") REFERENCES "User"("id")
);
`

async function main() {
  const url = process.env.DATABASE_URL
  if (!url || url.startsWith('file:')) {
    console.log('ℹ️  DATABASE_URL local — pulando init Turso')
    return
  }

  console.log('🚀 Inicializando banco Turso...')

  // ─── 1. Schema: usar libsql client direto (DDL) ──────────────────
  const sqlClient = createClient({ url })
  try {
    console.log('📦 Criando tabelas...')

    // Executa cada statement separadamente
    const statements = SCHEMA_SQL.split(';').map(s => s.trim()).filter(s => s.length > 0)
    for (const stmt of statements) {
      await sqlClient.execute(stmt + ';')
    }

    console.log('✅ Tabelas criadas')
  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error)
    process.exit(1)
  } finally {
    sqlClient.close()
  }

  // ─── 2. Seed: usar Prisma Client (CRUD normal) ───────────────────
  const adapter = new PrismaLibSql({ url })
  const prisma = new PrismaClient({ adapter })

  try {
    console.log('🌱 Seedando categorias...')
    for (const cat of DEFAULT_CATEGORIES) {
      const existing = await prisma.category.findUnique({ where: { id: cat.id } })
      if (!existing) {
        await prisma.category.create({ data: { ...cat, isDefault: true } })
        console.log(`  ✅ ${cat.name}`)
      } else {
        console.log(`  ⏭️  Existe: ${cat.name}`)
      }
    }
    console.log('✅ Seed completo!')
  } catch (error) {
    console.error('❌ Erro no seed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
