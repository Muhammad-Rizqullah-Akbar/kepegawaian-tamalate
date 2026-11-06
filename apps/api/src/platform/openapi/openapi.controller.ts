import { Controller, Get } from '@nestjs/common';

@Controller('openapi.json')
export class OpenApiController {
  @Get()
  getSpec() {
    return {
      openapi: '3.1.0',
      info: {
        title: 'Kepegawaian Kecamatan Tamalate API',
        version: '1.0.0',
        description:
          'REST API Kontrak Tunggal 9 Kernel (K1-K9) & 76 Fitur Siklus Hidup Kepegawaian Kecamatan Tamalate',
      },
      servers: [
        {
          url: 'http://127.0.0.1:4000/api/v1',
          description: 'Lingkar Dalam Development Server (Zero-Collision Port 4000)',
        },
      ],
      paths: {
        '/health': {
          get: { summary: 'Liveness probe', tags: ['Platform'] },
        },
        '/ready': {
          get: { summary: 'Deep readiness probe across all 21 Inner Core services', tags: ['Platform'] },
        },
        '/health/ports': {
          get: {
            summary: 'Live Port Registry & Anti-Collision TCP Scanner',
            tags: ['Platform'],
          },
        },
        '/features': {
          get: { summary: 'Katalog 76 fitur siklus hidup kepegawaian', tags: ['Kernel'] },
        },
        '/submissions': {
          get: { summary: 'Daftar pengajuan layanan kepegawaian', tags: ['K3-Workflow'] },
          post: { summary: 'Buat pengajuan layanan baru', tags: ['K3-Workflow'] },
        },
        '/submissions/{id}/transitions': {
          post: { summary: 'Eksekusi transisi status pengajuan', tags: ['K3-Workflow'] },
        },
        '/registers': {
          get: { summary: 'Buku register masuk/keluar', tags: ['K5-Numbering'] },
          post: { summary: 'Catat entri buku register baru', tags: ['K5-Numbering'] },
        },
        '/numbering/allocate': {
          post: { summary: 'Alokasi nomor naskah dinas atomik', tags: ['K5-Numbering'] },
        },
        '/reference/persons': {
          get: { summary: 'Direktori ASN/Non-ASN Kecamatan Tamalate', tags: ['K2-Directory'] },
        },
        '/reference/sops': {
          get: { summary: 'Katalog SOP & SLA layanan', tags: ['K1-Governance'] },
        },
      },
    };
  }
}
