import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { PrismaService } from '../platform/prisma/prisma.service';
import { findBook, type CreateEntryBody } from './registers.schema';

function hash(prev: string, parts: readonly string[]): string {
  return createHash('sha256').update([prev, ...parts].join('|'), 'utf8').digest('hex');
}

@Injectable()
export class RegistersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(bookCode: string, limit = 50, offset = 0) {
    const book = findBook(bookCode);
    if (!book) throw new NotFoundException('Buku ' + bookCode + ' tidak dikenal');
    const where = { bookCode: book.code };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.registerEntry.findMany({
        where, orderBy: [{ entryDate: 'desc' }, { entryNo: 'desc' }], take: limit, skip: offset,
      }),
      this.prisma.registerEntry.count({ where }),
    ]);
    return { book, items, total, limit, offset };
  }

  async get(bookCode: string, id: string) {
    const row = await this.prisma.registerEntry.findFirst({ where: { bookCode: bookCode.toUpperCase(), id } });
    if (!row) throw new NotFoundException('Entri tidak ditemukan');
    return row;
  }

  async create(bookCode: string, body: CreateEntryBody, actorId: string) {
    const book = findBook(bookCode);
    if (!book) throw new NotFoundException('Buku ' + bookCode + ' tidak dikenal');
    if (!book.active) throw new BadRequestException('Buku ' + book.code + ' berstatus ditunda');

    const now = new Date();
    const entryDate = new Date(body.entryDate + 'T00:00:00.000Z');
    if (Number.isNaN(entryDate.getTime())) throw new BadRequestException('entryDate tidak valid');

    return this.prisma.$transaction(async (tx) => {
      const row = await tx.registerEntry.create({
        data: {
          bookCode: book.code,
          entryNo: body.entryNo,
          entryDate,
          subjectType: book.subjectType,
          title: body.title,
          payload: body.payload as object,
          createdBy: actorId,
        },
      });

      const last = await tx.auditEntry.findFirst({
        where: { subjectType: book.subjectType, subjectId: row.id },
        orderBy: { createdAt: 'desc' },
        select: { ownHash: true },
      });
      const prev = last?.ownHash ?? '0'.repeat(64);
      const at = now.toISOString();
      const own = hash(prev, [book.subjectType, row.id, 'REGISTER_CREATE', actorId, book.code, 'null', 'RECORDED', at]);

      await tx.auditEntry.create({
        data: {
          partitionDate: new Date(now.toISOString().slice(0, 10)),
          subjectType: book.subjectType,
          subjectId: row.id,
          action: 'REGISTER_CREATE',
          actorPersonId: actorId,
          onBehalfOfId: null,
          basis: book.code,
          fromState: null,
          toState: 'RECORDED',
          policySnapshot: { bookCode: book.code, entryNo: body.entryNo },
          prevHash: prev,
          ownHash: own,
          createdAt: now,
        },
      });

      return row;
    });
  }
}
