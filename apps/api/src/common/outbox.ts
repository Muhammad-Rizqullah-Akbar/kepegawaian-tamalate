import { Prisma } from '@prisma/client';
import { PrismaService } from '../platform/prisma/prisma.service';
import { RedisService } from '../platform/redis/redis.service';

// Tingkat 2: transactional outbox, ditulis di transaksi yang sama dengan perubahan domain.
export interface OutboxRow {
  id: string;
  topic: string;
  subjectType: string;
  subjectId: string;
  payload: unknown;
  createdAt: Date;
}

export async function enqueueOutboxEvent(
  tx: Prisma.TransactionClient | PrismaService,
  params: {
    topic: string;
    subjectType: string;
    subjectId: string;
    payload: Prisma.InputJsonValue;
  },
  redis?: RedisService,
): Promise<OutboxRow> {
  const row = await tx.outboxEvent.create({
    data: {
      topic: params.topic,
      subjectType: params.subjectType,
      subjectId: params.subjectId,
      payload: params.payload,
      status: 'PENDING',
    },
  });

  if (redis) {
    try {
      await redis.outboxQueue.add(
        params.topic,
        {
          outboxId: row.id,
          topic: params.topic,
          subjectType: params.subjectType,
          subjectId: params.subjectId,
          payload: params.payload,
        },
        { jobId: row.id },
      );
    } catch {
      // Tetap aman di tabel outbox_event untuk diproses poller jika Redis sempat terputus
    }
  }

  return {
    id: row.id,
    topic: row.topic,
    subjectType: row.subjectType,
    subjectId: row.subjectId,
    payload: row.payload,
    createdAt: row.createdAt,
  };
}
