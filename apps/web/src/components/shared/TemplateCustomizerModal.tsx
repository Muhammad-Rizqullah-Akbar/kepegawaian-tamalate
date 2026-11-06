'use client';

import React, { useState } from 'react';
import {
  DocumentTemplateRegistry,
  loadTemplateRegistry,
  resetTemplateRegistry,
  saveTemplateRegistry,
} from '../../lib/template-schema';

export function TemplateCustomizerModal({
  isOpen,
  onClose,
  actorRole = 'Admin Tata Naskah',
  onSaved,
}: {
  isOpen: boolean;
  onClose: () => void;
  actorRole?: string;
  onSaved?: (next: DocumentTemplateRegistry) => void;
}) {
  const [draft, setDraft] = useState<DocumentTemplateRegistry>(() => loadTemplateRegistry());
  const [activeDoc, setActiveDoc] = useState<'disposisi' | 'agenda' | 'cuti'>('disposisi');
  const [newRecipientLabel, setNewRecipientLabel] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    const saved = saveTemplateRegistry(draft, actorRole);
    setDraft(saved);
    setStatusMsg('Template berhasil disimpan dan disinkronkan ke penyimpanan arsip.');
    if (onSaved) onSaved(saved);
  };

  const handleReset = () => {
    const def = resetTemplateRegistry();
    setDraft(def);
    setStatusMsg('Template dikembalikan ke susunan resmi awal.');
    if (onSaved) onSaved(def);
  };

  const addRecipient = () => {
    if (!newRecipientLabel.trim()) return;
    const nextId = String(draft.lembarDisposisi.daftarTujuan.length + 1);
    setDraft({
      ...draft,
      lembarDisposisi: {
        ...draft.lembarDisposisi,
        daftarTujuan: [
          ...draft.lembarDisposisi.daftarTujuan,
          {
            id: nextId,
            label: newRecipientLabel.trim(),
            jabatan: newRecipientLabel.trim(),
            enabled: true,
          },
        ],
      },
    });
    setNewRecipientLabel('');
  };

  return (
    <div className="modal-overlay is-open" onClick={onClose}>
      <div
        className="modal-dialog modal-xl"
        style={{ maxWidth: '860px', width: '95vw' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <h2>
            <i className="ph ph-sliders-horizontal" style={{ color: 'var(--accent)' }} />{' '}
            Kostumisasi Template Dokumen &amp; Integrasi OnlyOffice
          </h2>
          <button className="modal-close" type="button" onClick={onClose}>
            <i className="ph ph-x" />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'grid', gap: '16px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <button
              type="button"
              className={`btn btn-sm ${activeDoc === 'disposisi' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveDoc('disposisi')}
            >
              <i className="ph ph-file-text" /> Lembar Disposisi
            </button>
            <button
              type="button"
              className={`btn btn-sm ${activeDoc === 'agenda' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveDoc('agenda')}
            >
              <i className="ph ph-book-open-text" /> Buku Agenda Surat
            </button>
            <button
              type="button"
              className={`btn btn-sm ${activeDoc === 'cuti' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveDoc('cuti')}
            >
              <i className="ph ph-airplane-tilt" /> Formulir Surat Cuti
            </button>
          </div>

          {statusMsg && (
            <div className="cam-banner ok">
              <i className="ph ph-check-circle" />
              <span>{statusMsg}</span>
            </div>
          )}

          {activeDoc === 'disposisi' && (
            <div style={{ display: 'grid', gap: '14px' }}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Judul Dokumen</label>
                  <input
                    className="form-control"
                    value={draft.lembarDisposisi.judulDokumen}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        lembarDisposisi: { ...draft.lembarDisposisi, judulDokumen: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Label Nomor Agenda</label>
                  <input
                    className="form-control"
                    value={draft.lembarDisposisi.labelAgenda}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        lembarDisposisi: { ...draft.lembarDisposisi, labelAgenda: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Pejabat Tertanda 1 (Sekcam)</label>
                  <input
                    className="form-control"
                    value={draft.lembarDisposisi.namaTertanda1}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        lembarDisposisi: { ...draft.lembarDisposisi, namaTertanda1: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Pejabat Tertanda 2 (Camat)</label>
                  <input
                    className="form-control"
                    value={draft.lembarDisposisi.namaTertanda2}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        lembarDisposisi: { ...draft.lembarDisposisi, namaTertanda2: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Judul Kolom Penerima</label>
                  <input
                    className="form-control"
                    value={draft.lembarDisposisi.judulKolomTujuan}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        lembarDisposisi: {
                          ...draft.lembarDisposisi,
                          judulKolomTujuan: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Judul Kolom Instruksi</label>
                  <input
                    className="form-control"
                    value={draft.lembarDisposisi.judulKolomInstruksi}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        lembarDisposisi: {
                          ...draft.lembarDisposisi,
                          judulKolomInstruksi: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                  Daftar Tujuan Disposisi (Dapat ditambah, diubah, atau dinonaktifkan)
                </label>
                <div style={{ display: 'grid', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
                  {draft.lembarDisposisi.daftarTujuan.map((r, idx) => (
                    <div
                      key={r.id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'auto minmax(0, 1fr)',
                        gap: '8px',
                        alignItems: 'center',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={r.enabled}
                        onChange={(e) => {
                          const next = [...draft.lembarDisposisi.daftarTujuan];
                          next[idx] = { ...r, enabled: e.target.checked };
                          setDraft({
                            ...draft,
                            lembarDisposisi: { ...draft.lembarDisposisi, daftarTujuan: next },
                          });
                        }}
                      />
                      <input
                        className="form-control"
                        style={{ padding: '6px 10px', fontSize: '12.5px' }}
                        value={r.label}
                        onChange={(e) => {
                          const next = [...draft.lembarDisposisi.daftarTujuan];
                          next[idx] = { ...r, label: e.target.value };
                          setDraft({
                            ...draft,
                            lembarDisposisi: { ...draft.lembarDisposisi, daftarTujuan: next },
                          });
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <input
                    className="form-control"
                    placeholder="Tambah jabatan penerima disposisi baru..."
                    value={newRecipientLabel}
                    onChange={(e) => setNewRecipientLabel(e.target.value)}
                  />
                  <button type="button" className="btn btn-ghost btn-sm" onClick={addRecipient}>
                    <i className="ph ph-plus" /> Tambah
                  </button>
                </div>
              </div>

              <div
                style={{
                  padding: '12px',
                  background: 'var(--surface-soft)',
                  border: '1px solid var(--hairline)',
                  borderRadius: '10px',
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--heading)', marginBottom: '6px' }}>
                  <i className="ph ph-file-doc" /> Pengikatan Berkas Template OnlyOffice (.docx)
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Kunci Template OnlyOffice</label>
                    <input
                      className="form-control mono"
                      value={draft.lembarDisposisi.onlyOffice.templateKey}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          lembarDisposisi: {
                            ...draft.lembarDisposisi,
                            onlyOffice: {
                              ...draft.lembarDisposisi.onlyOffice,
                              templateKey: e.target.value,
                            },
                          },
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Lokasi Berkas pada Penyimpanan</label>
                    <input
                      className="form-control mono"
                      value={draft.lembarDisposisi.onlyOffice.s3ObjectKey}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          lembarDisposisi: {
                            ...draft.lembarDisposisi,
                            onlyOffice: {
                              ...draft.lembarDisposisi.onlyOffice,
                              s3ObjectKey: e.target.value,
                            },
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeDoc === 'agenda' && (
            <div style={{ display: 'grid', gap: '14px' }}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Kop Baris 1 (Pemerintah Daerah)</label>
                  <input
                    className="form-control"
                    value={draft.bukuAgenda.kopPemerintah}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        bukuAgenda: { ...draft.bukuAgenda, kopPemerintah: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Kop Baris 2 (Unit Kecamatan)</label>
                  <input
                    className="form-control"
                    value={draft.bukuAgenda.kopKecamatan}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        bukuAgenda: { ...draft.bukuAgenda, kopKecamatan: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="form-group full">
                  <label>Judul Buku Agenda</label>
                  <input
                    className="form-control"
                    value={draft.bukuAgenda.judulDokumen}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        bukuAgenda: { ...draft.bukuAgenda, judulDokumen: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="form-group full">
                  <label>Alamat Kantor pada Kop Surat</label>
                  <input
                    className="form-control"
                    value={draft.bukuAgenda.alamatKantor}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        bukuAgenda: { ...draft.bukuAgenda, alamatKantor: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Pejabat Kiri (Mengetahui)</label>
                  <input
                    className="form-control"
                    value={draft.bukuAgenda.namaPejabatKiri}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        bukuAgenda: { ...draft.bukuAgenda, namaPejabatKiri: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Pejabat Kanan (Operator Pengendali)</label>
                  <input
                    className="form-control"
                    value={draft.bukuAgenda.namaPejabatKanan}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        bukuAgenda: { ...draft.bukuAgenda, namaPejabatKanan: e.target.value },
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                  Susunan Kolom Tabel Buku Agenda (Centang untuk menampilkan &amp; sesuaikan judul kolom)
                </label>
                <div style={{ display: 'grid', gap: '6px' }}>
                  {draft.bukuAgenda.kolomTabel.map((col, idx) => (
                    <div
                      key={col.key}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'auto minmax(0, 1fr) 80px',
                        gap: '8px',
                        alignItems: 'center',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={col.enabled}
                        onChange={(e) => {
                          const next = [...draft.bukuAgenda.kolomTabel];
                          next[idx] = { ...col, enabled: e.target.checked };
                          setDraft({
                            ...draft,
                            bukuAgenda: { ...draft.bukuAgenda, kolomTabel: next },
                          });
                        }}
                      />
                      <input
                        className="form-control"
                        style={{ padding: '6px 10px', fontSize: '12.5px' }}
                        value={col.label}
                        onChange={(e) => {
                          const next = [...draft.bukuAgenda.kolomTabel];
                          next[idx] = { ...col, label: e.target.value };
                          setDraft({
                            ...draft,
                            bukuAgenda: { ...draft.bukuAgenda, kolomTabel: next },
                          });
                        }}
                      />
                      <span className="mono" style={{ fontSize: '11.5px', color: 'var(--muted)' }}>
                        {col.widthPercent}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeDoc === 'cuti' && (
            <div style={{ display: 'grid', gap: '14px' }}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Tujuan Yth.</label>
                  <input
                    className="form-control"
                    value={draft.suratCuti.tujuanYth}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        suratCuti: { ...draft.suratCuti, tujuanYth: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Kota Tempat Terbit</label>
                  <input
                    className="form-control"
                    value={draft.suratCuti.kotaSurat}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        suratCuti: { ...draft.suratCuti, kotaSurat: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Judul Bagian I (Data Pegawai)</label>
                  <input
                    className="form-control"
                    value={draft.suratCuti.judulBagianDataPegawai}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        suratCuti: { ...draft.suratCuti, judulBagianDataPegawai: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Judul Bagian II (Jenis Cuti)</label>
                  <input
                    className="form-control"
                    value={draft.suratCuti.judulBagianJenisCuti}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        suratCuti: { ...draft.suratCuti, judulBagianJenisCuti: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Pejabat Pertimbangan Atasan Langsung</label>
                  <input
                    className="form-control"
                    value={draft.suratCuti.atasanDefaultNama}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        suratCuti: { ...draft.suratCuti, atasanDefaultNama: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Pejabat Berwenang Memberikan Cuti</label>
                  <input
                    className="form-control"
                    value={draft.suratCuti.pejabatDefaultNama}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        suratCuti: { ...draft.suratCuti, pejabatDefaultNama: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-foot">
          <button type="button" className="btn btn-ghost" onClick={handleReset}>
            <i className="ph ph-arrow-counter-clockwise" /> Kembalikan Bawaan
          </button>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Tutup
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSave}>
            <i className="ph ph-floppy-disk" /> Simpan Template
          </button>
        </div>
      </div>
    </div>
  );
}
