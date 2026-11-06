'use client';

import React, { useState } from 'react';
import type { UsulanRecord } from '@/lib/workspace-api';

interface TolakRevisiModalProps {
  isOpen: boolean;
  onClose: () => void;
  usulan: UsulanRecord | null;
  currentRoleLabel: string;
  onConfirmRevert: (usulanId: string, catatan: string) => Promise<void>;
}

export function TolakRevisiModal({
  isOpen,
  onClose,
  usulan,
  currentRoleLabel,
  onConfirmRevert,
}: TolakRevisiModalProps): React.ReactNode {
  const [catatan, setCatatan] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  if (!isOpen || !usulan) return null;

  // Tentukan tahap asal dan tahap tujuan pengembalian
  const currentTahap = usulan.tahap;
  const targetTahap = Math.max(1, currentTahap - 1);

  const getStageRoleName = (tahap: number) => {
    switch (tahap) {
      case 1:
        return 'Operator Umpeg (Pemeriksaan Berkas)';
      case 2:
        return 'Kasubag Umpeg (Validasi Substantif)';
      case 3:
        return 'Sekretaris Camat (Telaah & Rekomendasi)';
      case 4:
        return 'Camat Tamalate (Persetujuan & TTE)';
      case 5:
        return 'Operator Umpeg (Disetujui Camat - Siap Pack PDF)';
      default:
        return `Tahap ${tahap}`;
    }
  };

  const QUICK_REASONS = [
    'Salinan SK Pangkat/KGB terakhir belum dilegalisir basah.',
    'Penilaian Kinerja (SKP) tahun terakhir belum memenuhi predikat minimal Baik.',
    'Scan dokumen buram atau tidak terbaca dengan jelas, mohon scan ulang dari berkas asli.',
    'Terdapat ketidaksesuaian data identitas/NIP antara berkas fisik dan pangkalan data.',
    'Surat pernyataan melaksanakan tugas (SPMT) belum ditandatangani pejabat berwenang.',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catatan.trim()) return;
    try {
      setSubmitting(true);
      await onConfirmRevert(usulan.id, catatan.trim());
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10002,
        background: 'rgba(15, 23, 42, 0.7)',
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
          maxWidth: '580px',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out',
        }}
      >
        {/* Header Modal */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--hairline)',
            background: 'rgba(239, 68, 68, 0.06)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '12px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge badge-danger" style={{ fontSize: '10.5px' }}>
                Pengembalian Berkas SOP
              </span>
              <span className="caption" style={{ fontSize: '11px' }}>
                Pengembali: {currentRoleLabel}
              </span>
            </div>
            <h3 className="heading" style={{ fontSize: '17px', margin: 0, color: 'var(--danger, #dc2626)' }}>
              Kembalikan Berkas untuk Perbaikan
            </h3>
            <p className="caption" style={{ margin: '4px 0 0' }}>
              Berkas akan diturunkan kembali ke tahapan sebelumnya untuk diperiksa dan disempurnakan.
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

        <form onSubmit={handleSubmit}>
          <div style={{ padding: '18px 20px', display: 'grid', gap: '14px' }}>
            {/* Indikator Alur Mundur Berjenjang */}
            <div
              style={{
                padding: '12px 14px',
                background: 'var(--surface-sunken)',
                border: '1px solid var(--hairline)',
                borderRadius: 'var(--r-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px',
                fontSize: '12px',
              }}
            >
              <div>
                <span className="caption" style={{ fontSize: '10.5px' }}>Posisi Saat Ini</span>
                <div style={{ fontWeight: 600, color: 'var(--danger, #dc2626)' }}>
                  {getStageRoleName(currentTahap)}
                </div>
              </div>

              <i className="ph ph-arrow-left" style={{ fontSize: '20px', color: 'var(--muted)' }} />

              <div style={{ textAlign: 'right' }}>
                <span className="caption" style={{ fontSize: '10.5px' }}>Tujuan Pengembalian</span>
                <div style={{ fontWeight: 600, color: 'var(--accent)' }}>
                  {getStageRoleName(targetTahap)}
                </div>
              </div>
            </div>

            {/* Identitas ASN */}
            <div style={{ fontSize: '12.5px' }}>
              <strong>{usulan.nama}</strong> · <span className="mono">NIP {usulan.nip}</span>
              <div className="caption">
                {usulan.jabatan} · {usulan.pangkat} ({usulan.golongan}) · Usulan: {usulan.jenis?.toUpperCase()}
              </div>
            </div>

            {/* Template Alasan Cepat */}
            <div>
              <span className="caption" style={{ fontSize: '11px', display: 'block', marginBottom: '6px' }}>
                Pilih Alasan Pengembalian Cepat:
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {QUICK_REASONS.map((reason, rIdx) => (
                  <button
                    key={rIdx}
                    type="button"
                    style={{
                      textAlign: 'left',
                      padding: '6px 10px',
                      fontSize: '11.5px',
                      borderRadius: '4px',
                      border: '1px solid var(--hairline)',
                      background: 'var(--surface-soft)',
                      cursor: 'pointer',
                      lineHeight: 1.35,
                    }}
                    onClick={() => setCatatan(reason)}
                  >
                    {reason}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Catatan Revisi */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Catatan Revisi / Instruksi Perbaikan Khusus (Wajib Diisi):
              </label>
              <textarea
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                rows={3}
                required
                placeholder="Tuliskan catatan detail dokumen mana yang harus diperbaiki..."
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--r-sm)',
                  border: '1px solid var(--hairline)',
                  fontSize: '12.5px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                }}
              />
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
              gap: '10px',
            }}
          >
            <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} disabled={submitting}>
              Batal
            </button>

            <button
              type="submit"
              className="btn btn-danger btn-sm"
              disabled={submitting || !catatan.trim()}
              style={{ background: '#dc2626', color: '#ffffff', borderColor: '#b91c1c' }}
            >
              <i className="ph ph-arrow-u-up-left" />
              <span>{submitting ? 'Mengembalikan...' : `Kembalikan ke Tahap ${targetTahap}`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
