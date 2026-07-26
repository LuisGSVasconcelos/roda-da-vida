import { prisma } from '../src/lib/prisma'

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

async function main() {
  console.log('🌱 Seeding default categories...')

  for (const cat of DEFAULT_CATEGORIES) {
    const existing = await prisma.category.findUnique({ where: { id: cat.id } })
    if (!existing) {
      await prisma.category.create({
        data: {
          id: cat.id,
          name: cat.name,
          color: cat.color,
          order: cat.order,
          isDefault: true,
        },
      })
      console.log(`  ✅ Created: ${cat.name}`)
    } else {
      console.log(`  ⏭️  Skipped (exists): ${cat.name}`)
    }
  }

  console.log('✅ Seed complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
