'use client';

import React from 'react';
import type { SuratRecord } from '@/lib/workspace-api';

interface RealSuratPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  surat: SuratRecord | null;
}

export function RealSuratPreviewModal({
  isOpen,
  onClose,
  surat,
}: RealSuratPreviewModalProps): React.ReactNode {
  if (!isOpen || !surat) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10005,
        background: 'rgba(15, 23, 42, 0.75)',
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
          boxShadow: 'var(--shadow-lg, 0 20px 25px -5px rgba(0, 0, 0, 0.25))',
          width: '100%',
          maxWidth: '760px',
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
            <i className="ph ph-file-pdf" style={{ color: '#dc2626', fontSize: '24px' }} />
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700 }}>
                Pratinjau Naskah Dinas Asli (PDF Riil)
              </div>
              <div className="caption mono" style={{ fontSize: '11px', color: 'var(--muted)' }}>
                Agenda: {surat.agenda} · File: {surat.berkasNama || 'Naskah_Dinas_Masuk.pdf'} ({surat.berkasUkuran || '1.4 MB'})
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => window.print()}
            >
              <i className="ph ph-printer" /> Cetak
            </button>
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
        </div>

        {/* Lembar Naskah Dinas Asli (PDF Preview Body) */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, background: '#e2e8f0' }}>
          <div
            style={{
              background: '#FFFFFF',
              color: '#000000',
              padding: '36px 40px',
              borderRadius: '4px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
              maxWidth: '640px',
              margin: '0 auto',
              fontFamily: '"Times New Roman", Times, serif',
              lineHeight: 1.5,
              fontSize: '12pt',
            }}
          >
            {/* Kop Surat Instansi Pengirim */}
            <div
              style={{
                textAlign: 'center',
                borderBottom: '3px double #000000',
                paddingBottom: '10px',
                marginBottom: '20px',
              }}
            >
              <div style={{ fontSize: '14pt', fontWeight: 'bold', textTransform: 'uppercase' }}>
                PEMERINTAH KOTA MAKASSAR
              </div>
              <div style={{ fontSize: '16pt', fontWeight: 'bold', textTransform: 'uppercase' }}>
                {surat.asal.toUpperCase()}
              </div>
              <div style={{ fontSize: '9.5pt', fontStyle: 'italic', marginTop: '2px' }}>
                Jalan Danau Tanjung Bunga No. 1, Kota Makassar, Sulawesi Selatan 90224
              </div>
              <div style={{ fontSize: '9pt', fontStyle: 'italic' }}>
                Pos-el: kontak@makassarkota.go.id · Laman: https://makassarkota.go.id
              </div>
            </div>

            {/* Metadata Surat */}
            <table style={{ width: '100%', marginBottom: '16px', border: 0, fontSize: '11pt' }}>
              <tbody>
                <tr>
                  <td style={{ width: '15%', padding: '2px 0' }}>Nomor</td>
                  <td style={{ width: '3%', padding: '2px 0' }}>:</td>
                  <td style={{ width: '47%', padding: '2px 0', fontFamily: 'monospace' }}>
                    <strong>{surat.nomorSurat}</strong>
                  </td>
                  <td style={{ width: '35%', textAlign: 'right', padding: '2px 0' }}>
                    Makassar, {surat.tanggalSurat}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '2px 0' }}>Sifat</td>
                  <td style={{ padding: '2px 0' }}>:</td>
                  <td style={{ padding: '2px 0' }}>
                    {surat.sifat === 'SR'
                      ? 'Sangat Rahasia'
                      : surat.sifat === 'R'
                        ? 'Rahasia / Penting'
                        : 'Biasa'}
                  </td>
                  <td style={{ padding: '2px 0' }} />
                </tr>
                <tr>
                  <td style={{ padding: '2px 0' }}>Lampiran</td>
                  <td style={{ padding: '2px 0' }}>:</td>
                  <td style={{ padding: '2px 0' }}>{surat.lampiran || '1 Berkas'}</td>
                  <td style={{ padding: '2px 0' }} />
                </tr>
                <tr>
                  <td style={{ padding: '2px 0', verticalAlign: 'top' }}>Perihal</td>
                  <td style={{ padding: '2px 0', verticalAlign: 'top' }}>:</td>
                  <td style={{ padding: '2px 0' }} colSpan={2}>
                    <strong>{surat.perihal}</strong>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Tujuan Surat */}
            <div style={{ margin: '16px 0', fontSize: '11pt' }}>
              <div>Kepada Yth.</div>
              <div style={{ fontWeight: 'bold' }}>Camat Tamalate Kota Makassar</div>
              <div>di -</div>
              <div style={{ textIndent: '20px' }}>Tempat</div>
            </div>

            {/* Isi Naskah Dinas */}
            <div style={{ fontSize: '11.5pt', textAlign: 'justify', marginTop: '16px' }}>
              <p style={{ textIndent: '30px', margin: '0 0 12px 0' }}>
                Dengan hormat, sehubungan dengan pelaksanaan koordinasi pengendalian tata kelola pemerintahan, layanan kepegawaian ASN, serta peningkatan akuntabilitas pelayanan publik di lingkungan Pemerintah Kota Makassar, bersama ini kami sampaikan naskah dinas resmi terkait <em>&quot;{surat.perihal}&quot;</em>.
              </p>
              <p style={{ textIndent: '30px', margin: '0 0 12px 0' }}>
                Diharapkan kepada Saudara Camat Tamalate beserta jajaran struktural untuk menindaklanjuti naskah dinas ini sesuai dengan ketentuan peraturan perundang-undangan serta Standar Operasional Prosedur (SOP) yang berlaku.
              </p>
              <p style={{ textIndent: '30px', margin: '0 0 20px 0' }}>
                Demikian surat naskah dinas ini disampaikan untuk menjadi perhatian dan dilaksanakan sebagaimana mestinya.
              </p>
            </div>

            {/* Penutup Tanda Tangan Pengirim */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '30px' }}>
              <div style={{ textAlign: 'center', width: '280px', fontSize: '11pt' }}>
                <div>An. Pimpinan Lembaga / Instansi,</div>
                <div style={{ fontWeight: 'bold' }}>{surat.asal}</div>
                <div
                  style={{
                    margin: '14px auto',
                    padding: '6px',
                    border: '1px solid #16a34a',
                    borderRadius: '4px',
                    fontSize: '8pt',
                    color: '#166534',
                    background: '#f0fdf4',
                    width: '180px',
                    fontFamily: 'sans-serif',
                  }}
                >
                  [TTE BSrE TERVALIDASI BSSN]<br />
                  Sertifikat Elektronik Aktif
                </div>
                <div style={{ fontWeight: 'bold', textDecoration: 'underline' }}>
                  {surat.penanggungJawab || 'Kepala Badan / Instansi'}
                </div>
                <div>Pembina Utama Muda, Gol. IV/c</div>
                <div style={{ fontFamily: 'monospace', fontSize: '9pt' }}>
                  NIP. 19740510 199903 1 003
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Modal */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid var(--hairline)',
            background: 'var(--surface-sunken)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span className="caption" style={{ fontSize: '11.5px' }}>
            Dokumen siap ditelaah dan diteruskan ke Lembar Disposisi Camat Tamalate.
          </span>
          <button type="button" className="btn btn-primary btn-sm" onClick={onClose}>
            Tutup Pratinjau
          </button>
        </div>
      </div>
    </div>
  );
}
