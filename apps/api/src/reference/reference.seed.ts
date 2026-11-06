import type { PrismaClient } from '@prisma/client';

interface SeedPerson {
  readonly nip: string;
  readonly nama: string;
  readonly email: string;
  readonly positionCode: string;
}

const PEOPLE: readonly SeedPerson[] = [
  { nip: '197001012000031001', nama: 'Camat Tamalate', email: 'camat@tamalate.go.id', positionCode: 'CAMAT' },
  { nip: '197501012000031002', nama: 'Sekretaris Camat', email: 'sekretaris@tamalate.go.id', positionCode: 'SEKCAM' },
  { nip: '198001012005011003', nama: 'Kasubbag Umum dan Kepegawaian', email: 'kasubag@tamalate.go.id', positionCode: 'KASUBAG' },
  { nip: '198501012010011004', nama: 'Kepala Seksi Pemerintahan', email: 'kasi.pem@tamalate.go.id', positionCode: 'KASI' },
  { nip: '199001012015011005', nama: 'Pegawai Pelaksana', email: 'pelaksana@tamalate.go.id', positionCode: 'STAF' },
  { nip: '199201012018011006', nama: 'Pegawai Pelaksana Dua', email: 'pelaksana2@tamalate.go.id', positionCode: 'STAF' },
];

const POSITIONS: readonly { code: string; nama: string; level: string; order: number }[] = [
  { code: 'CAMAT', nama: 'Camat', level: 'CAMAT', order: 1 },
  { code: 'SEKCAM', nama: 'Sekretaris Camat', level: 'SEKCAM', order: 2 },
  { code: 'KASUBAG', nama: 'Kasubbag Umum dan Kepegawaian', level: 'KASUBAG', order: 3 },
  { code: 'KASI', nama: 'Kepala Seksi', level: 'KASI', order: 4 },
  { code: 'STAF', nama: 'Staf Pelaksana', level: 'STAF', order: 5 },
];

export async function seedReference(prisma: PrismaClient): Promise<number> {
  const positions = new Map<string, string>();
  for (const p of POSITIONS) {
    const row = await prisma.position.upsert({
      where: { code: p.code },
      update: { nama: p.nama, level: p.level, displayOrder: p.order },
      create: { code: p.code, nama: p.nama, level: p.level, displayOrder: p.order },
    });
    positions.set(p.code, row.id);
  }

  for (const person of PEOPLE) {
    const row = await prisma.person.upsert({
      where: { nip: person.nip },
      update: { nama: person.nama, email: person.email },
      create: { nip: person.nip, nama: person.nama, email: person.email },
    });
    const positionId = positions.get(person.positionCode);
    if (!positionId) continue;
    const existing = await prisma.assignment.findFirst({
      where: { personId: row.id, positionId, validTo: null },
    });
    if (!existing) {
      await prisma.assignment.create({
        data: { personId: row.id, positionId, validFrom: new Date('2024-01-02T00:00:00Z') },
      });
    }
  }

  return PEOPLE.length;
}
