/**
 * Helper Template Studio.
 * Semua fungsi murni kecuali exportHtmlToPdf.
 * Katalog dipisah ke template-catalog.ts agar aman untuk server component.
 */
import type { SuratCutiFormProps } from '@/components/shared/SuratPaperTemplates';
import type { SuratRecord } from './workspace-api';
import type {
  BukuAgendaTemplate,
  DocumentTemplateRegistry,
  LembarDisposisiTemplate,
  SuratCutiTemplate,
} from './template-schema';
import type { TemplateId } from './template-catalog';

export type { TemplateId, TemplateMeta } from './template-catalog';
export { TEMPLATE_CATALOG, findTemplateMeta } from './template-catalog';

export function pickTemplate(
  registry: DocumentTemplateRegistry,
  id: TemplateId,
): LembarDisposisiTemplate | BukuAgendaTemplate | SuratCutiTemplate {
  if (id === 'lembar-disposisi') return registry.lembarDisposisi;
  if (id === 'buku-agenda') return registry.bukuAgenda;
  return registry.suratCuti;
}

export interface TemplateSummaryRow {
  readonly id: TemplateId;
  readonly nama: string;
  readonly versi: string;
  readonly jumlahField: number;
  readonly onlyOfficeAktif: boolean;
  readonly sinkronTerakhir: string;
}

export function summarize(registry: DocumentTemplateRegistry): readonly TemplateSummaryRow[] {
  const ids: readonly TemplateId[] = ['lembar-disposisi', 'buku-agenda', 'surat-cuti'];
  return ids.map((id) => {
    const tpl = pickTemplate(registry, id);
    const jumlahField = Object.keys(tpl).filter((k) => k !== 'onlyOffice' && k !== 'id').length;
    return {
      id,
      nama: tpl.namaTemplate,
      versi: tpl.versi,
      jumlahField,
      onlyOfficeAktif: tpl.onlyOffice.enabled,
      sinkronTerakhir: tpl.onlyOffice.lastSyncedAt ?? 'belum pernah',
    };
  });
}

export const SAMPLE_SURAT: SuratRecord = {
  agenda: 'AG-2026-0017',
  nomorSurat: '470/118/KEC-TML/XI/2026',
  asal: 'Dinas Pendidikan Kota Makassar',
  instansiTujuan: 'Kecamatan Tamalate',
  perihal: 'Undangan Rapat Koordinasi Penyelenggaraan Pendidikan Triwulan IV',
  tanggalAgenda: '2026-11-05',
  tanggalPenerimaan: '2026-11-05',
  tanggalPenyelesaian: '2026-11-12',
  tanggalSurat: '2026-11-03',
  sifat: 'penting',
  lampiran: '1 berkas',
  tahap: 2,
  status: 'disposisi',
  penanggungJawab: 'Kasubbag Umum dan Kepegawaian',
  keterangan: 'Hadir tepat waktu',
  disposisi: {
    diketahuiSekcam: true,
    catatanSekcam: 'Mohon diteruskan ke Kasi Pemerintahan untuk telaah teknis.',
    rekomendasiSekcam: ['Kasi Pemerintahan', 'Kasubag Umum dan Kepegawaian'],
    instruksi: 'Koordinasikan dan laporkan hasil',
    tanggalDisposisi: '2026-11-06',
    hasParaf: true,
    parafMode: 'canvas',
    diteruskan: ['Kasi Pemerintahan'],
    kembalikanKepada: 'Sekretaris Camat',
    kembalikanTanggal: '2026-11-12',
  },
  auditTrail: [
    { timestamp: '2026-11-05T08:00:00Z', user: 'Operator Agenda', action: 'REGISTRASI', note: 'Surat masuk dicatat' },
    { timestamp: '2026-11-06T09:30:00Z', user: 'Sekretaris Camat', action: 'PARAF_SEKCAM', note: 'Diteruskan ke Kasi' },
  ],
};

export const SAMPLE_SURAT_LIST: SuratRecord[] = [
  SAMPLE_SURAT,
  {
    ...SAMPLE_SURAT,
    agenda: 'AG-2026-0018',
    nomorSurat: '005/23/KEC-TML/XI/2026',
    asal: 'Badan Kepegawaian dan Pengembangan SDM Daerah',
    perihal: 'Permintaan Data Pensiun Batch Desember',
    tanggalSurat: '2026-11-04',
    tanggalPenerimaan: '2026-11-04',
    sifat: 'segera',
    status: 'baru',
    disposisi: {},
    auditTrail: [{ timestamp: '2026-11-04T10:00:00Z', user: 'Operator Agenda', action: 'REGISTRASI' }],
  },
  {
    ...SAMPLE_SURAT,
    agenda: 'AG-2026-0019',
    nomorSurat: '800/88/KEC-TML/XI/2026',
    asal: 'Sekretariat Daerah Kota Makassar',
    perihal: 'Sosialisasi Perubahan SOP Tata Naskah Dinas 2026',
    tanggalSurat: '2026-11-02',
    tanggalPenerimaan: '2026-11-02',
    tanggalPenyelesaian: '2026-11-15',
    sifat: 'biasa',
    status: 'proses',
    disposisi: {
      instruksi: 'Untuk diketahui dan diarsipkan',
      tanggalDisposisi: '2026-11-03',
      diteruskan: ['Kasubag Umum dan Kepegawaian'],
    },
    auditTrail: [
      { timestamp: '2026-11-02T09:00:00Z', user: 'Operator Agenda', action: 'REGISTRASI' },
      { timestamp: '2026-11-03T11:00:00Z', user: 'Camat', action: 'DISPOSISI' },
    ],
  },
];

export const SAMPLE_CUTI: SuratCutiFormProps = {
  nama: 'Muhammad Rizal Saputra, S.IP',
  nip: '19800101 200601 2 001',
  jabatan: 'Kasubbag Umum dan Kepegawaian',
  masaKerja: '18 tahun 3 bulan',
  unitKerja: 'Kecamatan Tamalate',
  jenisNomor: 1,
  alasan: 'Keperluan keluarga',
  selama: '5 hari kerja',
  mulai: '2026-12-01',
  sampai: '2026-12-05',
  sisaN: 12,
  sisaN1: 10,
  alamat: 'Jl. Danau Tanjung Bunga Utara No. 181, Makassar',
  telepon: '0812-3456-7890',
  tanggalSurat: '2026-11-20',
  nomorNaskah: '800.1.11.4/123/KEC-TML/XI/2026',
  putusanAtasan: 'DISETUJUI',
  putusanPejabat: 'DISETUJUI',
};

export interface PdfExportResult {
  readonly blob: Blob;
  readonly sha256: string | null;
  readonly s3Key: string | null;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';

export async function exportHtmlToPdf(title: string, html: string): Promise<PdfExportResult> {
  const res = await fetch(API_BASE + '/simulation/render-pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, html }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error('Render PDF gagal: HTTP ' + res.status + ' ' + detail.slice(0, 160));
  }
  const blob = await res.blob();
  return {
    blob,
    sha256: res.headers.get('X-Tamalate-SHA256'),
    s3Key: res.headers.get('X-Tamalate-S3-Key'),
  };
}

export function nodeToHtml(node: HTMLElement | null): string | null {
  if (!node) return null;
  return node.outerHTML;
}
