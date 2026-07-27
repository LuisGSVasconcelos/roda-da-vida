// Prisma client singleton com driver adapter para Prisma 7
// Suporte nativo a Turso (authToken separado da URL)

import { PrismaClient } from '../generated/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createPrismaClient(): PrismaClient {
  const rawUrl = process.env.DATABASE_URL ?? 'file:./dev.db'

  // Se for Turso (libsql://), extrai authToken da query string
  if (rawUrl.startsWith('libsql://')) {
    const u = new URL(rawUrl)
    const authToken = u.searchParams.get('authToken') ?? undefined
    // Remove authToken da URL (passamos separado)
    u.searchParams.delete('authToken')
    const cleanUrl = u.toString().replace(/[?]$/, '')
    const adapter = new PrismaLibSql({ url: cleanUrl, authToken })
    return new PrismaClient({ adapter })
  }

  // SQLite local
  const adapter = new PrismaLibSql({ url: rawUrl })
  return new PrismaClient({ adapter })
}

export const prisma: PrismaClient = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

/** Helper para API routes — retorna o singleton do Prisma */
export function getDb() {
  return prisma
}
