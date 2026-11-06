'use client';

import React, { useMemo, useState } from 'react';
import type { PegawaiRecord, UsulanRecord } from '@/lib/workspace-api';
import type { GlobalThresholdConfig } from './ThresholdConfigView';
import { DossierPackModal } from './DossierPackModal';
import { CekBerkasModal } from './CekBerkasModal';
import { NotifikasiMassalModal } from './NotifikasiMassalModal';
import { BulkPackModal, type BulkPackItem } from './BulkPackModal';
import { TolakRevisiModal } from './TolakRevisiModal';

interface KgbBoardViewProps {
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

export function KgbBoardView({
  pegawaiList,
  usulanList,
  config,
  currentRoleKey,
  currentRoleLabel,
  currentRoleName,
  onAdvanceUsulan,
  onRevertUsulan,
  onToggleBerkas,
}: KgbBoardViewProps): React.ReactNode {
  const [filterMode, setFilterMode] = useState<'semua' | 'urgent' | 'siap_pack'>('semua');
  const [toastNotif, setToastNotif] = useState<string | null>(null);
  const [selectedPackUsulan, setSelectedPackUsulan] = useState<UsulanRecord | null>(null);
  const [packModalOpen, setPackModalOpen] = useState(false);
  const [selectedCekUsulan, setSelectedCekUsulan] = useState<UsulanRecord | null>(null);
  const [cekModalOpen, setCekModalOpen] = useState(false);
  const [notifModalOpen, setNotifModalOpen] = useState(false);
  const [bulkPackModalOpen, setBulkPackModalOpen] = useState(false);
  const [tolakModalOpen, setTolakModalOpen] = useState(false);
  const [selectedTolakUsulan, setSelectedTolakUsulan] = useState<UsulanRecord | null>(null);

  // Filter usulan khusus jenis KGB
  const kgbUsulanList = useMemo(() => {
    return usulanList.filter(
      (u) => u.jenis?.toLowerCase() === 'kgb' || u.id.startsWith('KGB'),
    );
  }, [usulanList]);

  // Gabungkan data pegawai dengan data usulan KGB dan kalkulasi sisa hari
  const kgbRows = useMemo(() => {
    return pegawaiList.map((p, idx) => {
      const cleanNip = p.nip.replace(/\s+/g, '');
      const related = kgbUsulanList.find((u) => u.nip.replace(/\s+/g, '') === cleanNip);

      // Simulasi sisa hari hitung mundur KGB berdasarkan TMT
      const sisaHari =
        idx === 0 ? 42 : idx === 1 ? 24 : idx === 2 ? 76 : idx === 3 ? 12 : 90 + idx * 20;

      const isHit = sisaHari <= config.kgbAlertDays;
      const isUrgent = sisaHari <= config.kgbVerifikasiDays;

      const lengkapCount = related ? related.berkas.filter((b) => b.lengkap).length : 4;
      const totalBerkas = related ? related.berkas.length : 5;
      const isComplete = lengkapCount === totalBerkas;

      const usulanId = related?.id || `KGB-2026-00${idx + 1}`;
      const tahap = related?.tahap || (idx === 0 ? 5 : isUrgent ? 3 : 1);

      return {
        ...p,
        cleanNip,
        usulanId,
        sisaHari,
        isHit,
        isUrgent,
        related,
        lengkapCount,
        totalBerkas,
        isComplete,
        tahap,
      };
    });
  }, [pegawaiList, kgbUsulanList, config]);

  const urgentCount = kgbRows.filter((r) => r.isUrgent).length;
  const hitCount = kgbRows.filter((r) => r.isHit).length;
  const siapPackCount = kgbRows.filter((r) => r.isComplete).length;

  const filteredRows = useMemo(() => {
    if (filterMode === 'urgent') return kgbRows.filter((r) => r.isUrgent);
    if (filterMode === 'siap_pack') return kgbRows.filter((r) => r.isComplete);
    return kgbRows;
  }, [kgbRows, filterMode]);

  const bulkPackItems: BulkPackItem[] = useMemo(() => {
    return kgbRows.map((r) => ({
      id: r.usulanId,
      nip: r.nip,
      nama: r.nama,
      pangkat: r.pangkat,
      golongan: r.golongan,
      jabatan: r.jabatan,
      tmtTarget: r.tmtKgbBerikutnya,
      lengkapCount: r.lengkapCount,
      totalBerkas: r.totalBerkas,
      isComplete: r.isComplete,
      tahap: r.tahap,
    }));
  }, [kgbRows]);

  const notifTargetList = useMemo(() => {
    return kgbRows.map((r) => ({
      nip: r.nip,
      nama: r.nama,
      jabatan: r.jabatan,
      golongan: r.golongan,
      isUrgent: r.isUrgent,
      isHit: r.isHit,
      isComplete: r.isComplete,
    }));
  }, [kgbRows]);

  const handleOpenPack = (row: (typeof kgbRows)[0]) => {
    if (row.related) {
      setSelectedPackUsulan(row.related);
    } else {
      setSelectedPackUsulan({
        id: row.usulanId,
        jenis: 'kgb',
        nip: row.nip,
        nama: row.nama,
        pangkat: row.pangkat,
        golongan: row.golongan,
        jabatan: row.jabatan,
        tmtTarget: row.tmtKgbBerikutnya,
        sisaHari: row.sisaHari,
        tahap: row.tahap,
        status: row.isComplete ? 'Siap Terbit SPKGB' : 'Pemberkasan',
        berkas: [
          { kode: 'sk-pangkat', nama: 'SK Pangkat Terakhir', lengkap: true },
          { kode: 'sk-kgb-lama', nama: 'SK KGB Terakhir', lengkap: true },
          { kode: 'skp-2-tahun', nama: 'Penilaian Kinerja (SKP) 2 Tahun Terakhir', lengkap: true },
          { kode: 'spmt', nama: 'Surat Pernyataan Melaksanakan Tugas (SPMT)', lengkap: row.isComplete },
          { kode: 'bebas-temuan', nama: 'Surat Bebas Temuan & Bebas Disiplin', lengkap: true },
        ],
      });
    }
    setPackModalOpen(true);
  };

  const handleOpenCekBerkas = (row: (typeof kgbRows)[0]) => {
    if (row.related) {
      setSelectedCekUsulan(row.related);
    } else {
      setSelectedCekUsulan({
        id: row.usulanId,
        jenis: 'kgb',
        nip: row.nip,
        nama: row.nama,
        pangkat: row.pangkat,
        golongan: row.golongan,
        jabatan: row.jabatan,
        tmtTarget: row.tmtKgbBerikutnya,
        sisaHari: row.sisaHari,
        tahap: row.tahap,
        status: row.isComplete ? 'Siap Terbit SPKGB' : 'Pemberkasan',
        berkas: [
          { kode: 'sk-pangkat', nama: 'SK Pangkat Terakhir', lengkap: true },
          { kode: 'sk-kgb-lama', nama: 'SK KGB Terakhir', lengkap: true },
          { kode: 'skp-2-tahun', nama: 'Penilaian Kinerja (SKP) 2 Tahun Terakhir', lengkap: true },
          { kode: 'spmt', nama: 'Surat Pernyataan Melaksanakan Tugas (SPMT)', lengkap: row.isComplete },
          { kode: 'bebas-temuan', nama: 'Surat Bebas Temuan & Bebas Disiplin', lengkap: true },
        ],
      });
    }
    setCekModalOpen(true);
  };

  const handleOpenTolakModal = (row: (typeof kgbRows)[0]) => {
    if (row.related) {
      setSelectedTolakUsulan(row.related);
    } else {
      setSelectedTolakUsulan({
        id: row.usulanId,
        jenis: 'kgb',
        nip: row.nip,
        nama: row.nama,
        pangkat: row.pangkat,
        golongan: row.golongan,
        jabatan: row.jabatan,
        tmtTarget: row.tmtKgbBerikutnya,
        sisaHari: row.sisaHari,
        tahap: row.tahap,
        status: 'Perlu Perbaikan',
        berkas: [],
      });
    }
    setTolakModalOpen(true);
  };

  const handleBroadcastNotifikasi = (targetNips: string[], saluran: string, pesan: string) => {
    setToastNotif(
      `Pemberitahuan massal via ${saluran.toUpperCase()} berhasil dikirimkan kepada ${targetNips.length} pegawai ASN!`,
    );
    setTimeout(() => setToastNotif(null), 5000);
  };

  const getStageBadge = (tahap: number) => {
    switch (tahap) {
      case 1:
        return { label: 'T1 · Operator', cls: 'badge-neutral', full: 'Tahap 1: Pemeriksaan (Operator)' };
      case 2:
        return { label: 'T2 · Kasubag', cls: 'badge-info', full: 'Tahap 2: Validasi (Kasubag)' };
      case 3:
        return { label: 'T3 · Sekcam', cls: 'badge-info', full: 'Tahap 3: Telaah (Sekcam)' };
      case 4:
        return { label: 'T4 · Camat', cls: 'badge-warning', full: 'Tahap 4: Persetujuan (Camat)' };
      case 5:
        return { label: 'T5 · Siap Pack', cls: 'badge-success', full: 'Tahap 5: Disetujui (Pack PDF)' };
      default:
        return { label: `Tahap ${tahap}`, cls: 'badge-neutral', full: `Tahap ${tahap}` };
    }
  };

  return (
    <div style={{ display: 'grid', gap: '20px', width: '100%', minWidth: 0 }}>
      {/* Header Papan KGB */}
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
            Papan Pengendalian Kenaikan Gaji Berkala (KGB)
          </h2>
          <p className="caption" style={{ margin: '4px 0 0', maxWidth: '78ch' }}>
            Pemantauan berkala 2 tahunan berdasarkan PP No. 7/1977 jo. PP No. 5/2024. Sistem secara
            otomatis menghitung sisa hari, memicu peringatan H-{config.kgbAlertDays} hari,
            memvalidasi berkas, dan memaketkan dokumen menjadi 1 pack PDF resmi untuk diajukan ke BPKAD.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setBulkPackModalOpen(true)}
            title="Pilih ASN dan kemas berkas dokumen menjadi 1 pack PDF kolektif resmi"
          >
            <i className="ph ph-file-pdf" />
            <span>Pack 1 PDF (Massal)</span>
          </button>

          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setNotifModalOpen(true)}
            title="Buka panel pengiriman peringatan massal dengan opsi audiens dan saluran komunikasi"
          >
            <i className="ph ph-broadcast" />
            <span>Kirim Notifikasi Peringatan Massal</span>
          </button>
        </div>
      </div>

      {/* Banner Regulasi Resmi KGB 2026 */}
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
          <strong style={{ color: '#0f172a' }}>Dasar Regulasi:</strong>
          <div>PP No. 7 Tahun 1977 jo. PP No. 5 Tahun 2024 (Penyesuaian Gaji Pokok PNS).</div>
        </div>
        <div>
          <strong style={{ color: '#0f172a' }}>Syarat Substantif:</strong>
          <div>Masa Kerja Golongan genap 2 tahun, SKP 2 tahun predikat minimal "Baik", bebas sanksi.</div>
        </div>
        <div>
          <strong style={{ color: '#0f172a' }}>Timeframe Terprogram:</strong>
          <div>Alert H-{config.kgbAlertDays} hari, Batas Verifikasi H-{config.kgbVerifikasiDays} hari, Terbit SPKGB H-14 hari.</div>
        </div>
      </div>

      {toastNotif ? (
        <div
          style={{
            background: 'var(--accent-subtle)',
            border: '1px solid var(--accent)',
            color: 'var(--accent)',
            padding: '12px 16px',
            borderRadius: 'var(--r-sm)',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <i className="ph ph-check-circle" style={{ fontSize: '18px' }} />
          <span>{toastNotif}</span>
        </div>
      ) : null}

      {/* Metriks Pengendalian KGB */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '12px',
          width: '100%',
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
            Total ASN dalam Radar
          </span>
          <div className="heading tabular" style={{ fontSize: '22px', margin: '4px 0 2px' }}>
            {kgbRows.length} Pegawai
          </div>
          <span className="caption" style={{ fontSize: '11px' }}>
            Masa kerja 2 tahunan terpantau
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
            Mendekati Ambang Batas (≤{config.kgbAlertDays} Hari)
          </span>
          <div
            className="heading tabular"
            style={{ fontSize: '22px', margin: '4px 0 2px', color: 'var(--accent)' }}
          >
            {hitCount} Pegawai
          </div>
          <span className="caption" style={{ fontSize: '11px' }}>
            Masa pengumpulan berkas portofolio
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
            Batas Kritis Verifikasi (≤{config.kgbVerifikasiDays} Hari)
          </span>
          <div
            className="heading tabular"
            style={{ fontSize: '22px', margin: '4px 0 2px', color: 'var(--danger, #dc2626)' }}
          >
            {urgentCount} Pegawai
          </div>
          <span className="caption" style={{ fontSize: '11px' }}>
            Wajib verifikasi Kasubag Umpeg &amp; Sekcam
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
            Berkas Siap Dipack
          </span>
          <div
            className="heading tabular"
            style={{ fontSize: '22px', margin: '4px 0 2px', color: 'var(--success, #16a34a)' }}
          >
            {siapPackCount} Pegawai
          </div>
          <span className="caption" style={{ fontSize: '11px' }}>
            5 Dokumen lengkap berstempel digital BSrE
          </span>
        </div>
      </div>

      {/* Filter Tab & Tabel Board KGB */}
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
              Semua Pegawai ({kgbRows.length})
            </button>
            <button
              type="button"
              className={`chip ${filterMode === 'urgent' ? 'is-on' : ''}`}
              onClick={() => setFilterMode('urgent')}
            >
              Urgent &lt;= {config.kgbVerifikasiDays} Hari ({urgentCount})
            </button>
            <button
              type="button"
              className={`chip ${filterMode === 'siap_pack' ? 'is-on' : ''}`}
              onClick={() => setFilterMode('siap_pack')}
            >
              Siap Pack 1 PDF ({siapPackCount})
            </button>
          </div>

          <span className="caption" style={{ fontWeight: 500 }}>
            Total Menampilkan: {filteredRows.length} Pegawai
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
                <th>Jadwal &amp; Countdown TMT</th>
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
                        <span className="mono" style={{ fontWeight: 600, fontSize: '11.5px' }}>
                          {row.tmtKgbBerikutnya}
                        </span>
                        <span
                          className={`badge ${row.isUrgent ? 'badge-danger' : row.isHit ? 'badge-warn' : 'badge-neutral'}`}
                          style={{ fontSize: '10px', height: '20px', padding: '0 6px' }}
                        >
                          {row.sisaHari} hr
                        </span>
                      </div>
                      <div
                        style={{
                          height: '4px',
                          background: 'var(--hairline)',
                          borderRadius: '2px',
                          overflow: 'hidden',
                          marginBottom: '3px',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${Math.max(8, Math.min(100, 100 - (row.sisaHari / 120) * 100))}%`,
                            background: row.isUrgent ? 'var(--danger)' : row.isHit ? 'var(--warn)' : 'var(--success)',
                          }}
                        />
                      </div>
                      <span
                        className={`badge ${row.isHit ? 'badge-ok' : 'badge-neutral'}`}
                        style={{ fontSize: '9.5px', height: '18px', padding: '0 5px' }}
                      >
                        <i className="ph ph-bell" style={{ marginRight: '2px' }} />
                        {row.isHit ? 'Aktif' : 'Terjadwal'}
                      </span>
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
                        5 Dokumen Sah
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span className={`badge ${stage.cls}`} style={{ fontSize: '10.5px', height: '20px', padding: '0 7px', width: 'fit-content' }}>
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
                          title="Kirim pengingat ke ASN"
                          onClick={() => {
                            setNotifModalOpen(true);
                          }}
                        >
                          <i className="ph ph-bell" />
                        </button>

                        {/* Tombol Cek Berkas (Buka Modal Preview & Checklist) */}
                        <button
                          type="button"
                          className="btn btn-secondary btn-xs"
                          style={{ height: '26px', padding: '0 8px', fontSize: '11px', whiteSpace: 'nowrap' }}
                          onClick={() => handleOpenCekBerkas(row)}
                          title="Periksa dokumen fisik satu per satu dan lakukan validasi SOP"
                        >
                          <i className="ph ph-files" />
                          <span>Cek Berkas</span>
                        </button>

                        {/* Tombol Kembalikan Berkas Berjenjang (Hanya jika tahap > 1 dan bukan operator murni) */}
                        {row.tahap > 1 && currentRoleKey !== 'operator' && onRevertUsulan ? (
                          <button
                            type="button"
                            className="btn btn-xs"
                            style={{ height: '26px', padding: '0 6px', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5' }}
                            title="Kembalikan berkas ke tahapan sebelumnya untuk revisi"
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
                            title="Validasi dan majukan ke tahap SOP berikutnya"
                            onClick={async () => {
                              if (onAdvanceUsulan) {
                                await onAdvanceUsulan(row.usulanId);
                                setToastNotif(`Berkas KGB ${row.nama} berhasil divalidasi ke tahap berikutnya!`);
                                setTimeout(() => setToastNotif(null), 4000);
                              }
                            }}
                          >
                            <i className="ph ph-check" />
                            <span>Validasi</span>
                          </button>
                        ) : (
                          /* Jika sudah tahap 5 (disetujui Camat): Tombol Pack 1 PDF oleh Operator */
                          <button
                            type="button"
                            className="btn btn-primary btn-xs"
                            style={{ height: '26px', padding: '0 8px', fontSize: '11px', whiteSpace: 'nowrap' }}
                            title="Berkas telah disetujui Camat. Kemas 1 pack PDF resmi"
                            onClick={() => handleOpenPack(row)}
                          >
                            <i className="ph ph-file-pdf" />
                            <span>Pack 1 PDF</span>
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

      {/* Modal Pemeriksaan Dokumen KGB (Dilengkapi Preview Dokumen PDF Satu per Satu) */}
      <CekBerkasModal
        isOpen={cekModalOpen}
        onClose={() => setCekModalOpen(false)}
        usulan={selectedCekUsulan}
        onToggleBerkas={onToggleBerkas}
        onAdvanceUsulan={onAdvanceUsulan}
        onRevertUsulan={onRevertUsulan}
        currentRoleKey={currentRoleKey}
        currentRoleLabel={currentRoleLabel}
        onOpenPackPdf={(u) => {
          setSelectedPackUsulan(u);
          setPackModalOpen(true);
        }}
      />

      {/* Modal Single Dossier Pack 1 PDF */}
      <DossierPackModal
        isOpen={packModalOpen}
        onClose={() => setPackModalOpen(false)}
        usulan={selectedPackUsulan}
        actorRole={currentRoleLabel}
      />

      {/* Modal Bulk Pack PDF Massal (Memilih Pemilik Dokumen Tertentu) */}
      <BulkPackModal
        isOpen={bulkPackModalOpen}
        onClose={() => setBulkPackModalOpen(false)}
        items={bulkPackItems}
        jenisLayanan="KGB"
        actorRole={currentRoleLabel}
      />

      {/* Modal Notifikasi Peringatan Massal dengan Opsi Sasaran */}
      <NotifikasiMassalModal
        isOpen={notifModalOpen}
        onClose={() => setNotifModalOpen(false)}
        pegawaiList={notifTargetList}
        jenisUsulan="KGB"
        onSendNotifikasi={handleBroadcastNotifikasi}
      />

      {/* Modal Tolak / Kembalikan Berkas Berjenjang */}
      <TolakRevisiModal
        isOpen={tolakModalOpen}
        onClose={() => setTolakModalOpen(false)}
        usulan={selectedTolakUsulan}
        currentRoleLabel={currentRoleLabel}
        onConfirmRevert={async (uId, catatan) => {
          if (onRevertUsulan) {
            await onRevertUsulan(uId, catatan);
            setToastNotif(`Berkas berhasil dikembalikan ke tahapan sebelumnya dengan catatan.`);
            setTimeout(() => setToastNotif(null), 4000);
          }
        }}
      />
    </div>
  );
}
