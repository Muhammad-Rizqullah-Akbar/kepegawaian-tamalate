import type { FieldDef } from '@/components/CreateSubmissionForm';

const LEAVE_FIELDS: readonly FieldDef[] = [
  { key: 'jenisCuti', label: 'Jenis Cuti', type: 'select', required: true, options: [
    { value: 'tahunan', label: 'Cuti Tahunan (12 hari)' },
    { value: 'besar', label: 'Cuti Besar (90 hari)' },
    { value: 'sakit', label: 'Cuti Sakit' },
    { value: 'melahirkan', label: 'Cuti Melahirkan (90 hari)' },
    { value: 'alasan_penting', label: 'Cuti Alasan Penting (30 hari)' },
  ] },
  { key: 'tanggalMulai', label: 'Tanggal Mulai', type: 'date', required: true },
  { key: 'tanggalSelesai', label: 'Tanggal Selesai', type: 'date', required: true },
  { key: 'alasan', label: 'Alasan', type: 'textarea', placeholder: 'Alasan pengajuan cuti' },
  { key: 'suratAtasanLangsung', label: 'Surat Atasan Langsung (ID dokumen)', type: 'text' },
];

const KGB_FIELDS: readonly FieldDef[] = [
  { key: 'tmtKgbTerakhir', label: 'TMT KGB Terakhir', type: 'date', required: true },
  { key: 'golonganRuang', label: 'Golongan Ruang', type: 'text', placeholder: 'Contoh: III/b' },
  { key: 'catatan', label: 'Catatan', type: 'textarea' },
];

const PENSION_FIELDS: readonly FieldDef[] = [
  { key: 'nip', label: 'NIP Pegawai', type: 'text', required: true },
  { key: 'namaPegawai', label: 'Nama Pegawai', type: 'text', required: true },
  { key: 'tanggalLahir', label: 'Tanggal Lahir', type: 'date' },
  { key: 'jabatanTerakhir', label: 'Jabatan Terakhir', type: 'text' },
  { key: 'catatan', label: 'Catatan', type: 'textarea' },
];

const PROMOTION_FIELDS: readonly FieldDef[] = [
  { key: 'periode', label: 'Periode Usulan', type: 'text', required: true, placeholder: 'April 2027' },
  { key: 'jumlahPegawai', label: 'Jumlah Pegawai', type: 'number' },
  { key: 'catatan', label: 'Catatan', type: 'textarea' },
];

const COACHING_FIELDS: readonly FieldDef[] = [
  { key: 'nip', label: 'NIP Pegawai', type: 'text', required: true },
  { key: 'jenisPelanggaran', label: 'Jenis Pelanggaran', type: 'text', required: true },
  { key: 'tanggalKejadian', label: 'Tanggal Kejadian', type: 'date' },
  { key: 'keterangan', label: 'Keterangan', type: 'textarea' },
];

const ARCHIVE_FIELDS: readonly FieldDef[] = [
  { key: 'jenisNaskah', label: 'Jenis Naskah', type: 'text', required: true },
  { key: 'nomorNaskah', label: 'Nomor Naskah', type: 'text', required: true },
  { key: 'perihal', label: 'Perihal', type: 'text', required: true },
  { key: 'klasifikasi', label: 'Kode Klasifikasi', type: 'text', placeholder: 'Contoh: 005.1' },
  { key: 'retensi', label: 'Retensi', type: 'select', options: [
    { value: 'aktif', label: 'Aktif' },
    { value: 'inaktif', label: 'Inaktif' },
    { value: 'vital', label: 'Vital (permanen)' },
  ] },
];

export const SOP_FIELDS: Readonly<Record<string, readonly FieldDef[]>> = {
  'SOP-01': PENSION_FIELDS,
  'SOP-02': KGB_FIELDS,
  'SOP-03': PROMOTION_FIELDS,
  'SOP-04': COACHING_FIELDS,
  'SOP-05': LEAVE_FIELDS,
  'SOP-06': ARCHIVE_FIELDS,
};
