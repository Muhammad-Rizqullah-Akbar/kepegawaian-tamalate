'use client';

import React, { useState } from 'react';

export interface GlobalThresholdConfig {
  // KGB
  kgbIntervalYears: number;
  kgbAlertDays: number;
  kgbVerifikasiDays: number;
  // Kenaikan Pangkat
  kpAlertDays: number;
  kpUnggahSiasnDays: number;
  kpCycleCount: number;
  // Pensiun
  pensiunBupPelaksanaYears: number;
  pensiunBupAdministratorYears: number;
  pensiunBupJptYears: number;
  pensiunAlertMonths: number;
  pensiunBatasBknMonths: number;
  // Presensi & Disiplin
  radiusMeter: number;
  batasAbsenHari: number;
}

export const DEFAULT_THRESHOLD_CONFIG: GlobalThresholdConfig = {
  kgbIntervalYears: 2,
  kgbAlertDays: 60,
  kgbVerifikasiDays: 30,
  kpAlertDays: 90,
  kpUnggahSiasnDays: 45,
  kpCycleCount: 6,
  pensiunBupPelaksanaYears: 58,
  pensiunBupAdministratorYears: 58,
  pensiunBupJptYears: 60,
  pensiunAlertMonths: 15,
  pensiunBatasBknMonths: 6,
  radiusMeter: 150,
  batasAbsenHari: 5,
};

interface ThresholdConfigViewProps {
  config: GlobalThresholdConfig;
  onSaveConfig: (updated: GlobalThresholdConfig) => void;
  currentRoleLabel: string;
}

export function ThresholdConfigView({
  config,
  onSaveConfig,
  currentRoleLabel,
}: ThresholdConfigViewProps): React.ReactNode {
  const [formState, setFormState] = useState<GlobalThresholdConfig>(config);
  const [toastVisible, setToastVisible] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formState);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 4000);
  };

  const handleResetDefault = () => {
    setFormState(DEFAULT_THRESHOLD_CONFIG);
    onSaveConfig(DEFAULT_THRESHOLD_CONFIG);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 4000);
  };

  return (
    <div style={{ display: 'grid', gap: '20px', width: '100%', minWidth: 0 }}>
      {/* Header Halaman Parameter Threshold */}
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
              Pusat Pengaturan Parameter Kepegawaian · Kecamatan Tamalate
            </span>
            <span className="badge badge-info tabular" style={{ fontSize: '10.5px' }}>
              Diperbarui Oleh: {currentRoleLabel}
            </span>
          </div>
          <h2 className="heading" style={{ fontSize: '20px', margin: 0 }}>
            Parameter Ambang Batas (Threshold) &amp; Timeframe Operasional
          </h2>
          <p className="caption" style={{ margin: '4px 0 0', maxWidth: '78ch' }}>
            Seluruh ambang batas hari, interval masa kerja, batas usia pensiun, dan radius presensi
            dapat dikustomisasi di sini. Perubahan parameter akan langsung didistribusikan secara
            otomatis menjadi acuan radar pada papan board KGB, board Kenaikan Pangkat, board Pensiun,
            dan modul presensi.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={handleResetDefault}
            title="Kembalikan nilai parameter ke standar BKN dan Permendagri"
          >
            <i className="ph ph-arrow-counter-clockwise" />
            <span>Pulihkan Default Regulasi</span>
          </button>
        </div>
      </div>

      {toastVisible ? (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: 'var(--r-sm)',
            background: 'var(--success-soft)',
            color: 'var(--success)',
            border: '1px solid var(--success)',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <i className="ph ph-check-circle" style={{ fontSize: '18px' }} />
          <span>
            Parameter threshold berhasil disimpan dan langsung diterapkan ke seluruh papan board
            (KGB, Kenaikan Pangkat, Pensiun, dan Presensi)!
          </span>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
        {/* Grup 1: Parameter Kenaikan Gaji Berkala (KGB) */}
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--hairline)',
            borderRadius: 'var(--r-md)',
            padding: '20px 24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--r-sm)',
                background: 'var(--accent-soft)',
                color: 'var(--accent-deep)',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <i className="ph ph-trend-up" style={{ fontSize: '18px' }} />
            </div>
            <div>
              <h3 className="heading" style={{ fontSize: '16px', margin: 0 }}>
                1. Parameter Kenaikan Gaji Berkala (KGB)
              </h3>
              <p className="caption" style={{ margin: 0 }}>
                Acuan perhitungan PP No. 7/1977 jo. PP No. 5/2024 bagi board pengendalian KGB
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
            }}
          >
            <div>
              <label className="caption" style={{ fontWeight: 600 }}>
                Interval Masa Kerja KGB (Tahun)
              </label>
              <input
                type="number"
                className="disp-inline-input mono"
                style={{ width: '100%', height: '36px', marginTop: '6px' }}
                value={formState.kgbIntervalYears}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    kgbIntervalYears: Number(e.target.value) || 2,
                  })
                }
              />
              <span className="caption" style={{ fontSize: '11px', color: 'var(--muted)' }}>
                Standar ASN: 2 tahun sekali
              </span>
            </div>

            <div>
              <label className="caption" style={{ fontWeight: 600 }}>
                Pemicu Notifikasi Peringatan (Hari Kalender)
              </label>
              <input
                type="number"
                className="disp-inline-input mono"
                style={{ width: '100%', height: '36px', marginTop: '6px' }}
                value={formState.kgbAlertDays}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    kgbAlertDays: Number(e.target.value) || 60,
                  })
                }
              />
              <span className="caption" style={{ fontSize: '11px', color: 'var(--muted)' }}>
                Standar: H-60 hari sebelum TMT KGB
              </span>
            </div>

            <div>
              <label className="caption" style={{ fontWeight: 600 }}>
                Batas Verifikasi Berkas Umpeg (Hari Kalender)
              </label>
              <input
                type="number"
                className="disp-inline-input mono"
                style={{ width: '100%', height: '36px', marginTop: '6px' }}
                value={formState.kgbVerifikasiDays}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    kgbVerifikasiDays: Number(e.target.value) || 30,
                  })
                }
              />
              <span className="caption" style={{ fontSize: '11px', color: 'var(--muted)' }}>
                Standar: H-30 hari sebelum pengiriman SPKGB ke BPKAD
              </span>
            </div>
          </div>
        </div>

        {/* Grup 2: Parameter Kenaikan Pangkat (KP) */}
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--hairline)',
            borderRadius: 'var(--r-md)',
            padding: '20px 24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--r-sm)',
                background: 'var(--accent-soft)',
                color: 'var(--accent-deep)',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <i className="ph ph-medal" style={{ fontSize: '18px' }} />
            </div>
            <div>
              <h3 className="heading" style={{ fontSize: '16px', margin: 0 }}>
                2. Parameter Kenaikan Pangkat (KP 6 Periode BKN)
              </h3>
              <p className="caption" style={{ margin: 0 }}>
                Acuan Peraturan BKN No. 4/2023 &amp; Peraturan BKN No. 4/2025 bagi board Kenaikan Pangkat
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
            }}
          >
            <div>
              <label className="caption" style={{ fontWeight: 600 }}>
                Pemicu Notifikasi KP BKN (Hari Kalender)
              </label>
              <input
                type="number"
                className="disp-inline-input mono"
                style={{ width: '100%', height: '36px', marginTop: '6px' }}
                value={formState.kpAlertDays}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    kpAlertDays: Number(e.target.value) || 90,
                  })
                }
              />
              <span className="caption" style={{ fontSize: '11px', color: 'var(--muted)' }}>
                Standar: H-90 hari (3 bulan sebelum periode TMT terdekat)
              </span>
            </div>

            <div>
              <label className="caption" style={{ fontWeight: 600 }}>
                Batas Pengunggahan SIASN / SAKTI (Hari Kalender)
              </label>
              <input
                type="number"
                className="disp-inline-input mono"
                style={{ width: '100%', height: '36px', marginTop: '6px' }}
                value={formState.kpUnggahSiasnDays}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    kpUnggahSiasnDays: Number(e.target.value) || 45,
                  })
                }
              />
              <span className="caption" style={{ fontSize: '11px', color: 'var(--muted)' }}>
                Standar: H-45 hari sebelum batas tutup usulan kota
              </span>
            </div>

            <div>
              <label className="caption" style={{ fontWeight: 600 }}>
                Jumlah Periode Kenaikan Pangkat per Tahun
              </label>
              <input
                type="number"
                className="disp-inline-input mono"
                style={{ width: '100%', height: '36px', marginTop: '6px' }}
                value={formState.kpCycleCount}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    kpCycleCount: Number(e.target.value) || 6,
                  })
                }
              />
              <span className="caption" style={{ fontSize: '11px', color: 'var(--muted)' }}>
                Februari, April, Juni, Agustus, Oktober, Desember (6 periode)
              </span>
            </div>
          </div>
        </div>

        {/* Grup 3: Parameter Usulan Pensiun */}
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--hairline)',
            borderRadius: 'var(--r-md)',
            padding: '20px 24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--r-sm)',
                background: 'var(--accent-soft)',
                color: 'var(--accent-deep)',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <i className="ph ph-hourglass-low" style={{ fontSize: '18px' }} />
            </div>
            <div>
              <h3 className="heading" style={{ fontSize: '16px', margin: 0 }}>
                3. Parameter Usulan Pensiun &amp; Batas Usia Pensiun (BUP)
              </h3>
              <p className="caption" style={{ margin: 0 }}>
                Acuan UU No. 20/2023 tentang ASN &amp; PP No. 17/2020 bagi board pemantauan pensiun
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
            }}
          >
            <div>
              <label className="caption" style={{ fontWeight: 600 }}>
                BUP Pejabat Pelaksana &amp; Administrator (Tahun)
              </label>
              <input
                type="number"
                className="disp-inline-input mono"
                style={{ width: '100%', height: '36px', marginTop: '6px' }}
                value={formState.pensiunBupPelaksanaYears}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    pensiunBupPelaksanaYears: Number(e.target.value) || 58,
                  })
                }
              />
              <span className="caption" style={{ fontSize: '11px', color: 'var(--muted)' }}>
                Standar: 58 tahun (Staf, Lurah, Kasi, Kasubag, Camat, Sekcam)
              </span>
            </div>

            <div>
              <label className="caption" style={{ fontWeight: 600 }}>
                Deteksi Dini Notifikasi DPCP (Bulan)
              </label>
              <input
                type="number"
                className="disp-inline-input mono"
                style={{ width: '100%', height: '36px', marginTop: '6px' }}
                value={formState.pensiunAlertMonths}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    pensiunAlertMonths: Number(e.target.value) || 15,
                  })
                }
              />
              <span className="caption" style={{ fontSize: '11px', color: 'var(--muted)' }}>
                Standar: 15 bulan sebelum TMT BUP
              </span>
            </div>

            <div>
              <label className="caption" style={{ fontWeight: 600 }}>
                Batas Pengusulan Berkas ke BKN (Bulan)
              </label>
              <input
                type="number"
                className="disp-inline-input mono"
                style={{ width: '100%', height: '36px', marginTop: '6px' }}
                value={formState.pensiunBatasBknMonths}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    pensiunBatasBknMonths: Number(e.target.value) || 6,
                  })
                }
              />
              <span className="caption" style={{ fontSize: '11px', color: 'var(--muted)' }}>
                Standar: H-6 bulan sebelum TMT agar SK Taspen terbit tepat waktu
              </span>
            </div>
          </div>
        </div>

        {/* Grup 4: Parameter Presensi & Disiplin Pegawai */}
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--hairline)',
            borderRadius: 'var(--r-md)',
            padding: '20px 24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--r-sm)',
                background: 'var(--accent-soft)',
                color: 'var(--accent-deep)',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <i className="ph ph-map-pin" style={{ fontSize: '18px' }} />
            </div>
            <div>
              <h3 className="heading" style={{ fontSize: '16px', margin: 0 }}>
                4. Parameter Presensi Geofence &amp; Disiplin
              </h3>
              <p className="caption" style={{ margin: 0 }}>
                Acuan validasi kehadiran apel harian dan batas toleransi absensi
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
            }}
          >
            <div>
              <label className="caption" style={{ fontWeight: 600 }}>
                Radius Geofence Kantor Camat Tamalate (Meter)
              </label>
              <input
                type="number"
                className="disp-inline-input mono"
                style={{ width: '100%', height: '36px', marginTop: '6px' }}
                value={formState.radiusMeter}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    radiusMeter: Number(e.target.value) || 150,
                  })
                }
              />
              <span className="caption" style={{ fontSize: '11px', color: 'var(--muted)' }}>
                Radius validasi kehadiran kamera ponsel (150 meter)
              </span>
            </div>

            <div>
              <label className="caption" style={{ fontWeight: 600 }}>
                Ambang Batas Tidak Hadir Sepekan (Hari Kerja)
              </label>
              <input
                type="number"
                className="disp-inline-input mono"
                style={{ width: '100%', height: '36px', marginTop: '6px' }}
                value={formState.batasAbsenHari}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    batasAbsenHari: Number(e.target.value) || 5,
                  })
                }
              />
              <span className="caption" style={{ fontSize: '11px', color: 'var(--muted)' }}>
                Batas pemicu surat panggilan pembinaan disiplin (5 hari)
              </span>
            </div>
          </div>
        </div>

        {/* Tombol Simpan Parameter */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button type="submit" className="btn btn-primary">
            <i className="ph ph-floppy-disk" />
            <span>Simpan &amp; Terapkan ke Semua Board Menu</span>
          </button>
        </div>
      </form>
    </div>
  );
}
