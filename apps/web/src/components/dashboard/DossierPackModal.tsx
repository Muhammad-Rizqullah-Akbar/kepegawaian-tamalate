'use client';

import React, { useState } from 'react';
import { downloadPdfApi, type UsulanRecord } from '@/lib/workspace-api';

interface DossierPackModalProps {
  isOpen: boolean;
  onClose: () => void;
  usulan: UsulanRecord | null;
  actorRole: string;
}

export function DossierPackModal({
  isOpen,
  onClose,
  usulan,
  actorRole,
}: DossierPackModalProps): React.ReactNode {
  const [downloading, setDownloading] = useState(false);
  const [notifSent, setNotifSent] = useState(false);
  const [signatureMethod, setSignatureMethod] = useState<'bsre' | 'qr' | 'basah'>(
    usulan?.signatureMethod || 'bsre',
  );

  if (!isOpen || !usulan) return null;

  const lengkapCount = usulan.berkas.filter((b) => b.lengkap).length;
  const totalBerkas = usulan.berkas.length;
  const isAllComplete = lengkapCount === totalBerkas;

  const handleDownloadPdf = async () => {
    try {
      setDownloading(true);
      const title = `Pack_Berkas_${usulan.id}_${usulan.nama.replace(/\s+/g, '_')}`;
      const nomor = `800.1.2/${usulan.id}/TML/2026`;

      const checklistRows = usulan.berkas
        .map(
          (b, idx) => `
        <tr>
          <td style="text-align:center;">${idx + 1}</td>
          <td><strong>${b.nama}</strong></td>
          <td style="text-align:center;">
            <span style="display:inline-block;padding:2px 8px;border-radius:12px;background:${b.lengkap ? '#e6f4ea' : '#fce8e6'};color:${b.lengkap ? '#137333' : '#c5221f'};font-weight:bold;font-size:8.5pt;">
              ${b.lengkap ? 'LENGKAP & TERVERIFIKASI' : 'BELUM DILENGKAPI'}
            </span>
          </td>
          <td style="font-family:monospace;font-size:8pt;color:#555;">BSRE-TML-${b.kode.toUpperCase()}-2026</td>
        </tr>`,
        )
        .join('');

      const sealKasubbagHtml =
        signatureMethod === 'bsre'
          ? `<div style="margin:6px auto;padding:4px 8px;border:1px solid #16a34a;border-radius:4px;font-size:8pt;color:#166534;background:#f0fdf4;width:180px;">[TTE BSrE Terverifikasi BSSN]<br/><strong>BUDI HARTONO, S.SOS</strong></div>`
          : signatureMethod === 'qr'
            ? `<div style="margin:6px auto;padding:4px 8px;border:1px dashed #2563eb;border-radius:4px;font-size:8pt;color:#1e40af;background:#eff6ff;width:180px;">[QR CODE VERIFIKASI NASKAH]<br/>ID: TML-KASUB-800.1</div>`
            : `<div style="height:40px;"></div>`;

      const sealSekcamHtml =
        signatureMethod === 'bsre'
          ? `<div style="margin:6px auto;padding:4px 8px;border:1px solid #16a34a;border-radius:4px;font-size:8pt;color:#166534;background:#f0fdf4;width:180px;">[TTE BSrE Terverifikasi BSSN]<br/><strong>IR. H. SYAMSUL BAHRI, M.SI</strong></div>`
          : signatureMethod === 'qr'
            ? `<div style="margin:6px auto;padding:4px 8px;border:1px dashed #2563eb;border-radius:4px;font-size:8pt;color:#1e40af;background:#eff6ff;width:180px;">[QR CODE VERIFIKASI NASKAH]<br/>ID: TML-SEKCAM-800.1</div>`
            : `<div style="height:40px;"></div>`;

      const sealCamatHtml =
        signatureMethod === 'bsre'
          ? `<div style="margin:8px auto;padding:6px 12px;border:1.5px solid #15803d;border-radius:6px;font-size:8.5pt;color:#14532d;background:#f0fdf4;width:240px;"><strong>TERTANDA ELEKTRONIK BSrE - BSSN</strong><br/>Sertifikat Digital: DRS. H. SUTRISNO HADI, M.SI<br/><span style="font-family:monospace;font-size:7.5pt;">SHA256: e8b2a3...f4a1 (Sah &amp; Legal)</span></div>`
          : signatureMethod === 'qr'
            ? `<div style="margin:8px auto;padding:6px 12px;border:1.5px dashed #1d4ed8;border-radius:6px;font-size:8.5pt;color:#1e3a8a;background:#eff6ff;width:240px;"><strong>TTE VISUAL QR VERIFIED</strong><br/>Pemerintah Kota Makassar · Kecamatan Tamalate</div>`
            : `<div style="margin:8px auto;height:45px;display:flex;align-items:center;justify-content:center;color:#b91c1c;font-size:8.5pt;font-weight:bold;">[CAP STEMPEL RESMI &amp; TANDA TANGAN BASAH CAMAT]</div>`;

      const htmlBody = `
        <div style="margin-top:15px;border:1px solid #061B31;padding:16px;border-radius:4px;">
          <h3 style="margin:0 0 10px 0;text-align:center;font-size:12pt;text-transform:uppercase;">
            LEMBAR KENDALI VERIFIKASI BERKAS USULAN TERPADU
          </h3>
          <p style="text-align:center;font-size:9.5pt;margin:0 0 16px 0;color:#555;">
            Paket Pengusulan Resmi Kepegawaian Kecamatan Tamalate ke BKPSDMD Kota Makassar
          </p>

          <table style="width:100%;margin-bottom:14px;border:0;">
            <tr>
              <td style="border:0;width:28%;padding:3px 0;"><strong>Nomor Registrasi</strong></td>
              <td style="border:0;width:2%;padding:3px 0;">:</td>
              <td style="border:0;padding:3px 0;font-family:monospace;">${usulan.id}</td>
            </tr>
            <tr>
              <td style="border:0;padding:3px 0;"><strong>Nama Pegawai</strong></td>
              <td style="border:0;padding:3px 0;">:</td>
              <td style="border:0;padding:3px 0;">${usulan.nama}</td>
            </tr>
            <tr>
              <td style="border:0;padding:3px 0;"><strong>NIP</strong></td>
              <td style="border:0;padding:3px 0;">:</td>
              <td style="border:0;padding:3px 0;font-family:monospace;">${usulan.nip}</td>
            </tr>
            <tr>
              <td style="border:0;padding:3px 0;"><strong>Pangkat / Golongan</strong></td>
              <td style="border:0;padding:3px 0;">:</td>
              <td style="border:0;padding:3px 0;">${usulan.pangkat} (${usulan.golongan})</td>
            </tr>
            <tr>
              <td style="border:0;padding:3px 0;"><strong>Jabatan & Unit</strong></td>
              <td style="border:0;padding:3px 0;">:</td>
              <td style="border:0;padding:3px 0;">${usulan.jabatan} - Kecamatan Tamalate</td>
            </tr>
            <tr>
              <td style="border:0;padding:3px 0;"><strong>Jenis Layanan</strong></td>
              <td style="border:0;padding:3px 0;">:</td>
              <td style="border:0;padding:3px 0;">${usulan.jenis.toUpperCase()} - Target TMT: ${usulan.tmtTarget}</td>
            </tr>
          </table>

          <h4 style="margin:14px 0 6px 0;font-size:10pt;">Daftar Dokumen Pendukung Dalam Paket (Pack 1 Dokumen):</h4>
          <table>
            <thead>
              <tr style="background:#f1f3f4;">
                <th style="width:30px;text-align:center;">No</th>
                <th>Nama Dokumen Syarat</th>
                <th style="width:150px;text-align:center;">Status Kelengkapan</th>
                <th style="width:160px;text-align:center;">Segel Digital BSrE</th>
              </tr>
            </thead>
            <tbody>
              ${checklistRows}
            </tbody>
          </table>

          {/* 3 Posisi Tanda Tangan Resmi: Kiri Kasubbag, Kanan Sekcam, Tengah Bawah Camat */}
          <div style="margin-top:22px;display:flex;justify-content:space-between;page-break-inside:avoid;">
            <div style="text-align:center;width:45%;">
              <p style="font-size:9pt;margin:0 0 6px 0;">
                Diverifikasi / Diperiksa Oleh,<br/>
                <strong>Kasubag Umum &amp; Kepegawaian</strong>
              </p>
              ${sealKasubbagHtml}
              <p style="font-size:9.5pt;margin:4px 0 0;font-weight:bold;text-decoration:underline;">
                Budi Hartono, S.Sos
              </p>
              <p style="font-size:8.5pt;margin:0;color:#555;">NIP. 19850101 201001 1 001</p>
            </div>

            <div style="text-align:center;width:45%;">
              <p style="font-size:9pt;margin:0 0 6px 0;">
                Ditelaah / Rekomendasi Paraf Hirarki,<br/>
                <strong>Sekretaris Camat Tamalate</strong>
              </p>
              ${sealSekcamHtml}
              <p style="font-size:9.5pt;margin:4px 0 0;font-weight:bold;text-decoration:underline;">
                Ir. H. Syamsul Bahri, M.Si
              </p>
              <p style="font-size:8.5pt;margin:0;color:#555;">NIP. 19750819 200112 1 002</p>
            </div>
          </div>

          <div style="margin-top:22px;text-align:center;page-break-inside:avoid;">
            <p style="font-size:9.5pt;margin:0 0 6px 0;">
              Makassar, 19 Juni 2026<br/>
              Mengetahui &amp; Menetapkan,<br/>
              <strong>Camat Tamalate Kota Makassar</strong>
            </p>
            ${sealCamatHtml}
            <p style="font-size:10pt;margin:4px 0 0;font-weight:bold;text-decoration:underline;">
              Drs. H. Sutrisno Hadi, M.Si
            </p>
            <p style="font-size:9pt;margin:0;">Pembina Tingkat I, Gol. IV/b</p>
            <p style="font-size:8.5pt;margin:0;color:#555;">NIP. 19700412 199603 1 002</p>
          </div>
        </div>
      `;

      await downloadPdfApi({
        title,
        nomor,
        htmlBody,
      });
    } catch (err) {
      console.error('Gagal mengunduh pack berkas PDF:', err);
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      className="modal-backdrop is-open"
      role="dialog"
      aria-modal="true"
      style={{ opacity: 1, visibility: 'visible', zIndex: 1200 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal-dialog"
        style={{
          maxWidth: '780px',
          width: '95%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--surface)',
          borderRadius: 'var(--r-md)',
          boxShadow: 'var(--shadow-lift)',
          border: '1px solid var(--hairline)',
          overflow: 'hidden',
        }}
      >
        {/* Header Modal */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--hairline)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--surface-soft)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--r-sm)',
                background: 'var(--accent)',
                color: 'white',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <i className="ph ph-file-pdf" style={{ fontSize: '20px' }} />
            </div>
            <div>
              <h3 className="heading" style={{ fontSize: '16px', margin: 0 }}>
                Bundel Dokumen Terpadu (Pack 1 PDF)
              </h3>
              <p className="caption" style={{ margin: 0 }}>
                Pengemasan berkas persyaratan digital untuk usulan {usulan.id}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label="Tutup pratinjau pack dokumen"
          >
            <i className="ph ph-x" />
          </button>
        </div>

        {/* Konten Pratinjau Bundel */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          {notifSent ? (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--r-sm)',
                background: 'var(--success-soft)',
                color: 'var(--success)',
                fontSize: '12.5px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <i className="ph ph-check-circle" style={{ fontSize: '16px' }} />
              Notifikasi pembaruan berkas terpadu telah dikirimkan ke pegawai via sistem!
            </div>
          ) : null}

          {/* Pemilihan Metode Signature */}
          <div
            style={{
              padding: '12px 16px',
              background: 'var(--surface-sunken)',
              border: '1px solid var(--hairline)',
              borderRadius: 'var(--r-sm)',
              marginBottom: '16px',
              display: 'grid',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <span className="caption" style={{ fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>
                Metode Signature Pengesahan Naskah (3 Posisi TTD):
              </span>
              <span className="caption mono" style={{ fontSize: '10.5px', color: 'var(--muted)' }}>
                Kiri: Kasubbag Umpeg · Kanan: Sekcam · Tengah: Camat
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className={`chip ${signatureMethod === 'bsre' ? 'is-on' : ''}`}
                onClick={() => setSignatureMethod('bsre')}
                style={{ height: '30px', fontSize: '11.5px', cursor: 'pointer' }}
              >
                <i className="ph ph-seal-check" style={{ marginRight: '4px' }} />
                <span>TTE BSrE Digital (Sertifikat Elektronik BSSN)</span>
              </button>
              <button
                type="button"
                className={`chip ${signatureMethod === 'qr' ? 'is-on' : ''}`}
                onClick={() => setSignatureMethod('qr')}
                style={{ height: '30px', fontSize: '11.5px', cursor: 'pointer' }}
              >
                <i className="ph ph-qr-code" style={{ marginRight: '4px' }} />
                <span>TTE Visual QR Code (Verifikasi Naskah)</span>
              </button>
              <button
                type="button"
                className={`chip ${signatureMethod === 'basah' ? 'is-on' : ''}`}
                onClick={() => setSignatureMethod('basah')}
                style={{ height: '30px', fontSize: '11.5px', cursor: 'pointer' }}
              >
                <i className="ph ph-pen-nib" style={{ marginRight: '4px' }} />
                <span>TTD Basah &amp; Cap Stempel Resmi Camat</span>
              </button>
            </div>
          </div>

          {/* Lembar Muka Bundel Terpadu */}
          <div
            style={{
              background: '#FFFFFF',
              color: '#061B31',
              padding: '24px',
              borderRadius: 'var(--r-sm)',
              border: '1px solid var(--hairline)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            {/* Kop Surat Tamalate */}
            <div
              style={{
                textAlign: 'center',
                borderBottom: '2px solid #061B31',
                paddingBottom: '12px',
                marginBottom: '16px',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.04em' }}>
                PEMERINTAH KOTA MAKASSAR
              </div>
              <div style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '0.02em' }}>
                KECAMATAN TAMALATE
              </div>
              <div style={{ fontSize: '10px', color: '#555', marginTop: '2px' }}>
                Jl. Danau Tanjung Bunga Utara No. 181, Makassar · Telepon: (0411) 853241
              </div>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '18px' }}>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  borderBottom: '1px solid #061B31',
                  paddingBottom: '2px',
                }}
              >
                LEMBAR KENDALI VERIFIKASI BERKAS USULAN TERPADU
              </span>
              <div style={{ fontSize: '10.5px', color: '#555', marginTop: '4px' }}>
                Nomor Register Bundel: 800.1.2/{usulan.id}/TML/2026
              </div>
            </div>

            {/* Identitas Pengusul */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '8px',
                fontSize: '12px',
                padding: '12px',
                background: '#f8fafc',
                borderRadius: 'var(--r-sm)',
                marginBottom: '18px',
              }}
            >
              <div>
                <span style={{ color: '#64748b' }}>Nama ASN:</span>{' '}
                <strong>{usulan.nama}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>NIP:</span>{' '}
                <span className="mono">{usulan.nip}</span>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Pangkat / Golongan:</span>{' '}
                <span>{usulan.pangkat} ({usulan.golongan})</span>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Jabatan:</span>{' '}
                <span>{usulan.jabatan}</span>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Jenis Layanan:</span>{' '}
                <strong style={{ color: 'var(--accent)' }}>{usulan.jenis.toUpperCase()}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Rencana TMT:</span>{' '}
                <span className="mono">{usulan.tmtTarget}</span>
              </div>
            </div>

            {/* Tabel Berkas yang Dikemas */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '11.5px', fontWeight: 600, marginBottom: '8px' }}>
                Daftar Dokumen Dalam Bundel (Kelengkapan: {lengkapCount}/{totalBerkas} Dokumen):
              </div>
              <div className="data-table-scroll">
                <table className="data-table" style={{ width: '100%', fontSize: '11.5px' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9' }}>
                      <th style={{ width: '32px', textAlign: 'center' }}>No</th>
                      <th>Dokumen Persyaratan</th>
                      <th style={{ width: '140px', textAlign: 'center' }}>Status Berkas</th>
                      <th style={{ width: '150px' }}>Segel Digital</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usulan.berkas.map((b, idx) => (
                      <tr key={b.kode}>
                        <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                        <td>
                          <strong>{b.nama}</strong>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span
                            className={`badge ${b.lengkap ? 'badge-ok' : 'badge-warn'}`}
                            style={{ fontSize: '10.5px' }}
                          >
                            {b.lengkap ? 'Lengkap & Sah' : 'Belum Ada'}
                          </span>
                        </td>
                        <td className="mono" style={{ fontSize: '10.5px', color: '#64748b' }}>
                          BSRE-TML-{b.kode.toUpperCase()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Status Kelengkapan Keseluruhan */}
            <div
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--r-sm)',
                background: isAllComplete ? 'var(--success-soft)' : 'var(--warn-soft)',
                border: `1px solid ${isAllComplete ? 'var(--success)' : 'var(--warn)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '12px',
                marginBottom: '18px',
              }}
            >
              <div>
                <strong>
                  {isAllComplete
                    ? 'Status Bundel: Siap Diteruskan ke BKPSDMD'
                    : 'Status Bundel: Perlu Tambahan Berkas'}
                </strong>
                <div style={{ color: '#475569', fontSize: '11px', marginTop: '2px' }}>
                  {isAllComplete
                    ? 'Seluruh dokumen persyaratan telah diperiksa dan disatukan ke dalam 1 pack digital resmi.'
                    : `Terdapat ${totalBerkas - lengkapCount} dokumen yang masih perlu dilengkapi oleh pegawai bersangkutan.`}
                </div>
              </div>
              <span className={`badge ${isAllComplete ? 'badge-ok' : 'badge-warn'}`}>
                {isAllComplete ? '100% Lengkap' : `${Math.round((lengkapCount / totalBerkas) * 100)}%`}
              </span>
            </div>

            {/* Penandatangan Dokumen */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '20px',
                textAlign: 'center',
                fontSize: '11px',
                marginTop: '16px',
                paddingTop: '12px',
                borderTop: '1px solid #e2e8f0',
              }}
            >
              <div>
                <p style={{ margin: '0 0 40px 0' }}>
                  Diverifikasi Oleh,<br />
                  <strong>Kasubag Umum &amp; Kepegawaian</strong>
                </p>
                <p style={{ margin: 0, fontWeight: 600, textDecoration: 'underline' }}>
                  Budi Hartono, S.Sos
                </p>
                <p style={{ margin: 0, color: '#64748b' }}>NIP. 19850101 201001 1 001</p>
              </div>

              <div>
                <p style={{ margin: '0 0 40px 0' }}>
                  Makassar, 06 November 2026<br />
                  Mengesahkan Dokumen Pack,<br />
                  <strong>Camat Tamalate</strong>
                </p>
                <p style={{ margin: 0, fontWeight: 600, textDecoration: 'underline' }}>
                  Drs. H. Sutrisno Hadi, M.Si
                </p>
                <p style={{ margin: 0, color: '#64748b' }}>NIP. 19720412 199303 1 004</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Tombol Aksi */}
        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid var(--hairline)',
            background: 'var(--surface-soft)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setNotifSent(true);
                setTimeout(() => setNotifSent(false), 4000);
              }}
            >
              <i className="ph ph-bell-ringing" />
              <span>Kirim Notifikasi ke Pegawai</span>
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => window.print()}
            >
              <i className="ph ph-printer" />
              <span>Cetak Pratinjau</span>
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Tutup
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              disabled={downloading}
              onClick={handleDownloadPdf}
            >
              <i className={`ph ${downloading ? 'ph-spinner ph-spin' : 'ph-download-simple'}`} />
              <span>{downloading ? 'Mengemas PDF...' : 'Unduh 1 Pack PDF Resmi'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
