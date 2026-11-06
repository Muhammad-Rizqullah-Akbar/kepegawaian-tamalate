'use client';

import React, { useMemo, useState } from 'react';
import type { PegawaiRecord, UsulanRecord } from '@/lib/workspace-api';
import type { GlobalThresholdConfig } from './ThresholdConfigView';
import { SuratCutiSheet } from '@/components/shared/SuratPaperTemplates';
import { TemplateCustomizerModal } from '@/components/shared/TemplateCustomizerModal';
import { CekBerkasModal } from './CekBerkasModal';
import { NotifikasiMassalModal } from './NotifikasiMassalModal';
import { BulkPackModal } from './BulkPackModal';
import { TolakRevisiModal } from './TolakRevisiModal';

interface CutiBoardViewProps {
  pegawaiList: PegawaiRecord[];
  usulanList: UsulanRecord[];
  config: GlobalThresholdConfig;
  currentRoleKey: string;
  currentRoleLabel: string;
  currentRoleName: string;
  onAdvanceUsulan?: (usulanId: string, signatureMethod?: 'bsre' | 'qr' | 'basah') => Promise<void>;
  onRevertUsulan?: (usulanId: string, catatan: string) => Promise<void>;
  onToggleBerkas?: (usulanId: string, kodeBerkas: string, lengkap: boolean) => Promise<void>;
}

// 7 Kategori Cuti Berdasarkan Peraturan BKN No. 24/2017 jo. Peraturan BKN No. 7/2021
const DAFTAR_KATEGORI_CUTI = [
  { id: 'tahunan', nama: 'Cuti Tahunan', aturan: 'Maks. 12 hari kerja per tahun kalender (hak timbul pasca 1 tahun kerja)' },
  { id: 'besar', nama: 'Cuti Besar', aturan: 'Maks. 3 bulan bagi PNS masa kerja min. 5 tahun terus menerus' },
  { id: 'sakit', nama: 'Cuti Sakit', aturan: '1-14 hari (surat dokter faskes), >14 hari (surat tim penguji kesehatan)' },
  { id: 'melahirkan', nama: 'Cuti Melahirkan', aturan: '3 bulan (1 bulan pra dan 2 bulan pasca bersalin)' },
  { id: 'alasan_penting', nama: 'Cuti Alasan Penting (CAP)', aturan: 'Maks. 1 bulan (keluarga sakit keras/wafat, nikah pertama, sesar)' },
  { id: 'bersama', nama: 'Cuti Bersama', aturan: 'Ditetapkan Keppres RI tanpa memotong cuti tahunan' },
  { id: 'cltn', nama: 'Cuti di Luar Tanggungan Negara', aturan: 'Masa kerja min. 5 tahun, maks. 3 tahun (+1 tahun), nota BKN' },
];

export function CutiBoardView({
  pegawaiList,
  usulanList,
  config,
  currentRoleKey,
  currentRoleLabel,
  currentRoleName,
  onAdvanceUsulan,
  onRevertUsulan,
  onToggleBerkas,
}: CutiBoardViewProps): React.ReactNode {
  const [filterMode, setFilterMode] = useState<'semua' | 'tahunan' | 'sakit' | 'alasan_penting'>('semua');
  const [toastNotif, setToastNotif] = useState<string | null>(null);
  const [cekFormulirModalOpen, setCekFormulirModalOpen] = useState(false);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [selectedCekUsulan, setSelectedCekUsulan] = useState<UsulanRecord | null>(null);
  const [cekModalOpen, setCekModalOpen] = useState(false);
  const [notifModalOpen, setNotifModalOpen] = useState(false);
  const [bulkPackModalOpen, setBulkPackModalOpen] = useState(false);
  const [tolakModalOpen, setTolakModalOpen] = useState(false);
  const [selectedTolakUsulan, setSelectedTolakUsulan] = useState<UsulanRecord | null>(null);

  // Filter usulan jenis cuti
  const cutiUsulanList = useMemo(() => {
    return usulanList.filter(
      (u) => u.jenis?.toLowerCase() === 'cuti' || u.id.startsWith('CUTI'),
    );
  }, [usulanList]);

  // Gabungkan usulan cuti dengan kuota sisa cuti pegawai
  const cutiRows = useMemo(() => {
    return pegawaiList.slice(0, 10).map((peg, idx) => {
      const cleanNip = peg.nip.replace(/\s+/g, '');
      const related = cutiUsulanList.find((u) => u.nip.replace(/\s+/g, '') === cleanNip);

      // Variasi data cuti sesuai konteks ASN Tamalate
      const jenisPreset = idx === 0
        ? 'Cuti Tahunan'
        : idx === 1
        ? 'Cuti Sakit'
        : idx === 2
        ? 'Cuti Alasan Penting'
        : idx === 3
        ? 'Cuti Melahirkan'
        : idx === 4
        ? 'Cuti Besar'
        : 'Cuti Tahunan';

      const durasiHari = idx === 0 ? 3 : idx === 1 ? 5 : idx === 2 ? 2 : idx === 3 ? 90 : 4;
      const rentangTanggal = idx === 0
        ? '12 Nov 2026 s.d. 14 Nov 2026'
        : idx === 1
        ? '09 Nov 2026 s.d. 13 Nov 2026'
        : idx === 2
        ? '18 Nov 2026 s.d. 19 Nov 2026'
        : '01 Des 2026 s.d. 04 Des 2026';

      const tahap = related?.tahap ?? (idx === 0 ? 5 : (idx % 4) + 1);
      const isComplete = related ? related.berkas.every((b) => b.lengkap) : idx !== 2;
      const usulanId = related?.id ?? `CUTI-2026-${String(idx + 1).padStart(3, '0')}`;

      // Dokumen standar cuti ASN sesuai BKN
      const dokumenList = [
        { kode: 'form-cuti', nama: 'Formulir Permintaan & Pemberian Cuti (8 Tabel BKN)', lengkap: true },
        { kode: 'surat-dukung', nama: 'Dokumen Pendukung (Surat Dokter / Undangan / Kematian / SPT)', lengkap: isComplete },
        { kode: 'pelimpahan-tugas', nama: 'Surat Pernyataan Pelimpahan Tugas Sementara', lengkap: true },
        { kode: 'rekap-kehadiran', nama: 'Rekap Presensi & Sisa Hak Cuti Tahunan (N-2, N-1, N)', lengkap: true },
      ];

      return {
        usulanId,
        nip: peg.nip,
        cleanNip,
        nama: peg.nama,
        golongan: peg.golongan,
        pangkat: peg.pangkat,
        jabatan: peg.jabatan,
        jenisCuti: jenisPreset,
        durasiHari,
        rentangTanggal,
        sisaCutiN: peg.sisaCutiN ?? 12,
        sisaCutiN1: peg.sisaCutiN1 ?? 6,
        sisaCutiN2: peg.sisaCutiN2 ?? 0,
        totalBerkas: dokumenList.length,
        lengkapCount: dokumenList.filter((d) => d.lengkap).length,
        isComplete,
        tahap,
        related,
        dokumenList,
      };
    });
  }, [pegawaiList, cutiUsulanList]);

  // Filter tab
  const filteredRows = useMemo(() => {
    if (filterMode === 'tahunan') {
      return cutiRows.filter((r) => r.jenisCuti.toLowerCase().includes('tahunan'));
    }
    if (filterMode === 'sakit') {
      return cutiRows.filter((r) => r.jenisCuti.toLowerCase().includes('sakit'));
    }
    if (filterMode === 'alasan_penting') {
      return cutiRows.filter((r) => r.jenisCuti.toLowerCase().includes('alasan'));
    }
    return cutiRows;
  }, [cutiRows, filterMode]);

  const getStageBadge = (tahap: number) => {
    switch (tahap) {
      case 1:
        return { label: 'T1 · Operator', cls: 'badge-neutral', full: 'Tahap 1: Pemeriksaan Kuota & Berkas (Operator)' };
      case 2:
        return { label: 'T2 · Kasubag', cls: 'badge-info', full: 'Tahap 2: Validasi Substantif (Kasubag Umpeg)' };
      case 3:
        return { label: 'T3 · Sekcam', cls: 'badge-info', full: 'Tahap 3: Telaah Operasional (Sekcam)' };
      case 4:
        return { label: 'T4 · Camat', cls: 'badge-warning', full: 'Tahap 4: Persetujuan Pejabat Berwenang (Camat PyBMT)' };
      case 5:
        return { label: 'T5 · Terbit', cls: 'badge-success', full: 'Tahap 5: Surat Izin Cuti Sah & Terbit' };
      default:
        return { label: `Tahap ${tahap}`, cls: 'badge-neutral', full: `Tahap ${tahap}` };
    }
  };

  const handleOpenCekBerkas = (row: (typeof cutiRows)[0]) => {
    if (row.related) {
      setSelectedCekUsulan(row.related);
    } else {
      setSelectedCekUsulan({
        id: row.usulanId,
        jenis: 'cuti',
        nip: row.nip,
        nama: row.nama,
        pangkat: row.pangkat,
        golongan: row.golongan,
        jabatan: row.jabatan,
        tmtTarget: row.rentangTanggal,
        sisaHari: row.durasiHari,
        tahap: row.tahap,
        status: row.isComplete ? 'Disetujui Camat' : 'Verifikasi Berkas',
        berkas: row.dokumenList,
      });
    }
    setCekModalOpen(true);
  };

  const handleOpenTolakModal = (row: (typeof cutiRows)[0]) => {
    if (row.related) {
      setSelectedTolakUsulan(row.related);
    } else {
      setSelectedTolakUsulan({
        id: row.usulanId,
        jenis: 'cuti',
        nip: row.nip,
        nama: row.nama,
        pangkat: row.pangkat,
        golongan: row.golongan,
        jabatan: row.jabatan,
        tmtTarget: row.rentangTanggal,
        sisaHari: row.durasiHari,
        tahap: row.tahap,
        status: 'Perlu Perbaikan',
        berkas: [],
      });
    }
    setTolakModalOpen(true);
  };

  const handleBroadcastNotifikasi = (targetNips: string[], saluran: string, pesan: string) => {
    setToastNotif(
      `Pemberitahuan Cuti dan Izin via ${saluran.toUpperCase()} berhasil dikirimkan kepada ${targetNips.length} pegawai ASN!`,
    );
    setTimeout(() => setToastNotif(null), 5000);
  };

  return (
    <div style={{ display: 'grid', gap: '20px', width: '100%', minWidth: 0 }}>
      {/* Header Papan Cuti dan Izin */}
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--hairline)',
          borderRadius: 'var(--r-md)',
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="eyebrow" style={{ fontSize: '11px' }}>
              Subbagian Umum &amp; Kepegawaian · Kecamatan Tamalate
            </span>
            <span className="badge badge-info tabular" style={{ fontSize: '10.5px' }}>
              Peran: {currentRoleLabel} ({currentRoleName})
            </span>
          </div>
          <h2 className="heading" style={{ fontSize: '20px', margin: 0 }}>
            Papan Pengendalian Cuti dan Izin Pegawai ASN
          </h2>
          <p className="caption" style={{ margin: '4px 0 0', maxWidth: '82ch' }}>
            Pemantauan hak dan permohonan cuti berdasarkan Peraturan BKN No. 24 Tahun 2017 jo. Peraturan BKN
            No. 7 Tahun 2021 dan UU No. 20 Tahun 2023. Perhitungan kuota hak cuti tahunan, validasi dokumen
            pendukung, dan alur vertikal persetujuan Camat selaku Pejabat Yang Berwenang Memberikan Cuti (PyBMT).
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Tombol Cek Formulir Cuti (Membuka Modal Pratinjau Template Resmi 8 Tabel BKN) */}
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setCekFormulirModalOpen(true)}
            title="Buka pratinjau lembar Formulir Permintaan dan Pemberian Cuti Resmi (8 Tabel BKN)"
          >
            <i className="ph ph-file-text" />
            <span>Cek Formulir Cuti (8 Tabel BKN)</span>
          </button>

          {/* Tombol Kostumisasi Template Cuti */}
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setTemplateModalOpen(true)}
            title="Kostumisasi field dan parameter formulir cuti"
          >
            <i className="ph ph-sliders" />
            <span>Kostumisasi Template</span>
          </button>

          {/* Tombol Notifikasi Pengingat Massal */}
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setNotifModalOpen(true)}
            title="Kirim pengingat atau konfirmasi cuti kepada pemohon"
          >
            <i className="ph ph-broadcast" />
            <span>Kirim Notifikasi</span>
          </button>
        </div>
      </div>

      {/* Banner 4 Pilar Regulasi Resmi Cuti ASN */}
      <div
        style={{
          background: '#f8fafc',
          border: '1px solid #cbd5e1',
          borderRadius: 'var(--r-sm)',
          padding: '14px 18px',
          fontSize: '12px',
          color: '#334155',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '12px',
        }}
      >
        <div>
          <strong style={{ color: '#0f172a' }}>1. Dasar Regulasi Resmi:</strong>
          <div>Peraturan BKN No. 24/2017 jo. No. 7/2021, PP No. 11/2017 jo. No. 17/2020, UU No. 20/2023.</div>
        </div>
        <div>
          <strong style={{ color: '#0f172a' }}>2. Cuti Tahunan &amp; Akumulasi:</strong>
          <div>Hak 12 hari kerja/tahun pasca 1 tahun kerja. Akumulasi sisa N-1 &amp; N-2 maks. 18 hari kerja.</div>
        </div>
        <div>
          <strong style={{ color: '#0f172a' }}>3. Cuti Sakit &amp; Alasan Penting:</strong>
          <div>Sakit 1-14 hari (surat dokter faskes), &gt;14 hari (tim penguji kesehatan). CAP maks. 1 bulan.</div>
        </div>
        <div>
          <strong style={{ color: '#0f172a' }}>4. Cuti Besar, Melahirkan &amp; CLTN:</strong>
          <div>Cuti besar min. 5 thn kerja (3 bln). Melahirkan 3 bln. CLTN wajib nota persetujuan Kepala BKN.</div>
        </div>
      </div>

      {/* Ringkasan Metrik Kuota & Permohonan Cuti */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '14px',
        }}
      >
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--hairline)',
            borderRadius: 'var(--r-md)',
            padding: '14px 16px',
          }}
        >
          <span className="caption" style={{ fontSize: '11px', textTransform: 'uppercase' }}>
            Permohonan Aktif Terjadwal
          </span>
          <div
            className="heading tabular"
            style={{ fontSize: '22px', margin: '4px 0 2px', color: 'var(--accent)' }}
          >
            {cutiRows.length} Permohonan
          </div>
          <span className="caption" style={{ fontSize: '11px' }}>
            Meliputi Cuti Tahunan, Sakit, &amp; CAP
          </span>
        </div>

        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--hairline)',
            borderRadius: 'var(--r-md)',
            padding: '14px 16px',
          }}
        >
          <span className="caption" style={{ fontSize: '11px', textTransform: 'uppercase' }}>
            Menunggu Validasi Kasubag / Sekcam
          </span>
          <div
            className="heading tabular"
            style={{ fontSize: '22px', margin: '4px 0 2px', color: 'var(--warn, #d97706)' }}
          >
            {cutiRows.filter((r) => r.tahap < 4).length} Pegawai
          </div>
          <span className="caption" style={{ fontSize: '11px' }}>
            Pemeriksaan pelimpahan tugas &amp; berkas
          </span>
        </div>

        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--hairline)',
            borderRadius: 'var(--r-md)',
            padding: '14px 16px',
          }}
        >
          <span className="caption" style={{ fontSize: '11px', textTransform: 'uppercase' }}>
            Disetujui Camat (PyBMT)
          </span>
          <div
            className="heading tabular"
            style={{ fontSize: '22px', margin: '4px 0 2px', color: 'var(--success, #16a34a)' }}
          >
            {cutiRows.filter((r) => r.tahap >= 4).length} Pegawai
          </div>
          <span className="caption" style={{ fontSize: '11px' }}>
            Surat Izin Cuti resmi terbit sah
          </span>
        </div>

        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--hairline)',
            borderRadius: 'var(--r-md)',
            padding: '14px 16px',
          }}
        >
          <span className="caption" style={{ fontSize: '11px', textTransform: 'uppercase' }}>
            Rata-Rata Kuota Cuti Tahunan (N)
          </span>
          <div
            className="heading tabular"
            style={{ fontSize: '22px', margin: '4px 0 2px', color: '#0284c7' }}
          >
            11,2 Hari
          </div>
          <span className="caption" style={{ fontSize: '11px' }}>
            Kapasitas operasional kantor terjaga 94%
          </span>
        </div>
      </div>

      {/* Filter Tabs & Tabel Board Cuti (6 Kolom Proporsional, Bebas Overflow) */}
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--hairline)',
          borderRadius: 'var(--r-md)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '14px 20px',
            borderBottom: '1px solid var(--hairline)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
            background: 'var(--surface-soft)',
          }}
        >
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              className={`chip ${filterMode === 'semua' ? 'is-on' : ''}`}
              onClick={() => setFilterMode('semua')}
            >
              Semua Permohonan ({cutiRows.length})
            </button>
            <button
              type="button"
              className={`chip ${filterMode === 'tahunan' ? 'is-on' : ''}`}
              onClick={() => setFilterMode('tahunan')}
            >
              Cuti Tahunan ({cutiRows.filter((r) => r.jenisCuti.toLowerCase().includes('tahunan')).length})
            </button>
            <button
              type="button"
              className={`chip ${filterMode === 'sakit' ? 'is-on' : ''}`}
              onClick={() => setFilterMode('sakit')}
            >
              Cuti Sakit ({cutiRows.filter((r) => r.jenisCuti.toLowerCase().includes('sakit')).length})
            </button>
            <button
              type="button"
              className={`chip ${filterMode === 'alasan_penting' ? 'is-on' : ''}`}
              onClick={() => setFilterMode('alasan_penting')}
            >
              Alasan Penting (CAP) ({cutiRows.filter((r) => r.jenisCuti.toLowerCase().includes('alasan')).length})
            </button>
          </div>

          <span className="caption" style={{ fontWeight: 500 }}>
            Total Menampilkan: {filteredRows.length} Permohonan
          </span>
        </div>

        <div className="data-table-scroll">
          <style>{`
            .board-table thead th { padding: 8px 10px !important; font-size: 10.5px !important; }
            .board-table tbody td { padding: 9px 10px !important; font-size: 12px !important; }
          `}</style>
          <table className="data-table board-table" style={{ width: '100%', fontSize: '12px' }}>
            <thead>
              <tr>
                <th style={{ width: '36px', textAlign: 'center' }}>No</th>
                <th>Identitas Pegawai ASN</th>
                <th>Jenis Cuti &amp; Durasi</th>
                <th>Kelengkapan Berkas</th>
                <th>Tahap SOP Vertikal</th>
                <th style={{ textAlign: 'right' }}>Aksi Pelaksana</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row, idx) => {
                const stage = getStageBadge(row.tahap);
                const hasRevisi = row.related?.catatanRevisi;

                return (
                  <tr key={row.cleanNip}>
                    <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--heading)' }}>{row.nama}</div>
                      <div className="caption mono" style={{ color: 'var(--muted)', fontSize: '11px' }}>
                        NIP {row.nip} · {row.golongan}
                      </div>
                      <div className="caption" style={{ fontSize: '11px', color: 'var(--body)' }}>
                        {row.jabatan}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                        <span style={{ fontWeight: 600, color: 'var(--accent)', fontSize: '12px' }}>
                          {row.jenisCuti}
                        </span>
                        <span className="badge badge-info" style={{ fontSize: '10px', height: '20px', padding: '0 6px' }}>
                          {row.durasiHari} Hari Kerja
                        </span>
                      </div>
                      <div className="caption mono" style={{ fontSize: '10.5px', marginBottom: '3px' }}>
                        {row.rentangTanggal}
                      </div>
                      <div className="caption" style={{ fontSize: '10px', color: 'var(--muted)' }}>
                        Sisa Cuti N: <strong style={{ color: 'var(--heading)' }}>{row.sisaCutiN} hari</strong> (N-1: {row.sisaCutiN1} hr)
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span className="tabular mono" style={{ fontWeight: 600, fontSize: '11.5px' }}>
                          {row.lengkapCount}/{row.totalBerkas}
                        </span>
                        <span className={`badge ${row.isComplete ? 'badge-ok' : 'badge-warn'}`} style={{ fontSize: '10px', height: '20px', padding: '0 6px' }}>
                          {row.isComplete ? 'Lengkap' : 'Kurang'}
                        </span>
                      </div>
                      <div className="caption" style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '2px' }}>
                        4 Dokumen Sah BKN
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span className={`badge ${stage.cls}`} style={{ fontSize: '10.5px', height: '20px', padding: '0 7px', width: 'fit-content' }} title={stage.full}>
                          {stage.label}
                        </span>
                        {hasRevisi ? (
                          <span className="badge badge-danger" style={{ fontSize: '9.5px', height: '18px', padding: '0 5px', width: 'fit-content' }}>
                            <i className="ph ph-warning" style={{ marginRight: '2px' }} />
                            Revisi
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '4px', alignItems: 'center', justifyContent: 'flex-end' }}>
                        {/* Tombol Lonceng Pengingat */}
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs"
                          style={{ padding: '0 6px', height: '26px' }}
                          title="Kirim pengingat atau konfirmasi status cuti ke ASN"
                          onClick={() => setNotifModalOpen(true)}
                        >
                          <i className="ph ph-bell" />
                        </button>

                        {/* Tombol Cek Berkas (Buka Modal Preview Dokumen PDF Satu per Satu) */}
                        <button
                          type="button"
                          className="btn btn-secondary btn-xs"
                          style={{ height: '26px', padding: '0 8px', fontSize: '11px', whiteSpace: 'nowrap' }}
                          onClick={() => handleOpenCekBerkas(row)}
                          title="Periksa berkas fisik dan lembar preview formulir cuti satu per satu"
                        >
                          <i className="ph ph-files" />
                          <span>Cek Berkas</span>
                        </button>

                        {/* Tombol Kembalikan Berkas Berjenjang */}
                        {row.tahap > 1 && currentRoleKey !== 'operator' && onRevertUsulan ? (
                          <button
                            type="button"
                            className="btn btn-xs"
                            style={{ height: '26px', padding: '0 6px', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5' }}
                            title="Kembalikan berkas ke tahapan sebelumnya untuk perbaikan"
                            onClick={() => handleOpenTolakModal(row)}
                          >
                            <i className="ph ph-arrow-u-up-left" />
                          </button>
                        ) : null}

                        {/* Tombol Validasi / Majukan Tahap SOP */}
                        {row.tahap < 5 ? (
                          <button
                            type="button"
                            className="btn btn-accent btn-xs"
                            style={{ height: '26px', padding: '0 8px', fontSize: '11px', whiteSpace: 'nowrap' }}
                            title="Validasi dan majukan ke tahap persetujuan berikutnya"
                            onClick={async () => {
                              if (onAdvanceUsulan) {
                                await onAdvanceUsulan(row.usulanId);
                                setToastNotif(`Permohonan cuti ${row.nama} berhasil divalidasi ke tahap berikutnya!`);
                                setTimeout(() => setToastNotif(null), 4000);
                              }
                            }}
                          >
                            <i className="ph ph-check" />
                            <span>Validasi</span>
                          </button>
                        ) : (
                          /* Jika tahap 5: Cetak Surat Izin Cuti Sah */
                          <button
                            type="button"
                            className="btn btn-primary btn-xs"
                            style={{ height: '26px', padding: '0 8px', fontSize: '11px', whiteSpace: 'nowrap' }}
                            title="Surat Izin Cuti telah disahkan Camat. Buka lembar cetak resmi"
                            onClick={() => setCekFormulirModalOpen(true)}
                          >
                            <i className="ph ph-printer" />
                            <span>Surat Cuti</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          MODAL CEK FORMULIR CUTI RESMI (8 TABEL BKN)
          (Hanya tampil saat tombol 'Cek Formulir Cuti' diklik)
          ========================================================================= */}
      {cekFormulirModalOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            overflowY: 'auto',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setCekFormulirModalOpen(false);
          }}
        >
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--hairline)',
              borderRadius: 'var(--r-md)',
              boxShadow: 'var(--shadow-lift, 0 25px 50px -12px rgba(0, 0, 0, 0.25))',
              width: '100%',
              maxWidth: '920px',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              animation: 'fadeIn 0.2s ease-out',
            }}
          >
            {/* Header Modal Formulir */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--hairline)',
                background: 'var(--surface-sunken)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                  <span className="eyebrow" style={{ fontSize: '11px' }}>
                    Template Standar BKN · Peraturan BKN No. 24/2017
                  </span>
                  <span className="badge badge-info" style={{ fontSize: '10.5px' }}>
                    Format 8 Tabel Resmi
                  </span>
                </div>
                <h3 className="heading" style={{ fontSize: '17px', margin: 0 }}>
                  Formulir Permintaan dan Pemberian Cuti Pegawai ASN
                </h3>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setTemplateModalOpen(true)}
                  title="Kostumisasi field template cuti"
                >
                  <i className="ph ph-sliders" />
                  <span>Kostumisasi Template</span>
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => window.print()}
                  title="Cetak lembar formulir cuti"
                >
                  <i className="ph ph-printer" />
                  <span>Cetak Formulir</span>
                </button>
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => setCekFormulirModalOpen(false)}
                  aria-label="Tutup pratinjau formulir"
                >
                  <i className="ph ph-x" style={{ fontSize: '18px' }} />
                </button>
              </div>
            </div>

            {/* Kontainer Lembar Fisik Formulir 8 Tabel */}
            <div
              style={{
                padding: '24px',
                background: '#e2e8f0',
                overflowY: 'auto',
                flex: 1,
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: '100%',
                  maxWidth: '820px',
                  background: '#ffffff',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  borderRadius: '4px',
                  padding: '28px 32px',
                  boxSizing: 'border-box',
                }}
              >
                <SuratCutiSheet />
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Modal Pemeriksaan Dokumen Cuti (Dilengkapi Preview PDF Satu per Satu & Validasi SOP) */}
      <CekBerkasModal
        isOpen={cekModalOpen}
        onClose={() => setCekModalOpen(false)}
        usulan={selectedCekUsulan}
        onToggleBerkas={onToggleBerkas}
        onAdvanceUsulan={onAdvanceUsulan}
        onRevertUsulan={onRevertUsulan}
        currentRoleKey={currentRoleKey}
        currentRoleLabel={currentRoleLabel}
        onOpenPackPdf={() => setBulkPackModalOpen(true)}
      />

      {/* Modal Kembalikan Berkas Berjenjang (Revisi SOP) */}
      <TolakRevisiModal
        isOpen={tolakModalOpen}
        onClose={() => setTolakModalOpen(false)}
        usulan={selectedTolakUsulan}
        currentRoleLabel={currentRoleLabel}
        onConfirmRevert={async (uId: string, catatan: string) => {
          if (onRevertUsulan) {
            await onRevertUsulan(uId, catatan);
            setToastNotif(`Berkas permohonan cuti dikembalikan dengan catatan: "${catatan}"`);
            setTimeout(() => setToastNotif(null), 5000);
          }
        }}
      />

      {/* Modal Notifikasi Massal */}
      <NotifikasiMassalModal
        isOpen={notifModalOpen}
        onClose={() => setNotifModalOpen(false)}
        pegawaiList={cutiRows.map((r) => ({
          nip: r.nip,
          nama: r.nama,
          golongan: r.golongan,
          jabatan: r.jabatan,
          isUrgent: r.tahap < 3,
          isComplete: r.isComplete,
        }))}
        jenisUsulan="Cuti dan Izin"
        onSendNotifikasi={handleBroadcastNotifikasi}
      />

      {/* Modal Pack 1 PDF Massal */}
      <BulkPackModal
        isOpen={bulkPackModalOpen}
        onClose={() => setBulkPackModalOpen(false)}
        items={cutiRows.map((r) => ({
          id: r.usulanId,
          nip: r.nip,
          nama: r.nama,
          golongan: r.golongan,
          pangkat: r.pangkat,
          jabatan: r.jabatan,
          tmtTarget: r.rentangTanggal,
          lengkapCount: r.lengkapCount,
          totalBerkas: r.totalBerkas,
          isComplete: r.isComplete,
          tahap: r.tahap,
        }))}
        jenisLayanan="Cuti dan Izin"
        actorRole={currentRoleLabel}
      />

      {/* Modal Kostumisasi Template */}
      <TemplateCustomizerModal
        isOpen={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
      />

      {/* Toast Notifikasi Aksi */}
      {toastNotif ? (
        <div
          role="status"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 10002,
            background: 'var(--heading, #0f172a)',
            color: '#ffffff',
            padding: '12px 18px',
            borderRadius: 'var(--r-sm)',
            boxShadow: 'var(--shadow-lift)',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <i className="ph ph-check-circle" style={{ fontSize: '18px', color: '#38bdf8' }} />
          <span>{toastNotif}</span>
        </div>
      ) : null}
    </div>
  );
}
