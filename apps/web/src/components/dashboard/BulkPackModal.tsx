'use client';

import React, { useState } from 'react';
import { downloadPdfApi, type UsulanRecord } from '@/lib/workspace-api';

export interface BulkPackItem {
  id: string;
  nip: string;
  nama: string;
  pangkat: string;
  golongan: string;
  jabatan: string;
  tmtTarget: string;
  lengkapCount: number;
  totalBerkas: number;
  isComplete: boolean;
  tahap: number;
}

interface BulkPackModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: BulkPackItem[];
  jenisLayanan: 'KGB' | 'Kenaikan Pangkat' | 'Pensiun' | 'Cuti dan Izin';
  actorRole: string;
}

export function BulkPackModal({
  isOpen,
  onClose,
  items,
  jenisLayanan,
  actorRole,
}: BulkPackModalProps): React.ReactNode {
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    return items.filter((i) => i.isComplete).map((i) => i.id);
  });
  const [downloading, setDownloading] = useState(false);
  const [successToast, setSuccessToast] = useState(false);
  const [signatureMethod, setSignatureMethod] = useState<'bsre' | 'qr' | 'basah'>('bsre');

  if (!isOpen) return null;

  const handleToggleId = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSelectComplete = () => {
    setSelectedIds(items.filter((i) => i.isComplete).map((i) => i.id));
  };

  const handleSelectAll = () => {
    setSelectedIds(items.map((i) => i.id));
  };

  const handleDeselectAll = () => {
    setSelectedIds([]);
  };

  const handleDownloadBulkPdf = async () => {
    try {
      setDownloading(true);
      const selectedItems = items.filter((i) => selectedIds.includes(i.id));

      const rowsHtml = selectedItems
        .map(
          (item, idx) => `
          <tr>
            <td style="padding: 8px; border: 1px solid #000; text-align: center;">${idx + 1}</td>
            <td style="padding: 8px; border: 1px solid #000;">
              <strong>${item.nama}</strong><br/>
              <span style="font-family: monospace; font-size: 11px;">NIP ${item.nip}</span>
            </td>
            <td style="padding: 8px; border: 1px solid #000;">${item.pangkat} (${item.golongan})</td>
            <td style="padding: 8px; border: 1px solid #000;">${item.jabatan}</td>
            <td style="padding: 8px; border: 1px solid #000; text-align: center;">${item.tmtTarget}</td>
            <td style="padding: 8px; border: 1px solid #000; text-align: center;">
              ${item.lengkapCount}/${item.totalBerkas} Dokumen (Sah)
            </td>
          </tr>
        `,
        )
        .join('');

      const sealKasubbagHtml =
        signatureMethod === 'bsre'
          ? `<div style="margin: 8px auto; padding: 4px 8px; border: 1px solid #16a34a; font-size: 8pt; color: #166534; background: #f0fdf4; width: 170px;">[TTE BSrE BSSN]<br/><strong>BUDI HARTONO, S.SOS</strong></div>`
          : signatureMethod === 'qr'
            ? `<div style="margin: 8px auto; padding: 4px 8px; border: 1px dashed #2563eb; font-size: 8pt; color: #1e40af; background: #eff6ff; width: 170px;">[QR VERIFIKASI NASKAH]<br/>ID: TML-KASUB-800.1</div>`
            : `<div style="height: 45px;"></div>`;

      const sealSekcamHtml =
        signatureMethod === 'bsre'
          ? `<div style="margin: 8px auto; padding: 4px 8px; border: 1px solid #16a34a; font-size: 8pt; color: #166534; background: #f0fdf4; width: 170px;">[TTE BSrE BSSN]<br/><strong>IR. H. SYAMSUL BAHRI, M.SI</strong></div>`
          : signatureMethod === 'qr'
            ? `<div style="margin: 8px auto; padding: 4px 8px; border: 1px dashed #2563eb; font-size: 8pt; color: #1e40af; background: #eff6ff; width: 170px;">[QR VERIFIKASI NASKAH]<br/>ID: TML-SEKCAM-800.1</div>`
            : `<div style="height: 45px;"></div>`;

      const sealCamatHtml =
        signatureMethod === 'bsre'
          ? `<div style="margin: 10px auto; padding: 6px 12px; border: 1.5px solid #15803d; font-size: 8.5pt; color: #14532d; background: #f0fdf4; width: 230px;"><strong>TERTANDA ELEKTRONIK BSrE - BSSN</strong><br/>DRS. H. SUTRISNO HADI, M.SI<br/><span style="font-family: monospace; font-size: 7pt;">SHA256: e8b2...f4a1 (Sah)</span></div>`
          : signatureMethod === 'qr'
            ? `<div style="margin: 10px auto; padding: 6px 12px; border: 1.5px dashed #1d4ed8; font-size: 8.5pt; color: #1e3a8a; background: #eff6ff; width: 230px;"><strong>TTE VISUAL QR VERIFIED</strong><br/>Kecamatan Tamalate</div>`
            : `<div style="margin: 10px auto; height: 50px; display: flex; align-items: center; justify-content: center; color: #b91c1c; font-size: 8.5pt; font-weight: bold;">[CAP RESMI &amp; TTD BASAH CAMAT]</div>`;

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8" />
          <title>Pack Kolektif 1 Dokumen PDF - ${jenisLayanan}</title>
          <style>
            @page { size: A4 portrait; margin: 18mm; }
            body { font-family: "Times New Roman", Times, serif; color: #000; line-height: 1.45; font-size: 11pt; }
            .kop { text-align: center; border-bottom: 3px double #000; padding-bottom: 8px; margin-bottom: 16px; }
            .kop-1 { font-size: 13pt; font-weight: bold; }
            .kop-2 { font-size: 15pt; font-weight: bold; }
            .kop-3 { font-size: 9.5pt; font-style: italic; }
            .title { text-align: center; font-size: 12pt; font-weight: bold; text-decoration: underline; margin-bottom: 4px; }
            .nomor { text-align: center; font-size: 10.5pt; margin-bottom: 16px; }
            table { width: 100%; border-collapse: collapse; font-size: 9.5pt; margin-top: 12px; }
          </style>
        </head>
        <body>
          <div class="kop">
            <div class="kop-1">PEMERINTAH KOTA MAKASSAR</div>
            <div class="kop-2">KECAMATAN TAMALATE</div>
            <div class="kop-3">Jalan Danau Tanjung Bunga No. 1, Maccini Sombala, Kota Makassar 90224</div>
            <div class="kop-3">Laman: makassarkota.go.id · Pos-el: tamalate@makassarkota.go.id</div>
          </div>

          <div class="title">LEMBAR PENGANTAR PACK KOLEKTIF USULAN ${jenisLayanan.toUpperCase()}</div>
          <div class="nomor">Nomor: 800/PACK-${jenisLayanan.toUpperCase()}-001/TML/2026</div>

          <p>Bersama ini diteruskan berkas usulan portofolio kepegawaian aparatur sipil negara yang telah diverifikasi kelengkapannya oleh Tim Fasilitasi Kepegawaian Kecamatan Tamalate untuk diproses lebih lanjut sesuai peraturan perundang-undangan:</p>

          <table>
            <thead>
              <tr style="background: #f1f5f9;">
                <th style="padding: 6px; border: 1px solid #000; width: 30px;">No</th>
                <th style="padding: 6px; border: 1px solid #000;">Nama &amp; NIP ASN</th>
                <th style="padding: 6px; border: 1px solid #000;">Pangkat / Golongan</th>
                <th style="padding: 6px; border: 1px solid #000;">Jabatan</th>
                <th style="padding: 6px; border: 1px solid #000;">Target TMT</th>
                <th style="padding: 6px; border: 1px solid #000;">Status Portofolio</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          {/* 3 Posisi TTD: Kiri Kasubbag, Kanan Sekcam, Tengah Bawah Camat */}
          <div style="margin-top: 22px; display: flex; justify-content: space-between; page-break-inside: avoid;">
            <div style="text-align: center; width: 45%;">
              <p style="font-size: 9pt; margin: 0 0 6px 0;">
                Diverifikasi / Diperiksa Oleh,<br/>
                <strong>Kasubag Umum &amp; Kepegawaian</strong>
              </p>
              ${sealKasubbagHtml}
              <p style="font-size: 9.5pt; margin: 4px 0 0; font-weight: bold; text-decoration: underline;">
                Budi Hartono, S.Sos
              </p>
              <p style="font-size: 8.5pt; margin: 0; color: #555;">NIP. 19850101 201001 1 001</p>
            </div>

            <div style="text-align: center; width: 45%;">
              <p style="font-size: 9pt; margin: 0 0 6px 0;">
                Ditelaah / Rekomendasi Paraf Hirarki,<br/>
                <strong>Sekretaris Camat Tamalate</strong>
              </p>
              ${sealSekcamHtml}
              <p style="font-size: 9.5pt; margin: 4px 0 0; font-weight: bold; text-decoration: underline;">
                Ir. H. Syamsul Bahri, M.Si
              </p>
              <p style="font-size: 8.5pt; margin: 0; color: #555;">NIP. 19750819 200112 1 002</p>
            </div>
          </div>

          <div style="margin-top: 20px; text-align: center; page-break-inside: avoid;">
            <p style="font-size: 9.5pt; margin: 0 0 6px 0;">
              Makassar, 19 Juni 2026<br/>
              Mengetahui &amp; Menetapkan,<br/>
              <strong>Camat Tamalate Kota Makassar</strong>
            </p>
            ${sealCamatHtml}
            <p style="font-size: 10pt; margin: 4px 0 0; font-weight: bold; text-decoration: underline;">
              Drs. H. Sutrisno Hadi, M.Si
            </p>
            <p style="font-size: 9pt; margin: 0;">Pembina Tingkat I, Gol. IV/b</p>
            <p style="font-size: 8.5pt; margin: 0; color: #555;">NIP. 19700412 199603 1 002</p>
          </div>
        </body>
        </html>
      `;

      await downloadPdfApi({
        title: `PAKET KOLEKTIF BERKAS ${jenisLayanan.toUpperCase()} (${selectedItems.length} ASN)`,
        nomor: `800.1.3/KOL-${jenisLayanan.toUpperCase()}/${new Date().getFullYear()}`,
        htmlBody: htmlContent,
      });
      setSuccessToast(true);
      setTimeout(() => setSuccessToast(false), 4000);
    } finally {
      setDownloading(false);
    }
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
          borderRadius: 'var(--r-md)',
          boxShadow: 'var(--shadow-lift, 0 20px 25px -5px rgba(0, 0, 0, 0.2))',
          width: '100%',
          maxWidth: '720px',
          maxHeight: '90vh',
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
                PDF Bundler · Subbagian Umum &amp; Kepegawaian Tamalate
              </span>
              <span className="badge badge-info" style={{ fontSize: '10.5px' }}>
                Layanan: {jenisLayanan}
              </span>
            </div>
            <h3 className="heading" style={{ fontSize: '18px', margin: 0 }}>
              Pack 1 Dokumen PDF Massal
            </h3>
            <p className="caption" style={{ margin: '4px 0 0' }}>
              Pilih pemilik dokumen mana saja yang hendak dipaketkan dan digabungkan menjadi 1 file PDF kolektif resmi.
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

        {/* Content Body */}
        <div style={{ padding: '18px 20px', overflowY: 'auto', display: 'grid', gap: '14px', flex: 1 }}>
          {successToast ? (
            <div
              style={{
                background: 'var(--accent-subtle)',
                border: '1px solid var(--accent)',
                color: 'var(--accent)',
                padding: '10px 14px',
                borderRadius: 'var(--r-sm)',
                fontSize: '12.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <i className="ph ph-check-circle" style={{ fontSize: '18px' }} />
              <span>Dokumen pack PDF kolektif berhasil diproses dan diunduh ke perangkat Anda!</span>
            </div>
          ) : null}

          {/* Tombol Opsi Cepat Pemilihan */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <span className="eyebrow" style={{ fontSize: '11px' }}>
              Daftar Pegawai yang Siap Dipaketkan
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button type="button" className="btn btn-ghost btn-xs" onClick={handleSelectComplete}>
                Pilih yang Lengkap ({items.filter((i) => i.isComplete).length})
              </button>
              <button type="button" className="btn btn-ghost btn-xs" onClick={handleSelectAll}>
                Pilih Semua ({items.length})
              </button>
              <button type="button" className="btn btn-ghost btn-xs" onClick={handleDeselectAll}>
                Bersihkan
              </button>
            </div>
          </div>

          {/* Daftar Item ASN dengan Checkbox */}
          <div
            style={{
              maxHeight: '260px',
              overflowY: 'auto',
              border: '1px solid var(--hairline)',
              borderRadius: 'var(--r-sm)',
              padding: '6px',
              display: 'grid',
              gap: '6px',
              background: 'var(--surface-soft)',
            }}
          >
            {items.map((item) => {
              const isChecked = selectedIds.includes(item.id);
              return (
                <label
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 'var(--r-sm)',
                    border: '1px solid var(--hairline)',
                    background: isChecked ? 'var(--surface)' : 'rgba(255,255,255,0.6)',
                    cursor: 'pointer',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleId(item.id)}
                      style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                    />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '13px' }}>{item.nama}</div>
                      <div className="caption mono" style={{ fontSize: '11px' }}>
                        NIP. {item.nip} · {item.pangkat} ({item.golongan})
                      </div>
                      <div className="caption" style={{ fontSize: '10.5px' }}>
                        {item.jabatan} · Target: {item.tmtTarget}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                    <span
                      className={`badge ${item.isComplete ? 'badge-success' : 'badge-warning'} tabular`}
                      style={{ fontSize: '10.5px' }}
                    >
                      {item.lengkapCount}/{item.totalBerkas} Dokumen
                    </span>
                    <span className="caption" style={{ fontSize: '10px' }}>
                      {item.isComplete ? 'Siap Bundler PDF' : 'Berkas Belum Lengkap'}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>

          {/* Pemilihan Metode Signature */}
          <div
            style={{
              padding: '12px 14px',
              background: 'var(--surface-sunken)',
              border: '1px solid var(--hairline)',
              borderRadius: 'var(--r-sm)',
              display: 'grid',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <span className="caption" style={{ fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>
                Metode Pengesahan Signature (3 Posisi TTD):
              </span>
              <span className="caption mono" style={{ fontSize: '10.5px', color: 'var(--muted)' }}>
                Kiri: Kasubbag · Kanan: Sekcam · Bawah: Camat
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className={`chip ${signatureMethod === 'bsre' ? 'is-on' : ''}`}
                onClick={() => setSignatureMethod('bsre')}
                style={{ height: '28px', fontSize: '11px', cursor: 'pointer' }}
              >
                <i className="ph ph-seal-check" style={{ marginRight: '4px' }} />
                <span>TTE BSrE Digital BSSN</span>
              </button>
              <button
                type="button"
                className={`chip ${signatureMethod === 'qr' ? 'is-on' : ''}`}
                onClick={() => setSignatureMethod('qr')}
                style={{ height: '28px', fontSize: '11px', cursor: 'pointer' }}
              >
                <i className="ph ph-qr-code" style={{ marginRight: '4px' }} />
                <span>TTE Visual QR Code</span>
              </button>
              <button
                type="button"
                className={`chip ${signatureMethod === 'basah' ? 'is-on' : ''}`}
                onClick={() => setSignatureMethod('basah')}
                style={{ height: '28px', fontSize: '11px', cursor: 'pointer' }}
              >
                <i className="ph ph-pen-nib" style={{ marginRight: '4px' }} />
                <span>TTD Basah &amp; Cap Stempel Resmi Camat</span>
              </button>
            </div>
          </div>

          {/* Rincian Bundler Kolektif */}
          <div
            style={{
              padding: '12px 16px',
              background: 'var(--surface-sunken)',
              border: '1px solid var(--hairline)',
              borderRadius: 'var(--r-sm)',
              fontSize: '12px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '10px',
            }}
          >
            <div>
              <span className="caption" style={{ fontSize: '10.5px', textTransform: 'uppercase' }}>
                Format Keluaran
              </span>
              <div style={{ fontWeight: 600, marginTop: '2px' }}>1 File PDF Gabungan Kolektif</div>
              <div className="caption" style={{ fontSize: '11px' }}>Dilengkapi Lembar Pengantar &amp; TTE BSrE</div>
            </div>

            <div>
              <span className="caption" style={{ fontSize: '10.5px', textTransform: 'uppercase' }}>
                Pengesahan Resmi
              </span>
              <div style={{ fontWeight: 600, marginTop: '2px' }}>Camat Tamalate &amp; Kasubag Umpeg</div>
              <div className="caption" style={{ fontSize: '11px' }}>Otoritas Pemerintah Kota Makassar</div>
            </div>
          </div>
        </div>

        {/* Footer Modal */}
        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid var(--hairline)',
            background: 'var(--surface-sunken)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <div className="caption" style={{ fontSize: '12px' }}>
            Terpilih: <strong className="tabular">{selectedIds.length}</strong> Dokumen Pegawai
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} disabled={downloading}>
              Tutup
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleDownloadBulkPdf}
              disabled={downloading || selectedIds.length === 0}
            >
              <i className={downloading ? 'ph ph-spinner ph-spin' : 'ph ph-file-pdf'} />
              <span>{downloading ? 'Memproses PDF...' : `Unduh 1 Pack PDF (${selectedIds.length})`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
