'use client';

import React, { useState, useMemo } from 'react';

export interface TargetPegawaiItem {
  nip: string;
  nama: string;
  jabatan: string;
  golongan: string;
  isUrgent?: boolean;
  isHit?: boolean;
  isComplete?: boolean;
}

interface NotifikasiMassalModalProps {
  isOpen: boolean;
  onClose: () => void;
  pegawaiList: TargetPegawaiItem[];
  jenisUsulan: 'KGB' | 'Kenaikan Pangkat' | 'Pensiun' | 'Cuti dan Izin';
  onSendNotifikasi: (targetNips: string[], saluran: string, pesan: string) => void;
}

export function NotifikasiMassalModal({
  isOpen,
  onClose,
  pegawaiList,
  jenisUsulan,
  onSendNotifikasi,
}: NotifikasiMassalModalProps): React.ReactNode {
  const [filterPreset, setFilterPreset] = useState<'semua' | 'urgent' | 'kurang'>('urgent');
  const [selectedNips, setSelectedNips] = useState<string[]>(() => {
    return pegawaiList.filter((p) => p.isUrgent || !p.isComplete).map((p) => p.nip);
  });
  const [saluran, setSaluran] = useState<'portal' | 'wa' | 'email'>('portal');
  const [customPesan, setCustomPesan] = useState<string>(
    `Yth. Bapak/Ibu ASN Kecamatan Tamalate, mohon segera melengkapi dan memperbarui berkas portofolio ${jenisUsulan} Anda melalui Subbagian Umum dan Kepegawaian sebelum batas waktu verifikasi berakhir. Terima kasih.`,
  );

  const filteredPresetList = useMemo(() => {
    if (filterPreset === 'urgent') return pegawaiList.filter((p) => p.isUrgent);
    if (filterPreset === 'kurang') return pegawaiList.filter((p) => !p.isComplete);
    return pegawaiList;
  }, [pegawaiList, filterPreset]);

  // Handler apply preset
  const handleApplyPreset = (preset: 'semua' | 'urgent' | 'kurang') => {
    setFilterPreset(preset);
    if (preset === 'urgent') {
      setSelectedNips(pegawaiList.filter((p) => p.isUrgent).map((p) => p.nip));
    } else if (preset === 'kurang') {
      setSelectedNips(pegawaiList.filter((p) => !p.isComplete).map((p) => p.nip));
    } else {
      setSelectedNips(pegawaiList.map((p) => p.nip));
    }
  };

  const handleToggleNip = (nip: string) => {
    setSelectedNips((prev) =>
      prev.includes(nip) ? prev.filter((n) => n !== nip) : [...prev, nip],
    );
  };

  const handleSelectAll = () => {
    setSelectedNips(filteredPresetList.map((p) => p.nip));
  };

  const handleDeselectAll = () => {
    setSelectedNips([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedNips.length === 0) return;
    onSendNotifikasi(selectedNips, saluran, customPesan);
    onClose();
  };

  if (!isOpen) return null;

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
          maxWidth: '680px',
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
                Broadcast Gateway · Kepegawaian Tamalate
              </span>
              <span className="badge badge-info" style={{ fontSize: '10.5px' }}>
                Layanan: {jenisUsulan}
              </span>
            </div>
            <h3 className="heading" style={{ fontSize: '18px', margin: 0 }}>
              Kirim Notifikasi Peringatan Massal
            </h3>
            <p className="caption" style={{ margin: '4px 0 0' }}>
              Tentukan target audiens penerima dan sesuaikan format pesan pengingat resmi.
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
          <div style={{ padding: '18px 20px', overflowY: 'auto', display: 'grid', gap: '16px', flex: 1 }}>
            {/* 1. Opsi Sasaran Penerima */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="eyebrow" style={{ fontSize: '11px' }}>
                  1. Kategori Target Penerima
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button type="button" className="btn btn-ghost btn-xs" onClick={handleSelectAll}>
                    Pilih Semua ({filteredPresetList.length})
                  </button>
                  <button type="button" className="btn btn-ghost btn-xs" onClick={handleDeselectAll}>
                    Bersihkan
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                <button
                  type="button"
                  className={`chip ${filterPreset === 'urgent' ? 'is-on' : ''}`}
                  onClick={() => handleApplyPreset('urgent')}
                >
                  <i className="ph ph-warning" style={{ marginRight: '4px' }} />
                  <span>Kritis / Urgent ({pegawaiList.filter((p) => p.isUrgent).length})</span>
                </button>
                <button
                  type="button"
                  className={`chip ${filterPreset === 'kurang' ? 'is-on' : ''}`}
                  onClick={() => handleApplyPreset('kurang')}
                >
                  <i className="ph ph-files" style={{ marginRight: '4px' }} />
                  <span>Berkas Kurang ({pegawaiList.filter((p) => !p.isComplete).length})</span>
                </button>
                <button
                  type="button"
                  className={`chip ${filterPreset === 'semua' ? 'is-on' : ''}`}
                  onClick={() => handleApplyPreset('semua')}
                >
                  <i className="ph ph-users" style={{ marginRight: '4px' }} />
                  <span>Semua Terjadwal ({pegawaiList.length})</span>
                </button>
              </div>

              {/* Daftar Checklist Pegawai */}
              <div
                style={{
                  maxHeight: '160px',
                  overflowY: 'auto',
                  border: '1px solid var(--hairline)',
                  borderRadius: 'var(--r-sm)',
                  padding: '6px',
                  display: 'grid',
                  gap: '4px',
                  background: 'var(--surface-soft)',
                }}
              >
                {filteredPresetList.map((p) => {
                  const isChecked = selectedNips.includes(p.nip);
                  return (
                    <label
                      key={p.nip}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        borderRadius: '4px',
                        background: isChecked ? 'var(--surface)' : 'transparent',
                        cursor: 'pointer',
                        fontSize: '12.5px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleNip(p.nip)}
                          style={{ cursor: 'pointer' }}
                        />
                        <div style={{ minWidth: 0 }}>
                          <span style={{ fontWeight: 600 }}>{p.nama}</span>
                          <span className="caption mono" style={{ marginLeft: '8px', fontSize: '11px' }}>
                            {p.nip}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {p.isUrgent ? (
                          <span className="badge badge-danger" style={{ fontSize: '10px' }}>
                            Urgent
                          </span>
                        ) : null}
                        {!p.isComplete ? (
                          <span className="badge badge-warning" style={{ fontSize: '10px' }}>
                            Berkas Kurang
                          </span>
                        ) : (
                          <span className="badge badge-success" style={{ fontSize: '10px' }}>
                            Lengkap
                          </span>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 2. Saluran Pengiriman Notifikasi */}
            <div>
              <span className="eyebrow" style={{ fontSize: '11px', display: 'block', marginBottom: '8px' }}>
                2. Saluran Komunikasi Resmi
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    border: '1px solid var(--hairline)',
                    borderRadius: 'var(--r-sm)',
                    cursor: 'pointer',
                    background: saluran === 'portal' ? 'var(--accent-subtle)' : 'var(--surface)',
                    borderColor: saluran === 'portal' ? 'var(--accent)' : 'var(--hairline)',
                  }}
                >
                  <input
                    type="radio"
                    name="saluran"
                    checked={saluran === 'portal'}
                    onChange={() => setSaluran('portal')}
                  />
                  <div>
                    <div style={{ fontSize: '12.5px', fontWeight: 600 }}>Portal Internal ASN</div>
                    <div className="caption" style={{ fontSize: '10.5px' }}>Notifikasi dashboard</div>
                  </div>
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    border: '1px solid var(--hairline)',
                    borderRadius: 'var(--r-sm)',
                    cursor: 'pointer',
                    background: saluran === 'wa' ? 'var(--accent-subtle)' : 'var(--surface)',
                    borderColor: saluran === 'wa' ? 'var(--accent)' : 'var(--hairline)',
                  }}
                >
                  <input
                    type="radio"
                    name="saluran"
                    checked={saluran === 'wa'}
                    onChange={() => setSaluran('wa')}
                  />
                  <div>
                    <div style={{ fontSize: '12.5px', fontWeight: 600 }}>WhatsApp Gateway</div>
                    <div className="caption" style={{ fontSize: '10.5px' }}>Pesan WhatsApp ASN</div>
                  </div>
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    border: '1px solid var(--hairline)',
                    borderRadius: 'var(--r-sm)',
                    cursor: 'pointer',
                    background: saluran === 'email' ? 'var(--accent-subtle)' : 'var(--surface)',
                    borderColor: saluran === 'email' ? 'var(--accent)' : 'var(--hairline)',
                  }}
                >
                  <input
                    type="radio"
                    name="saluran"
                    checked={saluran === 'email'}
                    onChange={() => setSaluran('email')}
                  />
                  <div>
                    <div style={{ fontSize: '12.5px', fontWeight: 600 }}>Pos-el Kedinasan</div>
                    <div className="caption" style={{ fontSize: '10.5px' }}>@makassarkota.go.id</div>
                  </div>
                </label>
              </div>
            </div>

            {/* 3. Isi Pesan Pengingat */}
            <div>
              <span className="eyebrow" style={{ fontSize: '11px', display: 'block', marginBottom: '6px' }}>
                3. Teks Pesan Pengingat Kedinasan
              </span>
              <textarea
                value={customPesan}
                onChange={(e) => setCustomPesan(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--r-sm)',
                  border: '1px solid var(--hairline)',
                  background: 'var(--surface)',
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
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <div className="caption" style={{ fontSize: '12px' }}>
              Penerima Terpilih: <strong className="tabular">{selectedNips.length}</strong> Pegawai
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
                Batal
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={selectedNips.length === 0}
              >
                <i className="ph ph-paper-plane-tilt" />
                <span>Kirim Notifikasi ({selectedNips.length})</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
