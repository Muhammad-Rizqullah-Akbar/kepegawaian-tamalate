'use client';

import React, { useState } from 'react';
import type { PegawaiRecord } from '@/lib/workspace-api';

interface TambahPegawaiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePegawai: (pegawai: PegawaiRecord) => void;
}

const PANGKAT_GOLONGAN_OPTIONS = [
  { pangkat: 'Juru Muda', gol: 'I/a' },
  { pangkat: 'Juru Muda Tingkat I', gol: 'I/b' },
  { pangkat: 'Juru', gol: 'I/c' },
  { pangkat: 'Juru Tingkat I', gol: 'I/d' },
  { pangkat: 'Pengatur Muda', gol: 'II/a' },
  { pangkat: 'Pengatur Muda Tingkat I', gol: 'II/b' },
  { pangkat: 'Pengatur', gol: 'II/c' },
  { pangkat: 'Pengatur Tingkat I', gol: 'II/d' },
  { pangkat: 'Penata Muda', gol: 'III/a' },
  { pangkat: 'Penata Muda Tingkat I', gol: 'III/b' },
  { pangkat: 'Penata', gol: 'III/c' },
  { pangkat: 'Penata Tingkat I', gol: 'III/d' },
  { pangkat: 'Pembina', gol: 'IV/a' },
  { pangkat: 'Pembina Tingkat I', gol: 'IV/b' },
  { pangkat: 'Pembina Utama Muda', gol: 'IV/c' },
  { pangkat: 'Pembina Utama Madya', gol: 'IV/d' },
  { pangkat: 'Pembina Utama', gol: 'IV/e' },
];

export function TambahPegawaiModal({
  isOpen,
  onClose,
  onSavePegawai,
}: TambahPegawaiModalProps): React.ReactNode {
  const [nip, setNip] = useState('');
  const [nama, setNama] = useState('');
  const [pangkatIndex, setPangkatIndex] = useState(10); // Penata (III/c)
  const [jabatan, setJabatan] = useState('Analis Kebijakan Ahli Pertama');
  const [unit, setUnit] = useState('Kecamatan Tamalate, Pemerintah Kota Makassar');
  const [tmtKgb, setTmtKgb] = useState('01-08-2026');
  const [tmtPangkat, setTmtPangkat] = useState('01-10-2026');
  const [gajiPokok, setGajiPokok] = useState(3820000);
  const [sisaCutiN, setSisaCutiN] = useState(12);
  const [sisaCutiN1, setSisaCutiN1] = useState(6);
  const [sisaCutiN2, setSisaCutiN2] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNip = nip.replace(/\s+/g, '');
    if (cleanNip.length < 18) {
      setErrorMsg('NIP harus terdiri dari minimal 18 digit angka standar BKN.');
      return;
    }
    if (!nama.trim()) {
      setErrorMsg('Nama lengkap pegawai tidak boleh kosong.');
      return;
    }

    const selectedPangkat = PANGKAT_GOLONGAN_OPTIONS[pangkatIndex] || {
      pangkat: 'Penata',
      gol: 'III/c',
    };

    const formattedNip =
      cleanNip.length === 18
        ? `${cleanNip.slice(0, 8)} ${cleanNip.slice(8, 14)} ${cleanNip.slice(14, 15)} ${cleanNip.slice(15, 18)}`
        : nip.trim();

    const newPegawai: PegawaiRecord = {
      nip: formattedNip,
      nama: nama.trim(),
      pangkat: selectedPangkat.pangkat,
      golongan: selectedPangkat.gol,
      jabatan: jabatan.trim() || 'Staf Pelaksana',
      unit: unit.trim() || 'Kecamatan Tamalate, Pemerintah Kota Makassar',
      tmtKgbBerikutnya: tmtKgb.trim() || '01-08-2026',
      tmtPangkatBerikutnya: tmtPangkat.trim() || '01-10-2026',
      tidakHadirMingguIni: 0,
      gajiPokok,
      sisaCutiN,
      sisaCutiN1,
      sisaCutiN2,
    };

    onSavePegawai(newPegawai);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--hairline)',
          borderRadius: 'var(--r-lg)',
          boxShadow: 'var(--shadow-lg, 0 20px 25px -5px rgba(0, 0, 0, 0.2))',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out',
        }}
      >
        {/* Header Modal */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--hairline)',
            background: 'var(--surface-sunken)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '12px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="eyebrow" style={{ fontSize: '11px' }}>
                Manajemen Kepegawaian ASN · Kecamatan Tamalate
              </span>
              <span className="badge badge-info" style={{ fontSize: '10.5px' }}>
                BKN &amp; Pemkot Makassar
              </span>
            </div>
            <h3 className="heading" style={{ fontSize: '18px', margin: 0 }}>
              Tambah Data Pegawai ASN Baru
            </h3>
            <p className="caption" style={{ margin: '4px 0 0' }}>
              Masukkan identitas resmi, pangkat/golongan, jabatan, dan parameter periodik pegawai.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={onClose}
            aria-label="Tutup modal"
            style={{ padding: '6px' }}
          >
            <i className="ph ph-x" style={{ fontSize: '18px' }} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
          <div style={{ padding: '20px', display: 'grid', gap: '14px' }}>
            {errorMsg ? (
              <div
                style={{
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  color: '#991B1B',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <i className="ph ph-warning-circle" style={{ fontSize: '16px' }} />
                <span>{errorMsg}</span>
              </div>
            ) : null}

            {/* Baris 1: NIP & Nama Lengkap */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
              <div>
                <label className="label" htmlFor="inpPegawaiNip">
                  NIP ASN (18 Digit) *
                </label>
                <input
                  type="text"
                  id="inpPegawaiNip"
                  required
                  placeholder="19870512 201101 1 002"
                  className="disp-textarea mono"
                  style={{ height: '38px' }}
                  value={nip}
                  onChange={(e) => {
                    setNip(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                />
              </div>

              <div>
                <label className="label" htmlFor="inpPegawaiNama">
                  Nama Lengkap beserta Gelar *
                </label>
                <input
                  type="text"
                  id="inpPegawaiNama"
                  required
                  placeholder="Rahmat Hidayat, S.STP, M.Si"
                  className="disp-textarea"
                  style={{ height: '38px' }}
                  value={nama}
                  onChange={(e) => {
                    setNama(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                />
              </div>
            </div>

            {/* Baris 2: Pangkat/Golongan & Jabatan */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
              <div>
                <label className="label" htmlFor="inpPegawaiPangkat">
                  Pangkat / Golongan Ruang *
                </label>
                <select
                  id="inpPegawaiPangkat"
                  className="disp-textarea"
                  style={{ height: '38px' }}
                  value={pangkatIndex}
                  onChange={(e) => setPangkatIndex(Number(e.target.value))}
                >
                  {PANGKAT_GOLONGAN_OPTIONS.map((opt, idx) => (
                    <option key={`${opt.pangkat}-${opt.gol}`} value={idx}>
                      {opt.pangkat} ({opt.gol})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label" htmlFor="inpPegawaiJabatan">
                  Jabatan Kedinasan *
                </label>
                <input
                  type="text"
                  id="inpPegawaiJabatan"
                  required
                  placeholder="Kepala Seksi Tata Pemerintahan"
                  className="disp-textarea"
                  style={{ height: '38px' }}
                  value={jabatan}
                  onChange={(e) => setJabatan(e.target.value)}
                />
              </div>
            </div>

            {/* Baris 3: Unit Kerja & Gaji Pokok */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
              <div>
                <label className="label" htmlFor="inpPegawaiUnit">
                  Unit Kerja *
                </label>
                <input
                  type="text"
                  id="inpPegawaiUnit"
                  required
                  className="disp-textarea"
                  style={{ height: '38px' }}
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                />
              </div>

              <div>
                <label className="label" htmlFor="inpPegawaiGaji">
                  Gaji Pokok (Rupiah)
                </label>
                <input
                  type="number"
                  id="inpPegawaiGaji"
                  className="disp-textarea mono"
                  style={{ height: '38px' }}
                  value={gajiPokok}
                  onChange={(e) => setGajiPokok(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Baris 4: TMT KGB & TMT Pangkat */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
              <div>
                <label className="label" htmlFor="inpPegawaiTmtKgb">
                  TMT KGB Berikutnya *
                </label>
                <input
                  type="text"
                  id="inpPegawaiTmtKgb"
                  placeholder="01-08-2026"
                  className="disp-textarea mono"
                  style={{ height: '38px' }}
                  value={tmtKgb}
                  onChange={(e) => setTmtKgb(e.target.value)}
                />
              </div>

              <div>
                <label className="label" htmlFor="inpPegawaiTmtKp">
                  TMT Pangkat Berikutnya *
                </label>
                <input
                  type="text"
                  id="inpPegawaiTmtKp"
                  placeholder="01-10-2026"
                  className="disp-textarea mono"
                  style={{ height: '38px' }}
                  value={tmtPangkat}
                  onChange={(e) => setTmtPangkat(e.target.value)}
                />
              </div>
            </div>

            {/* Baris 5: Kuota Cuti Tahunan (N, N-1, N-2) */}
            <div
              style={{
                padding: '12px',
                background: 'var(--surface-sunken)',
                border: '1px solid var(--hairline)',
                borderRadius: '8px',
                display: 'grid',
                gap: '8px',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--muted)' }}>
                Alokasi Kuota Cuti Tahunan (Peraturan BKN No. 7/2021)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                <div>
                  <label className="caption" htmlFor="inpCutiN" style={{ fontSize: '11px', display: 'block' }}>
                    Tahun Berjalan (N)
                  </label>
                  <input
                    type="number"
                    id="inpCutiN"
                    min={0}
                    max={12}
                    className="disp-textarea mono"
                    style={{ height: '34px', fontSize: '12px' }}
                    value={sisaCutiN}
                    onChange={(e) => setSisaCutiN(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="caption" htmlFor="inpCutiN1" style={{ fontSize: '11px', display: 'block' }}>
                    Sisa N-1
                  </label>
                  <input
                    type="number"
                    id="inpCutiN1"
                    min={0}
                    max={6}
                    className="disp-textarea mono"
                    style={{ height: '34px', fontSize: '12px' }}
                    value={sisaCutiN1}
                    onChange={(e) => setSisaCutiN1(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="caption" htmlFor="inpCutiN2" style={{ fontSize: '11px', display: 'block' }}>
                    Sisa N-2
                  </label>
                  <input
                    type="number"
                    id="inpCutiN2"
                    min={0}
                    max={6}
                    className="disp-textarea mono"
                    style={{ height: '34px', fontSize: '12px' }}
                    value={sisaCutiN2}
                    onChange={(e) => setSisaCutiN2(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div
            style={{
              padding: '14px 20px',
              borderTop: '1px solid var(--hairline)',
              background: 'var(--surface-sunken)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
            }}
          >
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Batal
            </button>
            <button type="submit" className="btn btn-primary">
              <i className="ph ph-check" />
              <span>Simpan Data Pegawai ASN</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
