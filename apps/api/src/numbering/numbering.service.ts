import { Injectable } from '@nestjs/common';
import { PrismaService } from '../platform/prisma/prisma.service';

export interface AllocationResult {
  scopeKey: string;
  value: number;
  formatted: string;
}

@Injectable()
export class NumberingService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Alokasi atomik. Satu statement UPDATE ... RETURNING, tidak ada read-modify-write.
   * INSERT ON CONFLICT memastikan baris scope ada sebelum increment.
   */
  async allocate(scopeKey: string, prefix: string, width = 4): Promise<AllocationResult> {
    await this.prisma.$executeRaw`
      INSERT INTO number_sequence (id, scope_key, last_value, updated_at)
      VALUES (gen_random_uuid(), ${scopeKey}, 0, now())
      ON CONFLICT (scope_key) DO NOTHING
    `;

    const rows = await this.prisma.$queryRaw<Array<{ last_value: number }>>`
      UPDATE number_sequence
         SET last_value = last_value + 1, updated_at = now()
       WHERE scope_key = ${scopeKey}
      RETURNING last_value
    `;

    const value = rows[0]?.last_value ?? 0;
    const padded = String(value).padStart(width, '0');
    return { scopeKey, value, formatted: `${prefix}${padded}` };
  }

  async peek(scopeKey: string): Promise<number> {
    const row = await this.prisma.numberSequence.findUnique({ where: { scopeKey } });
    return row?.lastValue ?? 0;
  }
}
