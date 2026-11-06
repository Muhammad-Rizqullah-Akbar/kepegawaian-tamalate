'use client';

import React from 'react';
import type { UsulanRecord, UsulanBerkasRecord } from '@/lib/workspace-api';

interface PdfDocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  berkas: UsulanBerkasRecord | null;
  usulan: UsulanRecord | null;
  onToggleStatus?: (kodeBerkas: string, lengkap: boolean) => void;
}

export function PdfDocumentPreviewModal({
  isOpen,
  onClose,
  berkas,
  usulan,
  onToggleStatus,
}: PdfDocumentPreviewModalProps): React.ReactNode {
  if (!isOpen || !berkas || !usulan) return null;

  const getDocumentSubstance = () => {
    const k = berkas.kode.toLowerCase();
    if (k.includes('pangkat')) {
      return {
        nomor: `823.3/0482/BKPSDMD/2024`,
        tanggal: `01 April 2024`,
        pejabat: `Wali Kota Makassar`,
        perihal: `Keputusan Kenaikan Pangkat Pegawai Negeri Sipil`,
        isi: `Memutuskan dan menetapkan Pegawai Negeri Sipil atas nama ${usulan.nama}, NIP ${usulan.nip}, dinaikkan pangkatnya setingkat lebih tinggi menjadi ${usulan.pangkat} (${usulan.golongan}) terhitung mulai tanggal penetapan, dengan hak gaji pokok baru sesuai peraturan perundang-undangan.`,
      };
    }
    if (k.includes('kgb')) {
      return {
        nomor: `822.3/0114/KGB/TML/2024`,
        tanggal: `01 Juni 2024`,
        pejabat: `Camat Tamalate Kota Makassar`,
        perihal: `Surat Pemberitahuan Kenaikan Gaji Berkala (SPKGB)`,
        isi: `Berdasarkan PP No. 7 Tahun 1977 jo. PP No. 5 Tahun 2024, diberitahukan bahwa kepada ${usulan.nama}, NIP ${usulan.nip}, Jabatan ${usulan.jabatan}, diberikan Kenaikan Gaji Berkala dengan Masa Kerja Golongan genap 2 tahun dengan predikat kinerja Baik.`,
      };
    }
    if (k.includes('skp')) {
      return {
        nomor: `800.1.2/SKP-TML/2025`,
        tanggal: `31 Desember 2025`,
        pejabat: `Pejabat Penilai Kinerja / Kasubag Umpeg`,
        perihal: `Laporan Penilaian Sasaran Kinerja Pegawai (SKP)`,
        isi: `Hasil evaluasi kinerja pegawai ${usulan.nama} (NIP ${usulan.nip}) untuk periode tahun 2024 - 2025 memperoleh predikat kinerja: BAIK (Capaian Kinerja Organisasi: Sesuai Ekspektasi, Pola Perilaku Kerja: BerAKHLAK).`,
      };
    }
    if (k.includes('spmt') || k.includes('spmj')) {
      return {
        nomor: `800/219/SPMT/TML/2025`,
        tanggal: `02 Januari 2025`,
        pejabat: `Sekretaris Camat Tamalate`,
        perihal: `Surat Pernyataan Melaksanakan Tugas (SPMT)`,
        isi: `Menyatakan dengan sesungguhnya bahwa ${usulan.nama}, NIP ${usulan.nip}, telah secara nyata dan berkelanjutan melaksanakan tugas jabatannya selaku ${usulan.jabatan} di lingkungan Kantor Kecamatan Tamalate.`,
      };
    }
    if (k.includes('bebas')) {
      return {
        nomor: `700/089/INSP-KOTA/VI/2026`,
        tanggal: `12 Juni 2026`,
        pejabat: `Inspektur Pembantu Wilayah Kota Makassar`,
        perihal: `Keterangan Bebas Temuan & Bebas Hukuman Disiplin`,
        isi: `Menerangkan bahwa pegawai bersangkutan (${usulan.nama}, NIP ${usulan.nip}) tidak sedang dalam proses pemeriksaan pelanggaran disiplin PNS, tidak sedang menjalani hukuman disiplin sedang/berat, dan bebas dari tuntutan ganti rugi (TGR).`,
      };
    }
    if (k.includes('dpcp')) {
      return {
        nomor: `882.1/DPCP-019/TML/2026`,
        tanggal: `15 Mei 2026`,
        pejabat: `Kepala Subbagian Umum & Kepegawaian`,
        perihal: `Formulir Data Perorangan Calon Pensiun (DPCP)`,
        isi: `Data perorangan calon pensiun atas nama ${usulan.nama}, NIP ${usulan.nip}, batas usia pensiun genap tercapai pada target TMT ${usulan.tmtTarget}. Susunan keluarga terverifikasi sah berdasarkan data Dinas Kependudukan dan Pencatatan Sipil.`,
      };
    }
    if (k.includes('cuti') || k.includes('form-cuti')) {
      return {
        nomor: `851/088/CUTI-TML/2026`,
        tanggal: `10 November 2026`,
        pejabat: `Kepala Subbagian Umum & Kepegawaian`,
        perihal: `Formulir Permintaan dan Pemberian Cuti Resmi (8 Tabel BKN)`,
        isi: `Permohonan cuti atas nama ${usulan.nama} (NIP ${usulan.nip}, ${usulan.jabatan}) telah diperiksa sisa kuota hak cutinya (N-2, N-1, N) berdasarkan Peraturan BKN No. 24 Tahun 2017 jo. Peraturan BKN No. 7 Tahun 2021. Alasan dan jangka waktu permohonan telah memenuhi syarat substantif.`,
      };
    }
    if (k.includes('dokter') || k.includes('sakit')) {
      return {
        nomor: `440/120/SKD-PKM/2026`,
        tanggal: `08 November 2026`,
        pejabat: `Dokter Pemeriksa Faskes Pemerintah`,
        perihal: `Surat Keterangan Sakit & Kelaikan Kesehatan`,
        isi: `Menerangkan bahwa pegawai atas nama ${usulan.nama} (NIP ${usulan.nip}) dalam kondisi kesehatan yang memerlukan istirahat pemulihan dan perawatan medis sesuai diagnosa klinis faskes pemerintah.`,
      };
    }
    if (k.includes('pelimpahan') || k.includes('tugas')) {
      return {
        nomor: `800/104/SPT-TUGAS/TML/2026`,
        tanggal: `09 November 2026`,
        pejabat: `Sekretaris Camat Tamalate`,
        perihal: `Surat Pernyataan Pelimpahan Tugas Sementara`,
        isi: `Menyatakan bahwa selama Saudara(i) ${usulan.nama} menjalankan cuti/izin, tugas dan tanggung jawab operasional hariannya dialihkan sementara kepada pelaksana tugas yang ditunjuk tanpa mengurangi mutu pelayanan publik di Kantor Kecamatan Tamalate.`,
      };
    }
    return {
      nomor: `800/DOC-${berkas.kode.toUpperCase()}/2026`,
      tanggal: `10 Juni 2026`,
      pejabat: `Pemerintah Kota Makassar`,
      perihal: berkas.nama,
      isi: `Dokumen portofolio resmi ${berkas.nama} milik aparatur sipil negara atas nama ${usulan.nama} (NIP ${usulan.nip}) telah diverifikasi keabsahannya dalam basis data kepegawaian Kecamatan Tamalate.`,
    };
  };

  const doc = getDocumentSubstance();

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10001,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(5px)',
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
          borderRadius: 'var(--r-md)',
          boxShadow: 'var(--shadow-lift, 0 25px 50px -12px rgba(0, 0, 0, 0.25))',
          width: '100%',
          maxWidth: '740px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out',
        }}
      >
        {/* Topbar Modal Preview */}
        <div
          style={{
            padding: '14px 20px',
            borderBottom: '1px solid var(--hairline)',
            background: 'var(--surface-sunken)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="ph ph-file-pdf" style={{ fontSize: '20px', color: 'var(--accent)' }} />
            <div>
              <span className="eyebrow" style={{ fontSize: '10px' }}>
                Pratinjau Dokumen Portofolio ASN
              </span>
              <div style={{ fontWeight: 600, fontSize: '14px' }}>{berkas.nama}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              className={`badge ${berkas.lengkap ? 'badge-ok' : 'badge-warn'} tabular`}
              style={{ fontSize: '11px' }}
            >
              {berkas.lengkap ? 'Dokumen Terverifikasi Sah' : 'Status: Belum Lengkap'}
            </span>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={onClose}
              aria-label="Tutup pratinjau"
              style={{ padding: '6px' }}
            >
              <i className="ph ph-x" style={{ fontSize: '18px' }} />
            </button>
          </div>
        </div>

        {/* Lembar Dokumen Fisik / PDF Paper Simulator */}
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
              background: '#ffffff',
              color: '#0f172a',
              width: '100%',
              maxWidth: '595px',
              minHeight: '740px',
              padding: '36px 42px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              fontFamily: '"Times New Roman", Times, serif',
              position: 'relative',
              boxSizing: 'border-box',
            }}
          >
            {/* Watermark Validasi BSrE */}
            <div
              style={{
                position: 'absolute',
                top: '40%',
                left: '20%',
                transform: 'rotate(-30deg)',
                fontSize: '44px',
                fontWeight: 700,
                color: 'rgba(15, 23, 42, 0.05)',
                pointerEvents: 'none',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              ARSIP RESMI TAMALATE
            </div>

            {/* Kop Surat Resmi */}
            <div style={{ textAlign: 'center', borderBottom: '3px double #000000', paddingBottom: '10px' }}>
              <div style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '0.04em' }}>
                PEMERINTAH KOTA MAKASSAR
              </div>
              <div style={{ fontSize: '17px', fontWeight: 700, letterSpacing: '0.05em' }}>
                KECAMATAN TAMALATE
              </div>
              <div style={{ fontSize: '11px', fontStyle: 'italic', marginTop: '2px' }}>
                Jalan Danau Tanjung Bunga No. 1, Maccini Sombala, Kota Makassar 90224
              </div>
              <div style={{ fontSize: '11px', marginTop: '1px' }}>
                Laman: makassarkota.go.id · Pos-el: tamalate@makassarkota.go.id
              </div>
            </div>

            {/* Judul & Nomor Surat */}
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', textDecoration: 'underline' }}>
                {doc.perihal}
              </div>
              <div style={{ fontSize: '12px', marginTop: '3px' }}>
                Nomor: {doc.nomor}
              </div>
            </div>

            {/* Rincian ASN */}
            <div style={{ marginTop: '20px', fontSize: '12px', lineHeight: 1.6 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <tbody>
                  <tr>
                    <td style={{ width: '130px', padding: '3px 0' }}>Nama Pegawai</td>
                    <td style={{ width: '12px' }}>:</td>
                    <td style={{ fontWeight: 700 }}>{usulan.nama}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '3px 0' }}>NIP</td>
                    <td>:</td>
                    <td style={{ fontFamily: 'monospace' }}>{usulan.nip}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '3px 0' }}>Pangkat / Golongan</td>
                    <td>:</td>
                    <td>{usulan.pangkat} ({usulan.golongan})</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '3px 0' }}>Jabatan</td>
                    <td>:</td>
                    <td>{usulan.jabatan}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '3px 0' }}>Unit Kerja</td>
                    <td>:</td>
                    <td>Kantor Kecamatan Tamalate Kota Makassar</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Isi Substansi Surat */}
            <div style={{ marginTop: '18px', fontSize: '12px', lineHeight: 1.7, textAlign: 'justify', textIndent: '28px' }}>
              {doc.isi}
            </div>

            <div style={{ marginTop: '12px', fontSize: '12px', lineHeight: 1.7, textAlign: 'justify', textIndent: '28px' }}>
              Demikian surat keputusan/keterangan ini dikeluarkan untuk dipergunakan sebagaimana mestinya sesuai ketentuan peraturan perundang-undangan di bidang kepegawaian aparatur sipil negara.
            </div>

            {/* Tanda Tangan & Cap TTE */}
            <div style={{ marginTop: '36px', display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ width: '240px', textAlign: 'center', fontSize: '12px' }}>
                <div>Makassar, {doc.tanggal}</div>
                <div style={{ fontWeight: 600, marginTop: '2px' }}>{doc.pejabat}</div>

                {/* Stempel Digital & QR BSrE */}
                <div
                  style={{
                    margin: '12px auto',
                    width: '80px',
                    height: '80px',
                    border: '1.5px dashed #0284c7',
                    borderRadius: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(2, 132, 199, 0.05)',
                  }}
                >
                  <i className="ph ph-qr-code" style={{ fontSize: '38px', color: '#0369a1' }} />
                  <span style={{ fontSize: '7.5px', color: '#0369a1', fontWeight: 700, marginTop: '2px' }}>
                    TTE BSrE BSSN
                  </span>
                </div>

                <div style={{ fontWeight: 700, textDecoration: 'underline' }}>
                  {doc.pejabat.includes('Wali Kota')
                    ? 'Ir. H. Moh. Ramdhan Pomanto'
                    : doc.pejabat.includes('Camat')
                      ? 'Drs. H. Sutrisno Hadi, M.Si'
                      : 'Budi Hartono, S.Sos'}
                </div>
                <div style={{ fontSize: '11px', color: '#475569' }}>
                  Pembina Tingkat I, Gol. IV/b
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Aksi Modal */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid var(--hairline)',
            background: 'var(--surface-sunken)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <div className="caption" style={{ fontSize: '11px' }}>
            Format: PDF A4 Digital · Terotentikasi Sertifikat Elektronik Balai Sertifikasi Elektronik (BSrE).
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {onToggleStatus ? (
              <button
                type="button"
                className={`btn btn-sm ${berkas.lengkap ? 'btn-ghost' : 'btn-accent'}`}
                onClick={() => {
                  onToggleStatus(berkas.kode, !berkas.lengkap);
                }}
              >
                <i className={`ph ${berkas.lengkap ? 'ph-x-circle' : 'ph-check-circle'}`} />
                <span>{berkas.lengkap ? 'Tandai Kurang' : 'Tandai Lengkap'}</span>
              </button>
            ) : null}

            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Tutup Pratinjau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
