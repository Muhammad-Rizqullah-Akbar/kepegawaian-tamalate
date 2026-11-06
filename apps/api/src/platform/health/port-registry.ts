import * as net from 'node:net';

export interface PortEntry {
  port: number;
  service: string;
  layer: string;
  owner: 'tamalate-inner' | 'tamalate-dev' | 'host-reserved';
  protocol: 'tcp';
  host: string;
  description: string;
  requiredForReady: boolean;
}

export interface PortProbeResult extends PortEntry {
  listening: boolean;
  latencyMs: number | null;
  collisionRisk: 'NONE' | 'COLLISION_AVOIDED' | 'CONFLICT';
  statusLabel: string;
}

export const PORT_REGISTRY: PortEntry[] = [
  // === TAMALATE LINGKAR DALAM (INNER CORE ACTIVE PORTS) ===
  {
    port: 3100,
    service: '@tamalate/web (Next.js 15 + React 19 + Tailwind + Radix)',
    layer: 'Aplikasi Frontend',
    owner: 'tamalate-inner',
    protocol: 'tcp',
    host: '127.0.0.1',
    description: 'Portal Web Kepegawaian Tamalate (dipindahkan dari 3000 agar tidak bentrok dengan 9router)',
    requiredForReady: false,
  },
  {
    port: 4000,
    service: '@tamalate/api (NestJS 11 + Fastify + OpenAPI 3.1)',
    layer: 'Aplikasi Backend',
    owner: 'tamalate-inner',
    protocol: 'tcp',
    host: '127.0.0.1',
    description: 'Modular Monolith API Server (9 Kernel + Tier-2 Outbox/Idempotency)',
    requiredForReady: true,
  },
  {
    port: 5432,
    service: 'PostgreSQL 17 (tamalate-data-postgres-1)',
    layer: 'Data & Persistensi',
    owner: 'tamalate-inner',
    protocol: 'tcp',
    host: '127.0.0.1',
    description: 'Basis data relasional utama (13 tabel ter-migrasi via Prisma 6.19)',
    requiredForReady: true,
  },
  {
    port: 6432,
    service: 'PgBouncer 1.23 (tamalate-data-pgbouncer-1)',
    layer: 'Data & Persistensi',
    owner: 'tamalate-inner',
    protocol: 'tcp',
    host: '127.0.0.1',
    description: 'Transaction connection pooler di depan PostgreSQL 17',
    requiredForReady: true,
  },
  {
    port: 6379,
    service: 'Redis 8 Alpine (tamalate-data-redis-1)',
    layer: 'Data & Persistensi',
    owner: 'tamalate-inner',
    protocol: 'tcp',
    host: '127.0.0.1',
    description: 'In-memory store & broker antrean BullMQ (Outbox & Notifikasi)',
    requiredForReady: true,
  },
  {
    port: 7700,
    service: 'Meilisearch v1.12 (tamalate-data-meilisearch-1)',
    layer: 'Data & Persistensi',
    owner: 'tamalate-inner',
    protocol: 'tcp',
    host: '127.0.0.1',
    description: 'Mesin pencari instan direktori ASN, fitur, dan register',
    requiredForReady: true,
  },
  {
    port: 9000,
    service: 'RustFS / MinIO S3 API (tamalate-data-objectstore-1)',
    layer: 'Data & Persistensi',
    owner: 'tamalate-inner',
    protocol: 'tcp',
    host: '127.0.0.1',
    description: 'Object storage S3-compatible untuk bucket arsip & dossier PDF',
    requiredForReady: true,
  },
  {
    port: 9001,
    service: 'RustFS / MinIO Console UI (tamalate-data-objectstore-1)',
    layer: 'Data & Persistensi',
    owner: 'tamalate-inner',
    protocol: 'tcp',
    host: '127.0.0.1',
    description: 'Antarmuka manajemen web Object Storage S3',
    requiredForReady: true,
  },
  {
    port: 6006,
    service: 'Storybook 8 UI Catalog (@tamalate/web)',
    layer: 'Supply Chain & UI',
    owner: 'tamalate-dev',
    protocol: 'tcp',
    host: '127.0.0.1',
    description: 'Katalog komponen visual Radix UI + Tailwind (on-demand)',
    requiredForReady: false,
  },

  // === HOST / HERMES / XENONITE RESERVED PORTS (DO NOT TOUCH) ===
  {
    port: 3000,
    service: '9router Web / Node Gateway',
    layer: 'Host Xenonite Reserved',
    owner: 'host-reserved',
    protocol: 'tcp',
    host: '127.0.0.1',
    description: 'Port ocupado oleh 9router di host Windows; Web Tamalate dialihkan ke 3100',
    requiredForReady: false,
  },
  {
    port: 3333,
    service: 'Draw.io MCP Server',
    layer: 'Host Xenonite Reserved',
    owner: 'host-reserved',
    protocol: 'tcp',
    host: '127.0.0.1',
    description: 'Server diagram arsitektur MCP aktif di host',
    requiredForReady: false,
  },
  {
    port: 6333,
    service: 'Qdrant Vector DB HTTP',
    layer: 'Host Xenonite Reserved',
    owner: 'host-reserved',
    protocol: 'tcp',
    host: '127.0.0.1',
    description: 'Basis data vektor Qdrant milik ekosistem Xenonite',
    requiredForReady: false,
  },
  {
    port: 8080,
    service: 'HuggingFace TEI Embeddings',
    layer: 'Host Xenonite Reserved',
    owner: 'host-reserved',
    protocol: 'tcp',
    host: '127.0.0.1',
    description: 'Text Embeddings Inference server',
    requiredForReady: false,
  },
  {
    port: 8642,
    service: 'Hermes CLI Gateway',
    layer: 'Host Xenonite Reserved',
    owner: 'host-reserved',
    protocol: 'tcp',
    host: '127.0.0.1',
    description: 'Layanan internal Hermes Agent CLI',
    requiredForReady: false,
  },
  {
    port: 8787,
    service: 'DeepSeek Bridge',
    layer: 'Host Xenonite Reserved',
    owner: 'host-reserved',
    protocol: 'tcp',
    host: '127.0.0.1',
    description: 'Bridge inferensi model lokal',
    requiredForReady: false,
  },
  {
    port: 8888,
    service: 'SearXNG Sovereign Search',
    layer: 'Host Xenonite Reserved',
    owner: 'host-reserved',
    protocol: 'tcp',
    host: '127.0.0.1',
    description: 'Mesin pencari meta-search Xeno-Intel',
    requiredForReady: false,
  },
  {
    port: 11235,
    service: 'Crawl4AI Headless Extractor',
    layer: 'Host Xenonite Reserved',
    owner: 'host-reserved',
    protocol: 'tcp',
    host: '127.0.0.1',
    description: 'DOM extractor Xeno-Intel',
    requiredForReady: false,
  },
  {
    port: 20128,
    service: '9router OpenAI-Compatible API',
    layer: 'Host Xenonite Reserved',
    owner: 'host-reserved',
    protocol: 'tcp',
    host: '127.0.0.1',
    description: 'Endpoint utama dsk/9router',
    requiredForReady: false,
  },
];

export function probeTcpPort(host: string, port: number, timeoutMs = 600): Promise<{ listening: boolean; latencyMs: number | null }> {
  return new Promise((resolve) => {
    const start = Date.now();
    const socket = new net.Socket();
    let settled = false;

    const finish = (listening: boolean) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve({
        listening,
        latencyMs: listening ? Date.now() - start : null,
      });
    };

    socket.setTimeout(timeoutMs);
    socket.once('connect', () => finish(true));
    socket.once('timeout', () => finish(false));
    socket.once('error', () => finish(false));
    socket.connect(port, host);
  });
}

export async function scanAllPorts(): Promise<{
  scannedAt: string;
  zeroCollisionVerified: boolean;
  tamalateActiveCount: number;
  hostReservedActiveCount: number;
  ports: PortProbeResult[];
}> {
  const results = await Promise.all(
    PORT_REGISTRY.map(async (entry): Promise<PortProbeResult> => {
      const probe = await probeTcpPort(entry.host, entry.port);
      const isAvoided = entry.port === 3000 || entry.port === 3100;
      let statusLabel = probe.listening ? 'ACTIVE (LISTENING)' : 'STANDBY / OFFLINE';
      if (entry.owner === 'host-reserved' && probe.listening) {
        statusLabel = 'ISOLATED HOST SERVICE (SAFE)';
      }
      return {
        ...entry,
        listening: probe.listening,
        latencyMs: probe.latencyMs,
        collisionRisk: isAvoided ? 'COLLISION_AVOIDED' : 'NONE',
        statusLabel,
      };
    }),
  );

  const tamalatePorts = results.filter((r) => r.owner !== 'host-reserved').map((r) => r.port);
  const hostPorts = results.filter((r) => r.owner === 'host-reserved').map((r) => r.port);
  const overlap = tamalatePorts.filter((p) => hostPorts.includes(p));

  return {
    scannedAt: new Date().toISOString(),
    zeroCollisionVerified: overlap.length === 0,
    tamalateActiveCount: results.filter((r) => r.owner === 'tamalate-inner' && r.listening).length,
    hostReservedActiveCount: results.filter((r) => r.owner === 'host-reserved' && r.listening).length,
    ports: results,
  };
}
