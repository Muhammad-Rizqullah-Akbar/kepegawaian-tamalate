'use client';

import React, { useState } from 'react';
import type { UsulanRecord, UsulanBerkasRecord } from '@/lib/workspace-api';
import { PdfDocumentPreviewModal } from './PdfDocumentPreviewModal';
import { TolakRevisiModal } from './TolakRevisiModal';

interface CekBerkasModalProps {
  isOpen: boolean;
  onClose: () => void;
  usulan: UsulanRecord | null;
  onToggleBerkas?: ((usulanId: string, kodeBerkas: string, lengkap: boolean) => Promise<void>) | undefined;
  onOpenPackPdf?: ((usulan: UsulanRecord) => void) | undefined;
  onAdvanceUsulan?: ((usulanId: string, signatureMethod?: 'bsre' | 'qr' | 'basah') => Promise<void>) | undefined;
  onRevertUsulan?: ((usulanId: string, catatan: string) => Promise<void>) | undefined;
  currentRoleKey?: string | undefined;
  currentRoleLabel: string;
}

export function CekBerkasModal({
  isOpen,
  onClose,
  usulan,
  onToggleBerkas,
  onOpenPackPdf,
  onAdvanceUsulan,
  onRevertUsulan,
  currentRoleKey = 'operator',
  currentRoleLabel,
}: CekBerkasModalProps): React.ReactNode {
  const [previewBerkas, setPreviewBerkas] = useState<UsulanBerkasRecord | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [tolakModalOpen, setTolakModalOpen] = useState(false);
  const [signatureMethod, setSignatureMethod] = useState<'bsre' | 'qr' | 'basah'>(
    usulan?.signatureMethod || 'bsre',
  );

  if (!isOpen || !usulan) return null;

  const lengkapCount = usulan.berkas.filter((b) => b.lengkap).length;
  const totalBerkas = usulan.berkas.length;
  const pct = Math.round((lengkapCount / totalBerkas) * 100);
  const isComplete = lengkapCount === totalBerkas;

  const getStageTitle = (tahap: number) => {
    switch (tahap) {
      case 1:
        return 'Tahap 1: Pemeriksaan Berkas (Operator Umpeg)';
      case 2:
        return 'Tahap 2: Validasi Substantif (Kasubag Umpeg)';
      case 3:
        return 'Tahap 3: Telaah & Rekomendasi (Sekretaris Camat)';
      case 4:
        return 'Tahap 4: Persetujuan & TTE BSrE (Camat Tamalate)';
      case 5:
        return 'Tahap 5: Disetujui Camat - Siap Pack PDF (Kembali ke Operator)';
      default:
        return `Tahap ${tahap}`;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
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
          maxWidth: '720px',
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
            padding: '16px 22px',
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
                Verifikasi Dokumen · Subbagian Umum &amp; Kepegawaian Tamalate
              </span>
              <span className="badge badge-info tabular" style={{ fontSize: '10.5px' }}>
                Peran Aktif: {currentRoleLabel}
              </span>
            </div>
            <h3 className="heading" style={{ fontSize: '18px', margin: 0 }}>
              Pemeriksaan Kelengkapan Dokumen Portofolio
            </h3>
            <p className="caption" style={{ margin: '4px 0 0' }}>
              Klik tombol pratinjau dokumen untuk memeriksa fisik PDF satu per satu sebelum validasi SOP.
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

        {/* Ringkasan Identitas Pegawai */}
        <div
          style={{
            padding: '14px 22px',
            background: 'var(--surface-soft, rgba(0,0,0,0.02))',
            borderBottom: '1px solid var(--hairline)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
          }}
        >
          <div>
            <span className="caption" style={{ fontSize: '10.5px', textTransform: 'uppercase' }}>
              Identitas Pegawai
            </span>
            <div style={{ fontWeight: 600, fontSize: '13.5px', marginTop: '2px' }}>{usulan.nama}</div>
            <div className="caption mono" style={{ fontSize: '11.5px' }}>
              NIP. {usulan.nip}
            </div>
          </div>

          <div>
            <span className="caption" style={{ fontSize: '10.5px', textTransform: 'uppercase' }}>
              Pangkat / Golongan &amp; Jabatan
            </span>
            <div style={{ fontWeight: 500, fontSize: '13px', marginTop: '2px' }}>
              {usulan.pangkat} ({usulan.golongan})
            </div>
            <div className="caption" style={{ fontSize: '11.5px' }}>
              {usulan.jabatan}
            </div>
          </div>

          <div>
            <span className="caption" style={{ fontSize: '10.5px', textTransform: 'uppercase' }}>
              Rencana Target &amp; Jenis Layanan
            </span>
            <div style={{ fontWeight: 600, fontSize: '13px', marginTop: '2px', color: 'var(--accent)' }}>
              Target: {usulan.tmtTarget}
            </div>
            <div className="caption" style={{ fontSize: '11.5px' }}>
              Layanan: {usulan.jenis?.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Banner Status SOP Berjenjang & Catatan Revisi */}
        <div style={{ padding: '12px 22px', borderBottom: '1px solid var(--hairline)', background: 'var(--surface)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-info tabular" style={{ fontSize: '11px', fontWeight: 600 }}>
                {getStageTitle(usulan.tahap)}
              </span>
              {usulan.tahap === 5 ? (
                <span className="badge badge-success" style={{ fontSize: '10.5px' }}>
                  Disetujui Camat
                </span>
              ) : null}
            </div>

            <span
              className={`badge ${isComplete ? 'badge-ok' : 'badge-warn'} tabular`}
              style={{ fontSize: '11px' }}
            >
              {isComplete ? '100% Berkas Lengkap' : `${pct}% (${lengkapCount}/${totalBerkas})`}
            </span>
          </div>

          {/* Progress Bar Kelengkapan Dokumen */}
          <div
            style={{
              width: '100%',
              height: '6px',
              background: 'var(--hairline)',
              borderRadius: '3px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${pct}%`,
                height: '100%',
                background: isComplete ? 'var(--success, #16a34a)' : 'var(--accent)',
                transition: 'width 0.3s ease',
              }}
            />
          </div>

          {/* Banner Catatan Revisi jika ada pengembalian berkas */}
          {usulan.catatanRevisi ? (
            <div
              style={{
                marginTop: '10px',
                padding: '8px 12px',
                background: '#fffbeb',
                border: '1px solid #fef3c7',
                borderLeft: '4px solid #f59e0b',
                borderRadius: '4px',
                fontSize: '12px',
                color: '#92400e',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
              }}
            >
              <i className="ph ph-warning" style={{ fontSize: '16px', marginTop: '2px', flexShrink: 0 }} />
              <div>
                <strong>Catatan Revisi dari Pejabat Pemeriksa:</strong>
                <div style={{ marginTop: '2px' }}>{usulan.catatanRevisi}</div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Daftar Item Dokumen yang Diperiksa */}
        <div style={{ padding: '16px 22px', overflowY: 'auto', flex: 1, display: 'grid', gap: '8px' }}>
          <span className="caption" style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 600 }}>
            Daftar Berkas Persyaratan (Klik tombol preview untuk melihat lembar PDF asli)
          </span>

          {usulan.berkas.map((b, bIdx) => (
            <div
              key={b.kode}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 14px',
                borderRadius: 'var(--r-sm)',
                border: '1px solid var(--hairline)',
                background: b.lengkap ? 'rgba(22, 163, 74, 0.04)' : 'rgba(239, 68, 68, 0.03)',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                <span
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: b.lengkap ? 'rgba(22, 163, 74, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: b.lengkap ? 'var(--success, #16a34a)' : 'var(--danger, #dc2626)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 600,
                    flexShrink: 0,
                  }}
                >
                  {bIdx + 1}
                </span>

                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, lineHeight: 1.35 }}>
                    {b.nama}
                  </div>
                  <div className="caption" style={{ fontSize: '11px', marginTop: '2px' }}>
                    Kode: <span className="mono">{b.kode}</span> · Format: PDF Digital
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                {/* Tombol Preview PDF Satu per Satu */}
                <button
                  type="button"
                  className="btn btn-secondary btn-xs"
                  style={{ height: '28px', fontSize: '11.5px' }}
                  title="Klik untuk membuka pratinjau lembar dokumen PDF ini"
                  onClick={() => {
                    setPreviewBerkas(b);
                    setPreviewModalOpen(true);
                  }}
                >
                  <i className="ph ph-eye" style={{ marginRight: '4px' }} />
                  <span>Preview PDF</span>
                </button>

                {/* Tombol Toggle Status Lengkap */}
                <button
                  type="button"
                  className={`chip ${b.lengkap ? 'is-on' : ''}`}
                  style={{ height: '28px', fontSize: '11.5px', cursor: 'pointer' }}
                  onClick={async () => {
                    if (onToggleBerkas) {
                      await onToggleBerkas(usulan.id, b.kode, !b.lengkap);
                    }
                  }}
                  title="Klik untuk mengubah status kelengkapan dokumen ini"
                >
                  <i
                    className={`ph ${b.lengkap ? 'ph-check-circle' : 'ph-x-circle'}`}
                    style={{ marginRight: '4px' }}
                  />
                  <span>{b.lengkap ? 'Lengkap' : 'Kurang'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pemilihan Metode Signature Sebelum Validasi SOP */}
        {usulan.tahap < 5 && (
          <div
            style={{
              padding: '10px 22px',
              background: 'var(--surface-soft)',
              borderTop: '1px solid var(--hairline)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <span className="caption" style={{ fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>
              Pilih Metode Signature Pengesahan:
            </span>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className={`chip ${signatureMethod === 'bsre' ? 'is-on' : ''}`}
                onClick={() => setSignatureMethod('bsre')}
                style={{ height: '26px', fontSize: '11px', cursor: 'pointer' }}
              >
                <i className="ph ph-seal-check" style={{ marginRight: '4px' }} />
                <span>TTE BSrE Digital (BSSN)</span>
              </button>
              <button
                type="button"
                className={`chip ${signatureMethod === 'qr' ? 'is-on' : ''}`}
                onClick={() => setSignatureMethod('qr')}
                style={{ height: '26px', fontSize: '11px', cursor: 'pointer' }}
              >
                <i className="ph ph-qr-code" style={{ marginRight: '4px' }} />
                <span>TTE Visual QR Code</span>
              </button>
              <button
                type="button"
                className={`chip ${signatureMethod === 'basah' ? 'is-on' : ''}`}
                onClick={() => setSignatureMethod('basah')}
                style={{ height: '26px', fontSize: '11px', cursor: 'pointer' }}
              >
                <i className="ph ph-pen-nib" style={{ marginRight: '4px' }} />
                <span>TTD Basah &amp; Cap Stempel Resmi</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer Aksi Modal & Kontrol SOP Berjenjang */}
        <div
          style={{
            padding: '14px 22px',
            borderTop: '1px solid var(--hairline)',
            background: 'var(--surface-sunken)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div className="caption" style={{ fontSize: '11.5px' }}>
            {usulan.tahap === 5
              ? 'Telah disahkan Camat Tamalate. Berkas kembali ke Operator untuk analisis & Pack 1 PDF.'
              : isComplete
                ? 'Berkas lengkap. Silakan lakukan validasi SOP atau teruskan ke jenjang berikutnya.'
                : 'Lengkapi dokumen yang masih bertanda kurang sebelum diajukan ke tahap berikutnya.'}
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
              Tutup
            </button>

            {/* Tombol Kembalikan Berkas (Hanya aktif jika tahap > 1 dan bukan operator murni) */}
            {usulan.tahap > 1 && currentRoleKey !== 'operator' && onRevertUsulan ? (
              <button
                type="button"
                className="btn btn-danger btn-sm"
                style={{ background: '#dc2626', color: '#fff', borderColor: '#b91c1c' }}
                onClick={() => setTolakModalOpen(true)}
                title="Tolak / Kembalikan berkas ke tahapan sebelumnya dengan catatan revisi"
              >
                <i className="ph ph-arrow-u-up-left" />
                <span>Kembalikan Berkas</span>
              </button>
            ) : null}

            {/* Tombol Majukan / Validasi SOP Berjenjang */}
            {usulan.tahap < 5 && onAdvanceUsulan ? (
              <button
                type="button"
                className="btn btn-accent btn-sm"
                disabled={!isComplete && usulan.tahap === 1}
                onClick={async () => {
                  await onAdvanceUsulan(usulan.id, signatureMethod);
                  onClose();
                }}
                title="Setujui dan teruskan berkas ke jenjang SOP berikutnya"
              >
                <i className="ph ph-check" />
                <span>
                  {usulan.tahap === 1
                    ? 'Ajukan ke Kasubag Umpeg'
                    : usulan.tahap === 2
                      ? 'Validasi ke Sekcam'
                      : usulan.tahap === 3
                        ? 'Teruskan ke Camat'
                        : 'Setujui & TTE Camat'}
                </span>
              </button>
            ) : null}

            {/* Tombol Pack 1 PDF (Jika sudah di tahap 5 atau berkas 100% lengkap) */}
            {onOpenPackPdf ? (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  onClose();
                  onOpenPackPdf(usulan);
                }}
                title="Kemas seluruh berkas ini menjadi 1 dokumen pack PDF bersertifikat BSrE"
              >
                <i className="ph ph-file-pdf" />
                <span>{usulan.tahap === 5 ? 'Pack 1 PDF (Camat Approved)' : 'Pack 1 PDF'}</span>
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Sub-modal Pratinjau Dokumen PDF Satu per Satu */}
      {previewModalOpen && previewBerkas ? (
        <PdfDocumentPreviewModal
          isOpen={previewModalOpen}
          onClose={() => {
            setPreviewModalOpen(false);
            setPreviewBerkas(null);
          }}
          berkas={previewBerkas}
          usulan={usulan}
          onToggleStatus={async (kode, lengkap) => {
            if (onToggleBerkas) {
              await onToggleBerkas(usulan.id, kode, lengkap);
              setPreviewBerkas((prev) => (prev ? { ...prev, lengkap } : null));
            }
          }}
        />
      ) : null}

      {/* Sub-modal Tolak / Pengembalian Berkas Berjenjang */}
      {tolakModalOpen ? (
        <TolakRevisiModal
          isOpen={tolakModalOpen}
          onClose={() => setTolakModalOpen(false)}
          usulan={usulan}
          currentRoleLabel={currentRoleLabel}
          onConfirmRevert={async (uId, catatan) => {
            if (onRevertUsulan) {
              await onRevertUsulan(uId, catatan);
              onClose();
            }
          }}
        />
      ) : null}
    </div>
  );
}
