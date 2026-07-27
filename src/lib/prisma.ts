// Prisma client singleton com driver adapter para Prisma 7
// Suporte a Turso: DATABASE_URL + TURSO_AUTH_TOKEN como env vars separadas

import { PrismaClient } from '../generated/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL ?? 'file:./dev.db'

  if (url.startsWith('libsql://')) {
    const authToken = process.env.TURSO_AUTH_TOKEN
    // Tenta extrair da query string como fallback
    const qsToken = !authToken && url.includes('?authToken=')
      ? url.slice(url.indexOf('?authToken=') + '?authToken='.length).split('&')[0]
      : undefined

    const adapter = new PrismaLibSql({
      url: qsToken ? url.split('?')[0] : url,
      authToken: authToken || qsToken,
    })
    return new PrismaClient({ adapter })
  }

  const adapter = new PrismaLibSql({ url })
  return new PrismaClient({ adapter })
}

export const prisma: PrismaClient = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

/** Helper para API routes — retorna o singleton do Prisma */
export function getDb() {
  return prisma
}
