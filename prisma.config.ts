// Prisma config — necessário para CLI (prisma db push, generate)
// Em produção (Render), DATABASE_URL vem das env vars do dashboard
import "dotenv/config"
import { defineConfig } from "prisma/config"

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"] ?? "file:./dev.db",
  },
})
