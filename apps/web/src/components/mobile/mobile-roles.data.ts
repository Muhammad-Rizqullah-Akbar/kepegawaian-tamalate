import type { SimulationBootstrapPayload } from '@/lib/workspace-api';

export type RoleKey = 'pelaksana' | 'admin' | 'operator' | 'pegawai';
export type PelaksanaChip = 'Camat' | 'Kasubbag Umum' | 'Sekcam';

export type ScreenKey =
  | 'home'
  | 'kerja'
  | 'presensi'
  | 'vault'
  | 'dokumen'
  | 'profil'
  | 'surat'
  | 'suratBaru'
  | 'suratDetail'
  | 'agenda'
  | 'audit'
  | 'ekspor'
  | 'sop'
  | 'threshold'
  | 'notifikasi'
  | 'kpgRingkas'
  | 'kpgApel'
  | 'kpgRekap'
  | 'kpgKgb'
  | 'kpgPangkat'
  | 'kpgPensiun'
  | 'kpgCuti'
  | 'kpgBina'
  | 'kpgPegawai'
  | 'kpgDossier'
  | 'kpgDetail';

export interface RoleConfig {
  kunci: RoleKey;
  label: string;
  ringkas: string;
  ikon: string;
  avatar: string;
  salam: string;
  nama: string;
  unit: string;
  nip: string;
  jabatanChips: string[];
}

export interface HeroChipStat {
  val: string;
  lbl: string;
}

export interface RoleHeroData {
  label: string;
  value: string;
  note: string;
  chips: [HeroChipStat, HeroChipStat];
}

export interface RoleMetricItem {
  num: string;
  lbl: string;
  delta: string;
  tone?: 'up' | 'warn' | 'danger';
  go?: ScreenKey;
}

export interface RoleRowItem {
  ico: string;
  tone?: 'ok' | 'warn' | 'danger' | 'neutral';
  title: string;
  sub: string;
  badge: {
    cls: 'badge-ok' | 'badge-warn' | 'badge-danger' | 'badge-info' | 'badge-neutral';
    icon?: string;
    text: string;
  };
  go?: ScreenKey;
  suratAgenda?: string;
  usulanId?: string;
}

export interface RoleSectionItem {
  title: string;
  link?: string;
  linkGo?: ScreenKey;
  rows: RoleRowItem[];
}

export const ROLE_CONFIGS: Record<RoleKey, RoleConfig> = {
  pelaksana: {
    kunci: 'pelaksana',
    label: 'Pelaksana',
    ringkas: 'Camat, Kasubbag, Sekcam',
    ikon: 'ph-seal-check',
    avatar: 'KU',
    salam: 'Selamat pagi',
    nama: 'Kasubag Umum',
    unit: 'Pejabat Pelaksana · Kecamatan Tamalate',
    nip: '19780412 200501 1 004',
    jabatanChips: ['Camat', 'Kasubbag Umum', 'Sekcam'],
  },
  admin: {
    kunci: 'admin',
    label: 'Admin',
    ringkas: 'Data, parameter, hak akses',
    ikon: 'ph-shield-star',
    avatar: 'AD',
    salam: 'Selamat pagi',
    nama: 'Admin Kepegawaian',
    unit: 'Pengelola Sistem · Subbagian Umum dan Kepegawaian',
    nip: '19910318 201903 2 011',
    jabatanChips: ['Admin Kepegawaian'],
  },
  operator: {
    kunci: 'operator',
    label: 'Operator',
    ringkas: 'Pencatatan dan distribusi',
    ikon: 'ph-clipboard-text',
    avatar: 'OP',
    salam: 'Selamat pagi',
    nama: 'Petugas Pengendali',
    unit: 'Loket Persuratan · Sekretariat Kecamatan',
    nip: '19950821 202203 1 007',
    jabatanChips: ['Operator Surat', 'Petugas Arsip'],
  },
  pegawai: {
    kunci: 'pegawai',
    label: 'Pegawai',
    ringkas: 'Presensi dan layanan pribadi',
    ikon: 'ph-user',
    avatar: 'PG',
    salam: 'Selamat pagi',
    nama: 'Staf Subbagian Umum',
    unit: 'Pelaksana Administrasi · Kecamatan Tamalate',
    nip: '19971104 202321 2 015',
    jabatanChips: ['ASN / PPPK'],
  },
};

export function buildRoleHomeView(
  roleKey: RoleKey,
  data: SimulationBootstrapPayload | null,
): {
  hero: RoleHeroData;
  metrics: RoleMetricItem[];
  sections: RoleSectionItem[];
} {
  const suratList = data?.surat ?? [];
  const usulanList = data?.usulan ?? [];
  const totalPegawai = data?.stats.totalPegawai ?? 148;
  const hadirPagi = data?.stats.hadirPagi ?? 138;
  const menungguDisposisi = suratList.filter(
    (s) => s.status === 'baru' || s.status === 'disposisi',
  ).length;
  const suratProses = suratList.filter((s) => s.status === 'proses').length;
  const suratSelesai = suratList.filter((s) => s.status === 'selesai').length;
  const suratTerlambat = suratList.filter((s) => s.status === 'terlambat').length;

  if (roleKey === 'pelaksana') {
    const totalPutusan = menungguDisposisi + usulanList.filter((u) => u.tahap < 4).length;
    return {
      hero: {
        label: 'Menunggu keputusan pimpinan',
        value: `${totalPutusan} berkas`,
        note: 'Verifikasi usulan Kasubbag, paraf pengantar Sekcam, dan persetujuan akhir Camat.',
        chips: [
          { val: `${menungguDisposisi} surat`, lbl: 'Disposisi hari ini' },
          { val: `${usulanList.length} usulan`, lbl: 'KGB, pangkat, cuti' },
        ],
      },
      metrics: [
        {
          num: `${Math.round((hadirPagi / Math.max(totalPegawai, 1)) * 100)}%`,
          lbl: 'Hadir apel pagi',
          delta: `${hadirPagi} dari ${totalPegawai}`,
          tone: 'up',
          go: 'kpgApel',
        },
        {
          num: String(usulanList.length).padStart(2, '0'),
          lbl: 'Usulan berjalan',
          delta: '2 jatuh tempo',
          tone: 'warn',
          go: 'kpgKgb',
        },
        {
          num: String(suratTerlambat).padStart(2, '0'),
          lbl: 'Melewati batas',
          delta: 'Perlu teguran',
          tone: 'danger',
          go: 'kpgBina',
        },
      ],
      sections: [
        {
          title: 'Menunggu keputusan',
          link: 'Buka kerja',
          linkGo: 'kerja',
          rows: [
            {
              ico: 'ph-paper-plane-tilt',
              tone: 'warn',
              title: 'Disposisi surat masuk',
              sub: `${menungguDisposisi} surat dari Sekretariat Kota menunggu arahan Camat`,
              badge: { cls: 'badge-warn', icon: 'ph-clock', text: 'Segera' },
              go: 'surat',
            },
            {
              ico: 'ph-trend-up',
              tone: 'ok',
              title: 'Usulan KGB periode Mei',
              sub: '4 berkas lengkap, sudah diverifikasi Kasubbag Umum',
              badge: { cls: 'badge-info', icon: 'ph-Signature', text: 'Paraf Sekcam' },
              go: 'kpgKgb',
            },
            {
              ico: 'ph-calendar-x',
              tone: 'danger',
              title: 'Batas ketidakhadiran terlampaui',
              sub: '2 pegawai mencapai 5 hari tanpa keterangan bulan ini',
              badge: { cls: 'badge-danger', icon: 'ph-warning', text: 'Tindak lanjut' },
              go: 'kpgBina',
            },
          ],
        },
        {
          title: 'Ringkasan unit',
          link: 'Rekap penuh',
          linkGo: 'kpgRingkas',
          rows: [
            {
              ico: 'ph-users-three',
              tone: 'ok',
              title: 'Sekretariat Kecamatan',
              sub: '42 pegawai · 40 hadir · 2 dinas luar',
              badge: { cls: 'badge-ok', icon: 'ph-check', text: '95%' },
              go: 'kpgApel',
            },
            {
              ico: 'ph-buildings',
              tone: 'ok',
              title: '10 Kelurahan se-Tamalate',
              sub: '106 pegawai · 98 hadir · 5 izin · 3 tanpa kabar',
              badge: { cls: 'badge-ok', icon: 'ph-check', text: '92%' },
              go: 'kpgRekap',
            },
          ],
        },
      ],
    };
  }

  if (roleKey === 'admin') {
    return {
      hero: {
        label: 'Konfigurasi sistem',
        value: 'Parameter aktif',
        note: 'Batas hari disiplin, bobot penilaian, dan kuota cuti disimpan sebagai data, bukan ditanam di kode.',
        chips: [
          { val: '5 hari', lbl: 'Batas tanpa kabar' },
          { val: '12 hari', lbl: 'Kuota cuti tahunan' },
        ],
      },
      metrics: [
        {
          num: String(totalPegawai),
          lbl: 'Pegawai aktif',
          delta: '11 unit kerja',
          tone: 'up',
          go: 'kpgPegawai',
        },
        {
          num: '06',
          lbl: 'Partisi vault',
          delta: 'Terenkripsi',
          tone: 'up',
          go: 'vault',
        },
        {
          num: '03',
          lbl: 'Template aktif',
          delta: 'Siap cetak & OnlyOffice',
          tone: 'warn',
          go: 'ekspor',
        },
      ],
      sections: [
        {
          title: 'Parameter threshold sebagai data',
          link: 'Ubah nilai',
          linkGo: 'threshold',
          rows: [
            {
              ico: 'ph-sliders-horizontal',
              tone: 'warn',
              title: 'Batas akumulasi tanpa keterangan',
              sub: 'Nilai aktif: 5 hari kerja per bulan · Memicu panggilan pembinaan',
              badge: { cls: 'badge-info', text: 'Parameter' },
              go: 'threshold',
            },
            {
              ico: 'ph-map-pin-area',
              tone: 'ok',
              title: 'Radius geofence kantor kecamatan',
              sub: 'Nilai aktif: 150 meter dari titik koordinat kantor',
              badge: { cls: 'badge-info', text: 'Parameter' },
              go: 'threshold',
            },
            {
              ico: 'ph-bell-ringing',
              tone: 'ok',
              title: 'Pengingat jatuh tempo KGB & pangkat',
              sub: 'Nilai aktif: H-60 dan H-30 sebelum TMT berikutnya',
              badge: { cls: 'badge-info', text: 'Parameter' },
              go: 'kpgKgb',
            },
          ],
        },
        {
          title: 'Hak akses dan organisasi',
          link: 'Kelola',
          linkGo: 'kpgPegawai',
          rows: [
            {
              ico: 'ph-key',
              tone: 'ok',
              title: 'Matriks peran empat kelompok',
              sub: 'Pelaksana, Admin, Operator, dan Pegawai · Semua aktif',
              badge: { cls: 'badge-ok', text: 'Tersinkron' },
              go: 'profil',
            },
            {
              ico: 'ph-Database',
              tone: 'ok',
              title: 'Kelengkapan data pokok ASN',
              sub: '145 dari 148 pegawai memiliki 6 partisi vault lengkap',
              badge: { cls: 'badge-warn', text: '3 kurang' },
              go: 'kpgDossier',
            },
          ],
        },
      ],
    };
  }

  if (roleKey === 'operator') {
    return {
      hero: {
        label: 'Meja pengendali surat',
        value: `${suratList.length} surat`,
        note: 'Lima tahap pengendalian: pencatatan, lembar disposisi, distribusi, tindak lanjut, dan arsip.',
        chips: [
          { val: `${menungguDisposisi} baru`, lbl: 'Perlu nomor agenda' },
          { val: `${suratProses} jalan`, lbl: 'Menunggu balasan' },
        ],
      },
      metrics: [
        {
          num: String(suratList.length),
          lbl: 'Agenda bulan ini',
          delta: `+${menungguDisposisi} hari ini`,
          tone: 'up',
          go: 'agenda',
        },
        {
          num: String(suratProses).padStart(2, '0'),
          lbl: 'Sedang diproses',
          delta: `${suratTerlambat} lewat tenggat`,
          tone: 'warn',
          go: 'surat',
        },
        {
          num: String(suratSelesai),
          lbl: 'Terarsip rapi',
          delta: 'Siap diaudit',
          tone: 'up',
          go: 'ekspor',
        },
      ],
      sections: [
        {
          title: 'Surat masuk terbaru',
          link: 'Catat baru',
          linkGo: 'suratBaru',
          rows: suratList.slice(0, 3).map((s) => ({
            ico: s.status === 'baru' ? 'ph-envelope-simple-open' : 'ph-file-text',
            tone:
              s.status === 'terlambat'
                ? 'danger'
                : s.status === 'disposisi'
                  ? 'warn'
                  : s.status === 'selesai'
                    ? 'ok'
                    : 'neutral',
            title: s.perihal,
            sub: `${s.asal} · Agenda ${s.agenda}`,
            badge: {
              cls:
                s.status === 'terlambat'
                  ? 'badge-danger'
                  : s.status === 'disposisi'
                    ? 'badge-warn'
                    : s.status === 'selesai'
                      ? 'badge-ok'
                      : 'badge-info',
              text:
                s.status === 'baru'
                  ? 'Baru'
                  : s.status === 'disposisi'
                    ? 'Disposisi'
                    : s.status === 'proses'
                      ? 'Diproses'
                      : s.status === 'terlambat'
                        ? 'Terlambat'
                        : 'Selesai',
            },
            go: 'suratDetail',
            suratAgenda: s.agenda,
          })),
        },
        {
          title: 'Distribusi dan buku agenda',
          link: 'Buku agenda',
          linkGo: 'agenda',
          rows: [
            {
              ico: 'ph-notebook',
              tone: 'ok',
              title: 'Buku agenda surat 8 kolom',
              sub: `${suratList.length} naskah tercatat resmi pada register Kecamatan Tamalate`,
              badge: { cls: 'badge-ok', text: 'Lengkap' },
              go: 'agenda',
            },
            {
              ico: 'ph-printer',
              tone: 'ok',
              title: 'Cetak lembar disposisi & agenda',
              sub: 'Pratinjau halaman A4 siap cetak atau simpan PDF',
              badge: { cls: 'badge-info', text: 'Siap cetak' },
              go: 'ekspor',
            },
          ],
        },
      ],
    };
  }

  // Default: pegawai
  return {
    hero: {
      label: 'Kehadiran hari ini',
      value: '07.42 WITA',
      note: 'Apel pagi tercatat di halaman kantor Kecamatan Tamalate. Jangan lupa presensi sore pukul 16.00.',
      chips: [
        { val: '10 hari', lbl: 'Sisa hak cuti' },
        { val: 'Okt 2026', lbl: 'Jadwal KGB berikut' },
      ],
    },
    metrics: [
      {
        num: '18',
        lbl: 'Hari hadir bulan ini',
        delta: 'Tanpa terlambat',
        tone: 'up',
        go: 'kpgRekap',
      },
      {
        num: '00',
        lbl: 'Tanpa keterangan',
        delta: 'Batas 5 hari',
        tone: 'up',
        go: 'presensi',
      },
      {
        num: '06',
        lbl: 'Berkas di vault',
        delta: 'Semua sah',
        tone: 'up',
        go: 'vault',
      },
    ],
    sections: [
      {
        title: 'Layanan mandiri',
        link: 'Ajukan baru',
        linkGo: 'kpgCuti',
        rows: [
          {
            ico: 'ph-sun-horizon',
            tone: 'ok',
            title: 'Permohonan cuti tahunan (3 hari)',
            sub: '12 - 14 Mei 2026 · Sudah diparaf Kasubbag, menunggu Sekcam',
            badge: { cls: 'badge-info', text: 'Tahap 2/3' },
            go: 'kpgCuti',
          },
          {
            ico: 'ph-trend-up',
            tone: 'ok',
            title: 'Berkas persiapan KGB Oktober 2026',
            sub: 'SK terakhir dan SKP 2025 sudah tersedia di dalam vault',
            badge: { cls: 'badge-ok', text: 'Siap' },
            go: 'vault',
          },
        ],
      },
      {
        title: 'Riwayat presensi pekan ini',
        link: 'Lihat bulan',
        linkGo: 'kpgRekap',
        rows: [
          {
            ico: 'ph-check-circle',
            tone: 'ok',
            title: 'Senin, 19 Juni 2026',
            sub: 'Pagi 07.42 · Sore menunggu 16.00 · Di dalam radius',
            badge: { cls: 'badge-ok', text: 'Hadir' },
            go: 'presensi',
          },
          {
            ico: 'ph-check-circle',
            tone: 'ok',
            title: 'Jumat, 16 Juni 2026',
            sub: 'Pagi 07.38 · Sore 16.09 · Di dalam radius',
            badge: { cls: 'badge-ok', text: 'Lengkap' },
            go: 'presensi',
          },
        ],
      },
    ],
  };
}
