import { Injectable } from '@nestjs/common';
import { PrismaService } from '../platform/prisma/prisma.service';

export interface PersonView {
  readonly id: string;
  readonly nip: string;
  readonly nama: string;
  readonly jabatan: string | null;
  readonly unitKerja: string | null;
}

export interface PositionView {
  readonly id: string;
  readonly code: string;
  readonly nama: string;
  readonly level: string;
}

@Injectable()
export class ReferenceService {
  constructor(private readonly prisma: PrismaService) {}

  async persons(): Promise<readonly PersonView[]> {
    const rows = await this.prisma.person.findMany({
      orderBy: { nama: 'asc' },
      take: 200,
      include: {
        assignments: {
          where: { validTo: null },
          include: { position: true },
          take: 1,
        },
      },
    });
    return rows.map((p) => {
      const active = p.assignments[0];
      return {
        id: p.id,
        nip: p.nip,
        nama: p.nama,
        jabatan: active ? active.position.nama : null,
        unitKerja: null,
      };
    });
  }

  async positions(): Promise<readonly PositionView[]> {
    const rows = await this.prisma.position.findMany({ orderBy: { displayOrder: 'asc' } });
    return rows.map((p) => ({ id: p.id, code: p.code, nama: p.nama, level: p.level }));
  }
}
