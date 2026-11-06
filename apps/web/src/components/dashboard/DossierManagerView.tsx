'use client';

import React, { useState, useMemo } from 'react';
import type { DossierRecord, PegawaiRecord } from '@/lib/workspace-api';

interface DossierManagerViewProps {
  dossierList: DossierRecord[];
  pegawaiList: PegawaiRecord[];
  currentRole: {
    nip: string;
    nama: string;
    label: string;
  };
  onUploadDossier: (payload: {
    pegawaiNip: string;
    pegawaiNama: string;
    partisi: string;
    judul: string;
    ukuranKb: number;
    isGlobal?: boolean;
    folder?: string;
    accessLevel?: 'publik' | 'struktural' | 'rahasia';
  }) => Promise<void>;
  onUpdateDossierList: (newList: DossierRecord[]) => void;
  onPreviewPdf: (title: string, subtitle: string) => void;
}

export function DossierManagerView({
  dossierList,
  pegawaiList,
  currentRole,
  onUploadDossier,
  onUpdateDossierList,
  onPreviewPdf,
}: DossierManagerViewProps): React.ReactNode {
  const [activeTab, setActiveTab] = useState<'individual' | 'global'>('individual');

  // State untuk Tab 1: Dossier Individu
  const [selectedPegawaiNip, setSelectedPegawaiNip] = useState<string>('all');
  const [searchDossier, setSearchDossier] = useState<string>('');
  const [requestModalOpen, setRequestModalOpen] = useState<boolean>(false);
  const [selectedFileForRequest, setSelectedFileForRequest] = useState<DossierRecord | null>(null);
  const [requestReason, setRequestReason] = useState<string>('Pemeriksaan berkas usulan portofolio kepegawaian berkala.');
  const [requestToast, setRequestToast] = useState<string>('');

  // State untuk Tab 2: Global Dossier (Google Drive Concept)
  const [currentFolder, setCurrentFolder] = useState<string>(''); // empty means root
  const [folderList, setFolderList] = useState<string[]>([
    'SK Camat 2026',
    'Surat Edaran Sekda',
    'Perwali & Edaran Walikota',
    'SOP Pelayanan Terpadu',
    'Kebijakan Strategis Pimpinan',
    'Juknis Kepegawaian BKN',
  ]);
  const [createFolderModalOpen, setCreateFolderModalOpen] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>('');

  // Upload Global Modal
  const [uploadGlobalModalOpen, setUploadGlobalModalOpen] = useState<boolean>(false);
  const [uploadFileName, setUploadFileName] = useState<string>('');
  const [uploadFolderTarget, setUploadFolderTarget] = useState<string>('');
  const [uploadAccessLevel, setUploadAccessLevel] = useState<'publik' | 'struktural' | 'rahasia'>('publik');
  const [uploadPartition, setUploadPartition] = useState<string>('SK Camat');

  // Filter individual dossiers
  const individualDossiers = useMemo(() => {
    return dossierList.filter((d) => !d.isGlobal);
  }, [dossierList]);

  const filteredIndividualDossiers = useMemo(() => {
    return individualDossiers.filter((d) => {
      if (selectedPegawaiNip !== 'all' && d.pegawaiNip !== selectedPegawaiNip) return false;
      if (!searchDossier.trim()) return true;
      const q = searchDossier.toLowerCase();
      return (
        d.judul.toLowerCase().includes(q) ||
        d.pegawaiNama.toLowerCase().includes(q) ||
        d.pegawaiNip.toLowerCase().includes(q) ||
        d.partisi.toLowerCase().includes(q)
      );
    });
  }, [individualDossiers, selectedPegawaiNip, searchDossier]);

  // Global dossiers
  const globalDossiers = useMemo(() => {
    return dossierList.filter((d) => d.isGlobal);
  }, [dossierList]);

  const filesInCurrentFolder = useMemo(() => {
    if (!currentFolder) return [];
    return globalDossiers.filter((d) => (d.folder || '') === currentFolder);
  }, [globalDossiers, currentFolder]);

  // Deteksi permintaan izin akses masuk untuk user saat ini (jika user adalah pemilik file)
  const pendingRequestsForMe = useMemo(() => {
    const list: { file: DossierRecord; req: NonNullable<DossierRecord['accessRequests']>[string] }[] = [];
    individualDossiers.forEach((d) => {
      if (d.pegawaiNip === currentRole.nip && d.accessRequests) {
        Object.values(d.accessRequests).forEach((req) => {
          if (req.status === 'pending') {
            list.push({ file: d, req });
          }
        });
      }
    });
    return list;
  }, [individualDossiers, currentRole.nip]);

  // Handler kirim permintaan izin
  const handleSendRequest = () => {
    if (!selectedFileForRequest) return;
    const fileId = selectedFileForRequest.id;

    const updatedList = dossierList.map((d) => {
      if (d.id === fileId) {
        const existingReqs = d.accessRequests || {};
        return {
          ...d,
          accessRequests: {
            ...existingReqs,
            [currentRole.nip]: {
              requestorNip: currentRole.nip,
              requestorNama: currentRole.nama,
              requestorRole: currentRole.label,
              status: 'pending' as const,
              tanggal: new Date().toLocaleDateString('id-ID'),
              alasan: requestReason.trim(),
            },
          },
        };
      }
      return d;
    });

    onUpdateDossierList(updatedList);
    setRequestModalOpen(false);
    setRequestToast(
      `Permintaan akses untuk "${selectedFileForRequest.judul}" telah dikirim ke pemilik (${selectedFileForRequest.pegawaiNama}).`,
    );
    setTimeout(() => setRequestToast(''), 4500);
  };

  // Handler respon izin dari pemilik
  const handleRespondRequest = (fileId: string, requestorNip: string, approve: boolean) => {
    const updatedList = dossierList.map((d) => {
      if (d.id === fileId && d.accessRequests && d.accessRequests[requestorNip]) {
        const req = d.accessRequests[requestorNip];
        return {
          ...d,
          accessRequests: {
            ...d.accessRequests,
            [requestorNip]: {
              ...req,
              status: (approve ? 'granted' : 'denied') as 'granted' | 'denied',
            },
          },
        };
      }
      return d;
    });
    onUpdateDossierList(updatedList);
  };

  // Handler tambah folder klasifikasi baru
  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    const name = newFolderName.trim();
    if (!folderList.includes(name)) {
      setFolderList((prev) => [...prev, name]);
    }
    setNewFolderName('');
    setCreateFolderModalOpen(false);
  };

  // Handler upload berkas global
  const handleUploadGlobalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFileName.trim()) return;
    const targetFolder = uploadFolderTarget || currentFolder || folderList[0] || 'SK Camat 2026';

    await onUploadDossier({
      pegawaiNip: currentRole.nip,
      pegawaiNama: `${currentRole.nama} (${currentRole.label})`,
      partisi: uploadPartition,
      judul: uploadFileName.trim().endsWith('.pdf') ? uploadFileName.trim() : `${uploadFileName.trim()}.pdf`,
      ukuranKb: 1024 + Math.floor(Math.random() * 800),
      isGlobal: true,
      folder: targetFolder,
      accessLevel: uploadAccessLevel,
    });

    setUploadFileName('');
    setUploadGlobalModalOpen(false);
  };

  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      {/* Toast Notifikasi */}
      {requestToast ? (
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
          <span>{requestToast}</span>
        </div>
      ) : null}

      {/* Banner Permintaan Akses Masuk untuk Pemilik File */}
      {pendingRequestsForMe.length > 0 ? (
        <div
          style={{
            background: '#FFFBEB',
            border: '1px solid #FDE68A',
            borderRadius: '10px',
            padding: '12px 16px',
            display: 'grid',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#92400E' }}>
            <i className="ph ph-bell-ringing" style={{ fontSize: '18px' }} />
            <strong style={{ fontSize: '13px' }}>
              Ada {pendingRequestsForMe.length} Permintaan Izin Akses Masuk untuk Berkas Pribadi Anda:
            </strong>
          </div>

          <div style={{ display: 'grid', gap: '8px' }}>
            {pendingRequestsForMe.map(({ file, req }) => (
              <div
                key={`${file.id}-${req.requestorNip}`}
                style={{
                  background: '#FFFFFF',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid #FEF3C7',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                <div>
                  <div style={{ fontSize: '12.5px', fontWeight: 600 }}>
                    {req.requestorNama} ({req.requestorRole})
                  </div>
                  <div className="caption" style={{ fontSize: '11px', color: '#64748B' }}>
                    Meminta akses membuka berkas: <span className="mono">{file.judul}</span> · Alasan: {req.alasan}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-xs"
                    onClick={() => handleRespondRequest(file.id, req.requestorNip, false)}
                    style={{ height: '26px', fontSize: '11px' }}
                  >
                    Tolak
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-xs"
                    onClick={() => handleRespondRequest(file.id, req.requestorNip, true)}
                    style={{ height: '26px', fontSize: '11px' }}
                  >
                    <i className="ph ph-check" /> Izinkan Akses
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Segmented Control Mode Dossier */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          borderBottom: '1px solid var(--hairline)',
          paddingBottom: '12px',
        }}
      >
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className={`btn ${activeTab === 'individual' ? 'btn-primary' : 'btn-ghost'} btn-sm`}
            onClick={() => setActiveTab('individual')}
          >
            <i className="ph ph-user-circle" />
            <span>Dossier Portofolio Pegawai (Individu)</span>
          </button>
          <button
            type="button"
            className={`btn ${activeTab === 'global' ? 'btn-primary' : 'btn-ghost'} btn-sm`}
            onClick={() => setActiveTab('global')}
          >
            <i className="ph ph-folder-notch-open" />
            <span>Global Dossier Kecamatan (Google Drive Mode)</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-info mono" style={{ fontSize: '11px' }}>
            User: {currentRole.nama} ({currentRole.label})
          </span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: DOSSIER PORTOFOLIO PEGAWAI (INDIVIDU) */}
      {/* ============================================================ */}
      {activeTab === 'individual' ? (
        <div className="ops-panel" style={{ padding: '20px' }}>
          {/* Header & Filter Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '16px',
            }}
          >
            <div>
              <h3 className="heading" style={{ fontSize: '17px', margin: 0 }}>
                Arsip Dossier ASN Kecamatan Tamalate
              </h3>
              <p className="caption" style={{ margin: '4px 0 0' }}>
                Sesuai prinsip audit kepatuhan, nama berkas tetap terbaca publik namun isi dokumen terkunci dan hanya dapat dibuka atas izin pemilik.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Filter Pegawai */}
              <select
                className="disp-inline-input"
                style={{ height: '34px', fontSize: '12px' }}
                value={selectedPegawaiNip}
                onChange={(e) => setSelectedPegawaiNip(e.target.value)}
              >
                <option value="all">Semua Pegawai ({pegawaiList.length} ASN)</option>
                <option value={currentRole.nip}>Berkas Saya Sendiri ({currentRole.nama})</option>
                {pegawaiList
                  .filter((p) => p.nip !== currentRole.nip)
                  .map((p) => (
                    <option key={p.nip} value={p.nip}>
                      {p.nama} ({p.golongan})
                    </option>
                  ))}
              </select>

              {/* Pencarian */}
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Cari nama berkas / NIP..."
                  className="disp-inline-input"
                  style={{ height: '34px', paddingLeft: '28px', fontSize: '12px', minWidth: '200px' }}
                  value={searchDossier}
                  onChange={(e) => setSearchDossier(e.target.value)}
                />
                <i
                  className="ph ph-magnifying-glass"
                  style={{ position: 'absolute', left: '8px', top: '9px', color: 'var(--muted)' }}
                />
              </div>
            </div>
          </div>

          {/* Tabel Dossier Pegawai dengan Transparansi Audit & Kontrol Akses */}
          <div className="data-table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '40px', textAlign: 'center' }}>No</th>
                  <th>Nama Berkas Portofolio (Audit View)</th>
                  <th>Pemilik Berkas</th>
                  <th>Klasifikasi Partisi</th>
                  <th>Ukuran &amp; Tanggal</th>
                  <th>Status Hak Akses</th>
                  <th style={{ textAlign: 'right' }}>Aksi Pratinjau</th>
                </tr>
              </thead>
              <tbody>
                {filteredIndividualDossiers.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: 'var(--muted)' }}>
                      Tidak ada dokumen dossier yang sesuai kriteria pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredIndividualDossiers.map((doc, idx) => {
                    const isOwner = doc.pegawaiNip === currentRole.nip;
                    const myRequest = doc.accessRequests ? doc.accessRequests[currentRole.nip] : undefined;
                    const isGranted = isOwner || myRequest?.status === 'granted';
                    const isPending = myRequest?.status === 'pending';

                    return (
                      <tr key={doc.id}>
                        <td style={{ textAlign: 'center' }} className="mono">
                          {idx + 1}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <i className="ph ph-file-pdf" style={{ color: '#dc2626', fontSize: '18px' }} />
                            <div>
                              <strong style={{ fontSize: '13px' }}>{doc.judul}</strong>
                              <div className="caption mono" style={{ fontSize: '10.5px', color: 'var(--muted)' }}>
                                ID: {doc.id} · Hash: BSRE-DOSS-{doc.id}-2026
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div>{doc.pegawaiNama}</div>
                          <div className="caption mono" style={{ fontSize: '10.5px' }}>
                            NIP. {doc.pegawaiNip}
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-info">{doc.partisi}</span>
                        </td>
                        <td>
                          <div className="tabular">{doc.ukuranKb} KB</div>
                          <div className="caption" style={{ fontSize: '10.5px' }}>
                            {doc.tanggalUnggah}
                          </div>
                        </td>
                        <td>
                          {isOwner ? (
                            <span className="badge badge-success">Milik Anda (Akses Penuh)</span>
                          ) : isGranted ? (
                            <span className="badge badge-success">Izin Diberikan Pemilik</span>
                          ) : isPending ? (
                            <span className="badge badge-warning">Menunggu Izin Pemilik</span>
                          ) : (
                            <span className="badge badge-neutral" style={{ background: '#F1F5F9', color: '#475569' }}>
                              Terkunci (Perlu Izin)
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {isGranted ? (
                            <button
                              type="button"
                              className="btn btn-primary btn-xs"
                              style={{ height: '28px', fontSize: '11.5px' }}
                              onClick={() =>
                                onPreviewPdf(
                                  doc.judul,
                                  `Portofolio Resmi Kepegawaian · Pemilik: ${doc.pegawaiNama} (NIP. ${doc.pegawaiNip})`,
                                )
                              }
                            >
                              <i className="ph ph-eye" /> Buka Dokumen
                            </button>
                          ) : isPending ? (
                            <button
                              type="button"
                              className="btn btn-secondary btn-xs"
                              disabled
                              style={{ height: '28px', fontSize: '11px', opacity: 0.7 }}
                            >
                              <i className="ph ph-clock" /> Menunggu Persetujuan
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-secondary btn-xs"
                              style={{ height: '28px', fontSize: '11.5px' }}
                              onClick={() => {
                                setSelectedFileForRequest(doc);
                                setRequestModalOpen(true);
                              }}
                            >
                              <i className="ph ph-key" /> Minta Izin Akses
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {/* ============================================================ */}
      {/* TAB 2: GLOBAL DOSSIER KECAMATAN (GOOGLE DRIVE CONCEPT) */}
      {/* ============================================================ */}
      {activeTab === 'global' ? (
        <div className="ops-panel" style={{ padding: '20px' }}>
          {/* Header & Breadcrumb */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '16px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--muted)' }}>
                <span
                  style={{ cursor: 'pointer', fontWeight: currentFolder ? 400 : 700, color: currentFolder ? 'var(--accent)' : 'inherit' }}
                  onClick={() => setCurrentFolder('')}
                >
                  <i className="ph ph-hard-drive" /> Global Drive Kecamatan
                </span>
                {currentFolder ? (
                  <>
                    <span>/</span>
                    <strong style={{ color: 'var(--heading)' }}>{currentFolder}</strong>
                  </>
                ) : null}
              </div>
              <h3 className="heading" style={{ fontSize: '18px', margin: '4px 0 0' }}>
                {currentFolder ? `Folder: ${currentFolder}` : 'Pusat Naskah & SK Global Kecamatan Tamalate'}
              </h3>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setCreateFolderModalOpen(true)}
              >
                <i className="ph ph-folder-plus" />
                <span>Tambah Folder Klasifikasi</span>
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setUploadFolderTarget(currentFolder || folderList[0] || 'SK Camat 2026');
                  setUploadGlobalModalOpen(true);
                }}
              >
                <i className="ph ph-cloud-arrow-up" />
                <span>Unggah Berkas Baru</span>
              </button>
            </div>
          </div>

          {/* Tampilan Folder Grid (Saat di Root) */}
          {!currentFolder ? (
            <div>
              <div className="eyebrow" style={{ fontSize: '11px', marginBottom: '10px' }}>
                Kategori Klasifikasi Folder
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                  gap: '12px',
                  marginBottom: '24px',
                }}
              >
                {folderList.map((fName) => {
                  const count = globalDossiers.filter((d) => (d.folder || '') === fName).length;
                  return (
                    <div
                      key={fName}
                      onClick={() => setCurrentFolder(fName)}
                      style={{
                        padding: '14px 16px',
                        background: 'var(--surface-soft)',
                        border: '1px solid var(--hairline)',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        transition: 'transform 0.15s ease, border-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--hairline)')}
                    >
                      <i className="ph ph-folder" style={{ fontSize: '28px', color: '#f59e0b' }} />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {fName}
                        </div>
                        <div className="caption tabular" style={{ fontSize: '11px' }}>
                          {count} Dokumen
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Rekap Seluruh Berkas Global */}
              <div className="eyebrow" style={{ fontSize: '11px', marginBottom: '8px' }}>
                Seluruh Dokumen Global Terakhir Diunggah
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: '12px' }}>
              <button
                type="button"
                className="btn btn-ghost btn-xs"
                onClick={() => setCurrentFolder('')}
                style={{ marginBottom: '8px' }}
              >
                <i className="ph ph-arrow-left" /> Kembali ke Root Drive
              </button>
            </div>
          )}

          {/* Tabel File Global */}
          <div className="data-table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '40px', textAlign: 'center' }}>No</th>
                  <th>Nama Naskah / Dokumen</th>
                  <th>Folder Klasifikasi</th>
                  <th>Pengunggah Resmi</th>
                  <th>Hak Akses Berkas</th>
                  <th>Ukuran &amp; Tanggal</th>
                  <th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {(currentFolder ? filesInCurrentFolder : globalDossiers).length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: 'var(--muted)' }}>
                      Belum ada dokumen di dalam klasifikasi ini. Klik &quot;Unggah Berkas Baru&quot; untuk menambahkan naskah.
                    </td>
                  </tr>
                ) : (
                  (currentFolder ? filesInCurrentFolder : globalDossiers).map((doc, idx) => {
                    const access = doc.accessLevel || 'publik';
                    return (
                      <tr key={doc.id}>
                        <td style={{ textAlign: 'center' }} className="mono">
                          {idx + 1}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <i className="ph ph-file-text" style={{ color: '#2563eb', fontSize: '18px' }} />
                            <div>
                              <strong style={{ fontSize: '13px' }}>{doc.judul}</strong>
                              <div className="caption mono" style={{ fontSize: '10.5px', color: 'var(--muted)' }}>
                                {doc.partisi} · ID: {doc.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span
                            style={{ cursor: 'pointer', color: 'var(--accent)' }}
                            onClick={() => setCurrentFolder(doc.folder || '')}
                          >
                            <i className="ph ph-folder-simple" /> {doc.folder || 'Umum'}
                          </span>
                        </td>
                        <td>
                          <div>{doc.pegawaiNama}</div>
                          <div className="caption" style={{ fontSize: '10.5px' }}>
                            Kecamatan Tamalate
                          </div>
                        </td>
                        <td>
                          {access === 'publik' ? (
                            <span className="badge badge-success">Publik Internal</span>
                          ) : access === 'struktural' ? (
                            <span className="badge badge-info">Terbatas Struktural</span>
                          ) : (
                            <span className="badge badge-warning" style={{ background: '#FEE2E2', color: '#991B1B' }}>
                              Rahasia Pimpinan
                            </span>
                          )}
                        </td>
                        <td>
                          <div className="tabular">{doc.ukuranKb} KB</div>
                          <div className="caption" style={{ fontSize: '10.5px' }}>
                            {doc.tanggalUnggah}
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-xs"
                            style={{ height: '28px', fontSize: '11.5px' }}
                            onClick={() =>
                              onPreviewPdf(
                                doc.judul,
                                `Global Repository · Folder: ${doc.folder} · Otoritas Pemerintah Kota Makassar`,
                              )
                            }
                          >
                            <i className="ph ph-eye" /> Pratinjau
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {/* ============================================================ */}
      {/* MODAL PERMINTAAN IZIN AKSES (INDIVIDUAL DOSSIER) */}
      {/* ============================================================ */}
      {requestModalOpen && selectedFileForRequest ? (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10001,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setRequestModalOpen(false);
          }}
        >
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--hairline)',
              borderRadius: 'var(--r-lg)',
              width: '100%',
              maxWidth: '520px',
              padding: '20px',
              display: 'grid',
              gap: '14px',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div>
              <span className="eyebrow" style={{ fontSize: '11px' }}>
                Audit Protokol Kepegawaian Tamalate
              </span>
              <h3 className="heading" style={{ fontSize: '17px', margin: '2px 0 0' }}>
                Minta Izin Akses Dokumen Pribadi ASN
              </h3>
            </div>

            <div
              style={{
                background: 'var(--surface-soft)',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--hairline)',
                fontSize: '12.5px',
              }}
            >
              <div>
                <strong>Nama Berkas:</strong> <span className="mono">{selectedFileForRequest.judul}</span>
              </div>
              <div>
                <strong>Pemilik:</strong> {selectedFileForRequest.pegawaiNama} (NIP. {selectedFileForRequest.pegawaiNip})
              </div>
              <div>
                <strong>Ukuran:</strong> {selectedFileForRequest.ukuranKb} KB · {selectedFileForRequest.tanggalUnggah}
              </div>
            </div>

            <div>
              <label className="label" htmlFor="inpAlasanIzin">
                Alasan / Keperluan Kedinasan Membuka Dokumen *
              </label>
              <textarea
                id="inpAlasanIzin"
                required
                className="disp-textarea"
                rows={3}
                value={requestReason}
                onChange={(e) => setRequestReason(e.target.value)}
                placeholder="Misal: Verifikasi berkas kelengkapan usulan kenaikan gaji berkala tahun 2026..."
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setRequestModalOpen(false)}
              >
                Batal
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleSendRequest}
                disabled={!requestReason.trim()}
              >
                <i className="ph ph-paper-plane-tilt" /> Kirim Permintaan Izin
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* ============================================================ */}
      {/* MODAL TAMBAH FOLDER KLASIFIKASI BARU (GOOGLE DRIVE CONCEPT) */}
      {/* ============================================================ */}
      {createFolderModalOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10001,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setCreateFolderModalOpen(false);
          }}
        >
          <form
            onSubmit={handleCreateFolder}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--hairline)',
              borderRadius: 'var(--r-lg)',
              width: '100%',
              maxWidth: '460px',
              padding: '20px',
              display: 'grid',
              gap: '14px',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div>
              <span className="eyebrow" style={{ fontSize: '11px' }}>
                Struktur Global Drive Kecamatan
              </span>
              <h3 className="heading" style={{ fontSize: '17px', margin: '2px 0 0' }}>
                Tambah Folder Klasifikasi Baru
              </h3>
            </div>

            <div>
              <label className="label" htmlFor="inpFolderName">
                Nama Folder Klasifikasi *
              </label>
              <input
                type="text"
                id="inpFolderName"
                required
                placeholder="Misal: Laporan Akuntabilitas Kinerja 2026"
                className="disp-textarea"
                style={{ height: '38px' }}
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setCreateFolderModalOpen(false)}
              >
                Batal
              </button>
              <button type="submit" className="btn btn-primary btn-sm">
                <i className="ph ph-folder-plus" /> Buat Folder
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {/* ============================================================ */}
      {/* MODAL UNGGAH BERKAS GLOBAL (GOOGLE DRIVE CONCEPT) */}
      {/* ============================================================ */}
      {uploadGlobalModalOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10001,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setUploadGlobalModalOpen(false);
          }}
        >
          <form
            onSubmit={handleUploadGlobalSubmit}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--hairline)',
              borderRadius: 'var(--r-lg)',
              width: '100%',
              maxWidth: '540px',
              padding: '20px',
              display: 'grid',
              gap: '14px',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div>
              <span className="eyebrow" style={{ fontSize: '11px' }}>
                Unggah Dokumen Institusional Kecamatan
              </span>
              <h3 className="heading" style={{ fontSize: '17px', margin: '2px 0 0' }}>
                Unggah Berkas ke Global Drive
              </h3>
            </div>

            <div>
              <label className="label" htmlFor="inpUploadFileName">
                Nama Dokumen / Naskah Dinas *
              </label>
              <input
                type="text"
                id="inpUploadFileName"
                required
                placeholder="SK_Camat_Nomor_24_Tahun_2026.pdf"
                className="disp-textarea mono"
                style={{ height: '38px' }}
                value={uploadFileName}
                onChange={(e) => setUploadFileName(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label className="label" htmlFor="inpTargetFolder">
                  Pilih Folder Tujuan *
                </label>
                <select
                  id="inpTargetFolder"
                  className="disp-textarea"
                  style={{ height: '38px' }}
                  value={uploadFolderTarget}
                  onChange={(e) => setUploadFolderTarget(e.target.value)}
                >
                  {folderList.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label" htmlFor="inpUploadAccess">
                  Tingkat Hak Akses *
                </label>
                <select
                  id="inpUploadAccess"
                  className="disp-textarea"
                  style={{ height: '38px' }}
                  value={uploadAccessLevel}
                  onChange={(e) => setUploadAccessLevel(e.target.value as 'publik' | 'struktural' | 'rahasia')}
                >
                  <option value="publik">Publik Internal (Semua ASN)</option>
                  <option value="struktural">Terbatas Struktural (Kasubag, Sekcam, Camat)</option>
                  <option value="rahasia">Rahasia Pimpinan (Camat &amp; Sekcam)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label" htmlFor="inpUploadPartisi">
                Klasifikasi Partisi Naskah
              </label>
              <select
                id="inpUploadPartisi"
                className="disp-textarea"
                style={{ height: '38px' }}
                value={uploadPartition}
                onChange={(e) => setUploadPartition(e.target.value)}
              >
                <option value="SK Camat">Keputusan Camat (SK)</option>
                <option value="Surat Edaran">Surat Edaran Sekda / Camat</option>
                <option value="Peraturan Walikota">Peraturan Walikota (Perwali)</option>
                <option value="SOP Pelayanan">Standar Operasional Prosedur (SOP)</option>
                <option value="Juknis BKN">Petunjuk Teknis BKN</option>
                <option value="Kebijakan Strategis">Kebijakan Strategis Pimpinan</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setUploadGlobalModalOpen(false)}
              >
                Batal
              </button>
              <button type="submit" className="btn btn-primary btn-sm">
                <i className="ph ph-cloud-arrow-up" /> Simpan ke Drive
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
