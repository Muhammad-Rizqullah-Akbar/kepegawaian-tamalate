import { PrismaClient } from '@prisma/client';
import { seedCatalog } from '../src/submissions/seed-catalog';
import { seedReference } from '../src/reference/reference.seed';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const sops = await seedCatalog(prisma);
  const persons = await seedReference(prisma);
  console.log('SEED_OK sop=' + sops + ' person=' + persons);
}

main()
  .catch((e: unknown) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
