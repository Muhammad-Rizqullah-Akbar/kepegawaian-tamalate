import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import { Queue } from 'bullmq';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly log = new Logger(RedisService.name);
  public readonly client: Redis;
  public readonly outboxQueue: Queue;
  public readonly notificationQueue: Queue;

  constructor() {
    const url = process.env.REDIS_URL ?? 'redis://127.0.0.1:6379/0';
    this.client = new Redis(url, {
      maxRetriesPerRequest: null,
      lazyConnect: true,
    });
    const parsed = new URL(url);
    const connection = {
      host: parsed.hostname || '127.0.0.1',
      port: Number(parsed.port || 6379),
    };
    this.outboxQueue = new Queue('tamalate-outbox', { connection });
    this.notificationQueue = new Queue('tamalate-notifications', { connection });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.client.connect();
      this.log.log('Redis 8 & BullMQ queues terhubung');
    } catch (err) {
      this.log.warn('Redis gagal connect saat startup: ' + (err instanceof Error ? err.message : String(err)));
    }
  }

  async ping(): Promise<{ ok: boolean; latencyMs: number; queues: readonly string[] }> {
    const start = Date.now();
    try {
      const pong = await this.client.ping();
      return {
        ok: pong === 'PONG',
        latencyMs: Date.now() - start,
        queues: ['tamalate-outbox', 'tamalate-notifications'],
      };
    } catch {
      return { ok: false, latencyMs: Date.now() - start, queues: [] };
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.outboxQueue.close().catch(() => undefined);
    await this.notificationQueue.close().catch(() => undefined);
    await this.client.quit().catch(() => undefined);
  }
}
