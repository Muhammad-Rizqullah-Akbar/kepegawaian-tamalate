import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_PORT: z.coerce.number().int().positive().default(4000),
  WEB_PORT: z.coerce.number().int().positive().default(3100),
  DATABASE_URL: z.string().url(),
  PGBOUNCER_URL: z.string().optional(),
  REDIS_URL: z.string().default('redis://127.0.0.1:6379/0'),
  S3_ENDPOINT: z.string().default('http://127.0.0.1:9000'),
  S3_ACCESS_KEY: z.string().default('minioadmin'),
  S3_SECRET_KEY: z.string().default('minioadmin123'),
  S3_BUCKET_ARSIP: z.string().default('arsip'),
  S3_BUCKET_DOSSIER: z.string().default('dossier'),
  MEILISEARCH_URL: z.string().default('http://127.0.0.1:7700'),
  MEILISEARCH_API_KEY: z.string().default('tamalate-meili-master-key-2026'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
});

export type Env = z.infer<typeof EnvSchema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const parsed = EnvSchema.safeParse(source);
  if (!parsed.success) {
    const detail = parsed.error.issues.map((i) => i.path.join('.') + ': ' + i.message).join('; ');
    throw new Error('Konfigurasi lingkungan tidak valid: ' + detail);
  }
  return parsed.data;
}
