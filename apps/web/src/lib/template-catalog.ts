/**
 * Katalog template generator. File ini sengaja murni tanpa impor client
 * agar bisa dipakai server component maupun client component tanpa
 * memicu pelanggaran batas React Server Components.
 */
export type TemplateId = 'lembar-disposisi' | 'buku-agenda' | 'surat-cuti';

export interface TemplateMeta {
  readonly id: TemplateId;
  readonly kode: string;
  readonly nama: string;
  readonly orientasi: string;
  readonly format: string;
  readonly jalur: string;
  readonly fieldKunci: readonly string[];
  readonly ringkas: string;
}

export const TEMPLATE_CATALOG: readonly TemplateMeta[] = [
  {
    id: 'lembar-disposisi',
    kode: 'K3-TPL-01',
    nama: 'Lembar Disposisi',
    orientasi: 'A4 Tegak',
    format: 'DOCX dan PDF',
    jalur: '/template/lembar-disposisi',
    fieldKunci: ['kopInstansi', 'kopUnit', 'judulDokumen', 'labelAgenda', 'labelSifat', 'catatanKaki'],
    ringkas: 'Lembar kendali disposisi resmi dengan 10 tujuan bawaan dan instruksi cepat.',
  },
  {
    id: 'buku-agenda',
    kode: 'K3-TPL-02',
    nama: 'Buku Agenda Pengendalian',
    orientasi: 'A4 Melintang',
    format: 'XLSX dan PDF',
    jalur: '/template/buku-agenda',
    fieldKunci: ['kopPemerintah', 'kopKecamatan', 'judulDokumen', 'alamatKantor', 'kotaTanggal'],
    ringkas: 'Buku agenda dengan 8 kolom tabel dan ekspor CSV atau PDF.',
  },
  {
    id: 'surat-cuti',
    kode: 'K3-TPL-03',
    nama: 'Formulir Surat Cuti',
    orientasi: 'A4 Tegak',
    format: 'DOCX dan PDF',
    jalur: '/template/surat-cuti',
    fieldKunci: ['kotaSurat', 'tujuanYth', 'tujuanCqBaris1', 'tujuanCqBaris2', 'tujuanDi'],
    ringkas: 'Formulir cuti 6 jenis resmi dengan tanda tangan atasan dan pejabat.',
  },
];

export function findTemplateMeta(id: string): TemplateMeta | null {
  return TEMPLATE_CATALOG.find((t) => t.id === id) ?? null;
}
