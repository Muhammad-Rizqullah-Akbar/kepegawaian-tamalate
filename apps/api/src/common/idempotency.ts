import { ConflictException } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../platform/prisma/prisma.service';

// Tingkat 2: idempotency key, kunci sama plus payload identik mengembalikan hasil sama.
export interface IdempotencyRecord {
  key: string;
  payloadHash: string;
  result: unknown;
  expiresAt: Date;
}

export function hashPayload(payload: unknown): string {
  return createHash('sha256').update(JSON.stringify(payload ?? {})).digest('hex');
}

export async function executeIdempotent<T>(
  prisma: PrismaService,
  key: string | undefined,
  payload: unknown,
  handler: () => Promise<T>,
  ttlSeconds = 86400,
): Promise<T> {
  if (!key || !key.trim()) {
    return handler();
  }
  const normalizedKey = key.trim();
  const payloadHash = hashPayload(payload);

  const existing = await prisma.idempotencyKey.findUnique({
    where: { key: normalizedKey },
  });

  if (existing) {
    if (existing.payloadHash !== payloadHash) {
      throw new ConflictException({
        code: 'IDEMPOTENCY_PAYLOAD_MISMATCH',
        message: 'Idempotency-Key yang sama dikirim dengan muatan berbeda',
      });
    }
    return existing.response as T;
  }

  const result = await handler();
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

  await prisma.idempotencyKey.create({
    data: {
      key: normalizedKey,
      payloadHash,
      response: result as Prisma.InputJsonValue,
      expiresAt,
    },
  });

  return result;
}
