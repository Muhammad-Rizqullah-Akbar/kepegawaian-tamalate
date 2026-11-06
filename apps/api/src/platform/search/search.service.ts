import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Meilisearch } from 'meilisearch';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService implements OnModuleInit {
  private readonly logger = new Logger(SearchService.name);
  public readonly client: Meilisearch;

  constructor(private readonly prisma: PrismaService) {
    const host = process.env.MEILISEARCH_URL ?? 'http://127.0.0.1:7700';
    const apiKey = process.env.MEILISEARCH_API_KEY ?? 'tamalate-meili-master-key-2026';
    this.client = new Meilisearch({ host, apiKey });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.syncPersonsIndex();
    } catch (err) {
      this.logger.warn(`Meilisearch initial sync deferred: ${(err as Error).message}`);
    }
  }

  async syncPersonsIndex(): Promise<{ indexed: number }> {
    const persons = await this.prisma.person.findMany({
      include: {
        assignments: {
          where: { validTo: null },
          include: { position: true },
        },
      },
    });

    const docs = persons.map((p) => ({
      id: p.id,
      nip: p.nip,
      nama: p.nama,
      email: p.email,
      positions: p.assignments.map((a) => a.position.nama),
      levels: p.assignments.map((a) => a.position.level),
    }));

    const index = this.client.index('persons');
    await index.updateFilterableAttributes(['levels']);
    await index.updateSearchableAttributes(['nama', 'nip', 'positions', 'email']);
    if (docs.length > 0) {
      await index.addDocuments(docs, { primaryKey: 'id' });
    }
    return { indexed: docs.length };
  }

  async searchPersons(query: string, limit = 20) {
    const index = this.client.index('persons');
    return index.search(query, { limit });
  }

  async checkHealth(): Promise<{ ok: boolean; status?: string; indexes?: number; error?: string }> {
    try {
      const health = await this.client.health();
      const indexes = await this.client.getIndexes();
      return {
        ok: health.status === 'available',
        status: health.status,
        indexes: indexes.results.length,
      };
    } catch (err) {
      return { ok: false, error: (err as Error).message };
    }
  }
}
