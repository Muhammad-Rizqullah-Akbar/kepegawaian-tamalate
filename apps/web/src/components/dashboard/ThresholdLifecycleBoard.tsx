'use client';

import React, { useMemo, useState } from 'react';
import type { PegawaiRecord, UsulanRecord } from '@/lib/workspace-api';
import { DossierPackModal } from './DossierPackModal';

export interface ThresholdConfig {
  kgbIntervalYears: number;
  kgbAlertDays: number;
  kpAlertDays: number;
  kpCycleCount: number;
  pensiunBupYears: number;
  pensiunAlertMonths: number;
  radiusMeter: number;
  batasAbsenHari: number;
}

interface ThresholdLifecycleBoardProps {
  pegawaiList: PegawaiRecord[];
  usulanList: UsulanRecord[];
  currentRoleKey: string;
  currentRoleLabel: string;
  onAdvanceUsulan?: (usulanId: string) => Promise<void>;
  onToggleBerkas?: (usulanId: string, kodeBerkas: string, lengkap: boolean) => Promise<void>;
}

export function ThresholdLifecycleBoard({
  pegawaiList,
  usulanList,
  currentRoleKey,
  currentRoleLabel,
}: ThresholdLifecycleBoardProps): React.ReactNode {
  // State Parameter Threshold yang dapat dikustomisasi
  const [config, setConfig] = useState<ThresholdConfig>({
    kgbIntervalYears: 2,
    kgbAlertDays: 60,
    kpAlertDays: 90,
    kpCycleCount: 6,
    pensiunBupYears: 58,
    pensiunAlertMonths: 15,
    radiusMeter: 150,
    batasAbsenHari: 5,
  });

  const [filterTab, setFilterTab] = useState<
    'semua' | 'kgb_urgent' | 'kp_urgent' | 'pensiun_urgent' | 'siap_pack'
  >('semua');
  const [showConfigPanel, setShowConfigPanel] = useState<boolean>(false);
  const [configSavedToast, setConfigSavedToast] = useState<boolean>(false);
  const [notifBroadcastToast, setNotifBroadcastToast] = useState<string | null>(null);

  // Modal Pack PDF
  const [packModalOpen, setPackModalOpen] = useState<boolean>(false);
  const [selectedPackUsulan, setSelectedPackUsulan] = useState<UsulanRecord | null>(null);

  // Parsing & Kalkulasi Dinamis Waktu dari NIP dan TMT
  const radarItems = useMemo(() => {
    return pegawaiList.map((p, idx) => {
      // Perhitungan Pensiun dari 8 digit awal NIP (YYYYMMDD)
      const cleanNip = p.nip.replace(/\s+/g, '');
      const birthYear = parseInt(cleanNip.slice(0, 4), 10) || 1980;
      const birthMonth = parseInt(cleanNip.slice(4, 6), 10) || 1;
      const bupYear = birthYear + config.pensiunBupYears;
      const currentYear = 2026;
      const currentMonth = 6; // Simulasi Juni 2026
      const sisaBulanPensiun = Math.max(
        0,
        (bupYear - currentYear) * 12 + (birthMonth - currentMonth),
      );

      // Simulasi sisa hari KGB & Pangkat
      // Variasi deterministik untuk mendemonstrasikan status leaderboard
      const sisaHariKgb =
        idx === 0 ? 42 : idx === 1 ? 28 : idx === 2 ? 78 : idx === 3 ? 14 : 120 + (idx * 30);
      const sisaHariKp =
        idx === 1 ? 52 : idx === 2 ? 84 : idx === 3 ? 16 : 140 + (idx * 25);

      const isKgbHit = sisaHariKgb <= config.kgbAlertDays;
      const isKpHit = sisaHariKp <= config.kpAlertDays;
      const isPensiunHit = sisaBulanPensiun <= config.pensiunAlertMonths;

      // Usulan yang terhubung
      const relatedUsulan = usulanList.find(
        (u) => u.nip.replace(/\s+/g, '') === cleanNip,
      );

      // Tahap Lifecycle SOP
      let lifecycleStatus = 'MONITORING';
      let lifecycleStage = 1;
      if (relatedUsulan) {
        lifecycleStage = relatedUsulan.tahap;
        if (relatedUsulan.tahap === 1) lifecycleStatus = 'PEMBERKASAN';
        else if (relatedUsulan.tahap === 2) lifecycleStatus = 'VERIFIKASI KASUBAG';
        else if (relatedUsulan.tahap === 3) lifecycleStatus = 'TELAAH SEKCAM';
        else if (relatedUsulan.tahap === 4) lifecycleStatus = 'PENGESAHAN CAMAT';
        else if (relatedUsulan.tahap >= 5) lifecycleStatus = 'BERKAS SIAP DIPACK';
      } else if (isKgbHit || isKpHit || isPensiunHit) {
        lifecycleStatus = 'HIT THRESHOLD (NOTIFIKASI AKTIF)';
        lifecycleStage = 1;
      }

      const lengkapCount = relatedUsulan
        ? relatedUsulan.berkas.filter((b) => b.lengkap).length
        : 0;
      const totalBerkas = relatedUsulan ? relatedUsulan.berkas.length : 4;
      const isReadyToPack =
        relatedUsulan !== undefined && lengkapCount === totalBerkas && totalBerkas > 0;

      return {
        ...p,
        birthYear,
        bupYear,
        sisaBulanPensiun,
        sisaHariKgb,
        sisaHariKp,
        isKgbHit,
        isKpHit,
        isPensiunHit,
        relatedUsulan,
        lifecycleStatus,
        lifecycleStage,
        lengkapCount,
        totalBerkas,
        isReadyToPack,
      };
    });
  }, [pegawaiList, usulanList, config]);

  // Statistik Ringkasan Papan
  const kgbHitCount = radarItems.filter((r) => r.isKgbHit).length;
  const kpHitCount = radarItems.filter((r) => r.isKpHit).length;
  const pensiunHitCount = radarItems.filter((r) => r.isPensiunHit).length;
  const siapPackCount = radarItems.filter((r) => r.isReadyToPack).length;

  // Filter item yang ditampilkan
  const filteredItems = useMemo(() => {
    if (filterTab === 'kgb_urgent') return radarItems.filter((r) => r.isKgbHit);
    if (filterTab === 'kp_urgent') return radarItems.filter((r) => r.isKpHit);
    if (filterTab === 'pensiun_urgent') return radarItems.filter((r) => r.isPensiunHit);
    if (filterTab === 'siap_pack') return radarItems.filter((r) => r.isReadyToPack);
    return radarItems;
  }, [radarItems, filterTab]);

  const handleBroadcastNotif = () => {
    const totalUrgent = kgbHitCount + kpHitCount + pensiunHitCount;
    setNotifBroadcastToast(
      `Pemberitahuan resmi dikirim ke ${totalUrgent} ASN Kecamatan Tamalate yang telah mencapai batas threshold!`,
    );
    setTimeout(() => setNotifBroadcastToast(null), 5000);
  };

  const handleOpenPackModal = (item: (typeof radarItems)[0]) => {
    if (item.relatedUsulan) {
      setSelectedPackUsulan(item.relatedUsulan);
    } else {
      // Mock usulan instan jika pegawai belum punya usulan di database
      setSelectedPackUsulan({
        id: `PACK-KGB-${item.nip.slice(-4)}`,
        jenis: 'kgb',
        nip: item.nip,
        nama: item.nama,
        pangkat: item.pangkat,
        golongan: item.golongan,
        jabatan: item.jabatan,
        tmtTarget: item.tmtKgbBerikutnya,
        sisaHari: item.sisaHariKgb,
        tahap: 4,
        status: 'Persetujuan Pengemasan Berkas',
        berkas: [
          { kode: 'sk-pangkat', nama: 'SK Pangkat Terakhir', lengkap: true },
          { kode: 'sk-kgb-lama', nama: 'SK KGB Terakhir', lengkap: true },
          { kode: 'skp-2-tahun', nama: 'Penilaian SKP 2 Tahun Bernilai Baik', lengkap: true },
          { kode: 'spmt', nama: 'Surat Pernyataan Melaksanakan Tugas (SPMT)', lengkap: true },
        ],
      });
    }
    setPackModalOpen(true);
  };

  return (
    <section style={{ display: 'grid', gap: '20px', width: '100%', minWidth: 0 }}>
      {/* Header Utama Papan Lifecycle */}
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
              Papan Pemantauan Lifecycle ASN · Kecamatan Tamalate
            </span>
            <span className="badge badge-info tabular" style={{ fontSize: '10.5px' }}>
              Peran: {currentRoleLabel}
            </span>
          </div>
          <h2 className="heading" style={{ fontSize: '20px', margin: 0 }}>
            Radar Ambang Batas (Threshold) &amp; Lifecycle Kepegawaian
          </h2>
          <p className="caption" style={{ margin: '4px 0 0', maxWidth: '75ch' }}>
            Pemantauan otomatis periodik KGB 2 tahunan, Kenaikan Pangkat 6 periode BKN, dan Batas
            Usia Pensiun. Sistem mengirimkan sinyal notifikasi awal dan mengemas seluruh berkas
            terverifikasi menjadi satu pack PDF siap kirim ke BKPSDMD Kota Makassar.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={handleBroadcastNotif}
            title="Kirim pengingat pemberkasan ke seluruh ASN yang hit threshold"
          >
            <i className="ph ph-broadcast" />
            <span>Kirim Notifikasi Peringatan</span>
          </button>

          <button
            type="button"
            className={`btn btn-sm ${showConfigPanel ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setShowConfigPanel((prev) => !prev)}
          >
            <i className="ph ph-sliders" />
            <span>{showConfigPanel ? 'Tutup Pengaturan' : 'Sesuaikan Parameter'}</span>
          </button>
        </div>
      </div>

      {/* Toast Notifikasi Berhasil Terkirim */}
      {notifBroadcastToast ? (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: 'var(--r-sm)',
            background: 'var(--accent-soft)',
            color: 'var(--accent-deep)',
            border: '1px solid var(--accent)',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="ph ph-paper-plane-tilt" style={{ fontSize: '18px' }} />
            <span>{notifBroadcastToast}</span>
          </div>
          <span className="badge badge-info">Terkirim</span>
        </div>
      ) : null}

      {/* Panel Kustomisasi Parameter Threshold (Collapsible) */}
      {showConfigPanel ? (
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--hairline)',
            borderRadius: 'var(--r-md)',
            padding: '20px 24px',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div style={{ marginBottom: '14px' }}>
            <h3 className="heading" style={{ fontSize: '16px', margin: 0 }}>
              Kustomisasi Parameter Ambang Batas (Threshold Settings)
            </h3>
            <p className="caption" style={{ margin: '2px 0 0' }}>
              Nilai di bawah ini menjadi acuan hitung otomatis sistem terhadap waktu pengusulan dan
              pemberian notifikasi ke pegawai:
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '14px',
              marginBottom: '16px',
            }}
          >
            <div>
              <label className="caption" style={{ fontWeight: 600 }}>
                Ambang Notifikasi KGB (Hari)
              </label>
              <input
                type="number"
                className="disp-inline-input mono"
                style={{ width: '100%', height: '36px', marginTop: '4px' }}
                value={config.kgbAlertDays}
                onChange={(e) =>
                  setConfig({ ...config, kgbAlertDays: Number(e.target.value) || 60 })
                }
              />
              <span className="caption" style={{ fontSize: '10.5px', color: 'var(--muted)' }}>
                Standar: H-60 hari sebelum TMT KGB
              </span>
            </div>

            <div>
              <label className="caption" style={{ fontWeight: 600 }}>
                Ambang Notifikasi KP BKN (Hari)
              </label>
              <input
                type="number"
                className="disp-inline-input mono"
                style={{ width: '100%', height: '36px', marginTop: '4px' }}
                value={config.kpAlertDays}
                onChange={(e) =>
                  setConfig({ ...config, kpAlertDays: Number(e.target.value) || 90 })
                }
              />
              <span className="caption" style={{ fontSize: '10.5px', color: 'var(--muted)' }}>
                Standar: H-90 hari (3 bulan sebelum periode TMT)
              </span>
            </div>

            <div>
              <label className="caption" style={{ fontWeight: 600 }}>
                Batas Usia Pensiun ASN (Tahun)
              </label>
              <input
                type="number"
                className="disp-inline-input mono"
                style={{ width: '100%', height: '36px', marginTop: '4px' }}
                value={config.pensiunBupYears}
                onChange={(e) =>
                  setConfig({ ...config, pensiunBupYears: Number(e.target.value) || 58 })
                }
              />
              <span className="caption" style={{ fontSize: '10.5px', color: 'var(--muted)' }}>
                Standar: 58 thn (Pelaksana / Administrator)
              </span>
            </div>

            <div>
              <label className="caption" style={{ fontWeight: 600 }}>
                Deteksi Awal Pensiun (Bulan)
              </label>
              <input
                type="number"
                className="disp-inline-input mono"
                style={{ width: '100%', height: '36px', marginTop: '4px' }}
                value={config.pensiunAlertMonths}
                onChange={(e) =>
                  setConfig({ ...config, pensiunAlertMonths: Number(e.target.value) || 15 })
                }
              />
              <span className="caption" style={{ fontSize: '10.5px', color: 'var(--muted)' }}>
                Standar: 15 bulan sebelum TMT BUP
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => {
                setConfigSavedToast(true);
                setTimeout(() => setConfigSavedToast(false), 3000);
              }}
            >
              <i className="ph ph-check" />
              <span>Simpan &amp; Terapkan ke Radar</span>
            </button>
          </div>

          {configSavedToast ? (
            <div
              style={{
                marginTop: '10px',
                fontSize: '12px',
                color: 'var(--success)',
                fontWeight: 500,
              }}
            >
              Parameter threshold berhasil diperbarui dan diterapkan ke seluruh kalkulasi radar!
            </div>
          ) : null}
        </div>
      ) : null}

      {/* 4 Kartu Metrik Urgensi (Leaderboard Summary) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '14px',
        }}
      >
        <div
          className="metric"
          style={{
            padding: '16px 20px',
            background: 'var(--surface)',
            border: '1px solid var(--hairline)',
            borderRadius: 'var(--r-sm)',
            cursor: 'pointer',
          }}
          onClick={() => setFilterTab('kgb_urgent')}
        >
          <div
            className="metric-value tabular"
            style={{ fontSize: '26px', fontWeight: 600, color: 'var(--heading)' }}
          >
            {kgbHitCount} ASN
          </div>
          <div className="metric-label" style={{ fontSize: '12.5px', color: 'var(--muted)' }}>
            Hit Batas KGB (&lt;= {config.kgbAlertDays} Hari)
          </div>
          <div
            className="metric-delta up tabular"
            style={{
              fontSize: '11px',
              color: kgbHitCount > 0 ? 'var(--warn)' : 'var(--success)',
              marginTop: '4px',
            }}
          >
            {kgbHitCount > 0 ? 'Perlu penerbitan SPKGB' : 'Seluruh KGB teratur'}
          </div>
        </div>

        <div
          className="metric"
          style={{
            padding: '16px 20px',
            background: 'var(--surface)',
            border: '1px solid var(--hairline)',
            borderRadius: 'var(--r-sm)',
            cursor: 'pointer',
          }}
          onClick={() => setFilterTab('kp_urgent')}
        >
          <div
            className="metric-value tabular"
            style={{ fontSize: '26px', fontWeight: 600, color: 'var(--heading)' }}
          >
            {kpHitCount} ASN
          </div>
          <div className="metric-label" style={{ fontSize: '12.5px', color: 'var(--muted)' }}>
            Hit Batas Pangkat (&lt;= {config.kpAlertDays} Hari)
          </div>
          <div
            className="metric-delta up tabular"
            style={{ fontSize: '11px', color: 'var(--accent)', marginTop: '4px' }}
          >
            6 Periode BKN 2026
          </div>
        </div>

        <div
          className="metric"
          style={{
            padding: '16px 20px',
            background: 'var(--surface)',
            border: '1px solid var(--hairline)',
            borderRadius: 'var(--r-sm)',
            cursor: 'pointer',
          }}
          onClick={() => setFilterTab('pensiun_urgent')}
        >
          <div
            className="metric-value tabular"
            style={{ fontSize: '26px', fontWeight: 600, color: 'var(--heading)' }}
          >
            {pensiunHitCount} ASN
          </div>
          <div className="metric-label" style={{ fontSize: '12.5px', color: 'var(--muted)' }}>
            Mendekati Pensiun (&lt;= {config.pensiunAlertMonths} Bulan)
          </div>
          <div
            className="metric-delta up tabular"
            style={{ fontSize: '11px', color: 'var(--body-secondary)', marginTop: '4px' }}
          >
            Persiapan DPCP &amp; Berkas
          </div>
        </div>

        <div
          className="metric"
          style={{
            padding: '16px 20px',
            background: 'var(--surface)',
            border: '1px solid var(--hairline)',
            borderRadius: 'var(--r-sm)',
            cursor: 'pointer',
          }}
          onClick={() => setFilterTab('siap_pack')}
        >
          <div
            className="metric-value tabular"
            style={{ fontSize: '26px', fontWeight: 600, color: 'var(--success)' }}
          >
            {siapPackCount} Berkas
          </div>
          <div className="metric-label" style={{ fontSize: '12.5px', color: 'var(--muted)' }}>
            Siap Pack 1 Dokumen PDF
          </div>
          <div
            className="metric-delta up tabular"
            style={{ fontSize: '11px', color: 'var(--success)', marginTop: '4px' }}
          >
            100% Berkas Lengkap &amp; Tervalidasi
          </div>
        </div>
      </div>

      {/* Tab Filter Navigasi Papan Leaderboard */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          background: 'var(--surface-soft)',
          padding: '4px',
          borderRadius: 'var(--r-pill)',
          border: '1px solid var(--hairline)',
        }}
      >
        {[
          { key: 'semua', label: `Semua ASN (${radarItems.length})`, icon: 'ph-users' },
          { key: 'kgb_urgent', label: `Prioritas KGB (${kgbHitCount})`, icon: 'ph-trend-up' },
          { key: 'kp_urgent', label: `Prioritas KP BKN (${kpHitCount})`, icon: 'ph-medal' },
          { key: 'pensiun_urgent', label: `Calon Pensiun (${pensiunHitCount})`, icon: 'ph-hourglass-low' },
          { key: 'siap_pack', label: `Siap Pack 1 PDF (${siapPackCount})`, icon: 'ph-file-pdf' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`chip ${filterTab === tab.key ? 'is-on' : ''}`}
            onClick={() => setFilterTab(tab.key as typeof filterTab)}
          >
            <i className={`ph ${tab.icon}`} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Daftar Kartu Radar Urgensi & Lifecycle Pegawai */}
      <div style={{ display: 'grid', gap: '12px', width: '100%', minWidth: 0 }}>
        {filteredItems.map((item) => (
          <div
            key={item.nip}
            style={{
              background: 'var(--surface)',
              border: `1px solid ${item.isReadyToPack ? 'var(--success)' : item.isKgbHit || item.isKpHit ? 'var(--accent)' : 'var(--hairline)'}`,
              borderRadius: 'var(--r-md)',
              padding: '18px 20px',
              display: 'grid',
              gap: '14px',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            {/* Baris Atas: Info Pegawai & Tahap SOP */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                minWidth: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: 'var(--r-pill)',
                    background: 'var(--accent-soft)',
                    color: 'var(--accent-deep)',
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 600,
                    fontSize: '14px',
                    flexShrink: 0,
                  }}
                >
                  {item.nama.slice(0, 2).toUpperCase()}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div
                    className="heading"
                    style={{
                      fontSize: '15.5px',
                      overflowWrap: 'anywhere',
                      wordBreak: 'break-word',
                    }}
                  >
                    {item.nama}
                  </div>
                  <div className="caption" style={{ color: 'var(--muted)' }}>
                    NIP {item.nip} · Gol. {item.golongan} ({item.pangkat}) · {item.jabatan}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span
                  className={`badge ${item.isReadyToPack ? 'badge-ok' : item.isKgbHit ? 'badge-warn' : 'badge-neutral'}`}
                >
                  <i className="ph ph-flag" />
                  {item.lifecycleStatus}
                </span>

                <span className="badge badge-info tabular">
                  Tahap {item.lifecycleStage}/5 SOP
                </span>
              </div>
            </div>

            {/* Baris Tengah: Tiga Radar Countdown (KGB, KP, Pensiun) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '10px',
                padding: '12px',
                background: 'var(--surface-soft)',
                borderRadius: 'var(--r-sm)',
                fontSize: '12px',
              }}
            >
              {/* Radar KGB */}
              <div style={{ display: 'grid', gap: '2px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                  <span>Kenaikan Gaji Berkala</span>
                  <span className="mono" style={{ fontWeight: 600 }}>
                    {item.sisaHariKgb} Hari Lagi
                  </span>
                </div>
                <div style={{ fontWeight: 500 }}>
                  TMT: {item.tmtKgbBerikutnya}
                </div>
                <div
                  style={{
                    height: '5px',
                    background: '#e2e8f0',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    marginTop: '4px',
                  }}
                >
                  <div
                    style={{
                      width: `${Math.max(5, Math.min(100, 100 - (item.sisaHariKgb / 120) * 100))}%`,
                      height: '100%',
                      background: item.isKgbHit ? '#eab308' : '#22c55e',
                    }}
                  />
                </div>
              </div>

              {/* Radar Kenaikan Pangkat */}
              <div style={{ display: 'grid', gap: '2px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                  <span>Kenaikan Pangkat BKN</span>
                  <span className="mono" style={{ fontWeight: 600 }}>
                    {item.sisaHariKp} Hari Lagi
                  </span>
                </div>
                <div style={{ fontWeight: 500 }}>
                  TMT: {item.tmtPangkatBerikutnya} (Periode 6)
                </div>
                <div
                  style={{
                    height: '5px',
                    background: '#e2e8f0',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    marginTop: '4px',
                  }}
                >
                  <div
                    style={{
                      width: `${Math.max(5, Math.min(100, 100 - (item.sisaHariKp / 180) * 100))}%`,
                      height: '100%',
                      background: item.isKpHit ? '#3b82f6' : '#94a3b8',
                    }}
                  />
                </div>
              </div>

              {/* Radar Pensiun BUP */}
              <div style={{ display: 'grid', gap: '2px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                  <span>Batas Usia Pensiun ({config.pensiunBupYears} Thn)</span>
                  <span className="mono" style={{ fontWeight: 600 }}>
                    {item.sisaBulanPensiun} Bulan Lagi
                  </span>
                </div>
                <div style={{ fontWeight: 500 }}>
                  TMT BUP: 01-08-{item.bupYear}
                </div>
                <div
                  style={{
                    height: '5px',
                    background: '#e2e8f0',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    marginTop: '4px',
                  }}
                >
                  <div
                    style={{
                      width: `${Math.max(5, Math.min(100, 100 - (item.sisaBulanPensiun / 240) * 100))}%`,
                      height: '100%',
                      background: item.isPensiunHit ? '#ef4444' : '#64748b',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Baris Bawah: Status Checklist Berkas & Tombol Pack 1 PDF */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                minWidth: 0,
              }}
            >
              <div style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="caption">Kelengkapan Berkas Persyaratan:</span>
                <span
                  className="badge badge-info tabular"
                  style={{ fontWeight: 600 }}
                >
                  {item.lengkapCount}/{item.totalBerkas} Dokumen Lengkap
                </span>
                {item.isReadyToPack ? (
                  <span className="badge badge-ok">
                    <i className="ph ph-check" /> Siap Dipack
                  </span>
                ) : (
                  <span className="badge badge-warn">
                    <i className="ph ph-clock" /> Perlu Diverifikasi
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {/* Tombol Periksa / Buka Pack 1 PDF */}
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleOpenPackModal(item)}
                >
                  <i className="ph ph-file-pdf" />
                  <span>Satukan &amp; Pack 1 Dokumen PDF</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Dossier Pack 1 PDF */}
      <DossierPackModal
        isOpen={packModalOpen}
        onClose={() => setPackModalOpen(false)}
        usulan={selectedPackUsulan}
        actorRole={currentRoleLabel}
      />
    </section>
  );
}
