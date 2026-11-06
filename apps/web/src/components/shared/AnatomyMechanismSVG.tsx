'use client';

import React, { useState } from 'react';

export interface AnatomyMechanismProps {
  suratCount: number;
  disposisiQueueCount: number;
  hadirPagi: number;
  totalPegawai: number;
  usulanActiveCount: number;
  dossierCount: number;
  activeStage?: number;
  onSelectStage?: (stageIdx: number) => void;
}

/**
 * Isometric Mechanical Figure crafted according to wheresryan22/anatomy:
 * - Real physical object metaphor: Meja Kendali Persuratan, Baki Lembar Disposisi,
 *   Stempel Pengesah Ganda (Sekcam & Camat), dan Silinder Single Dossier Vault.
 * - Strict painter's order (back-to-front solid facets, zero wireframe clutter).
 * - Four-tone volume shading (#FFFFFF / #F8FAFD top, #E5EDF5 left, #CBD5E1 right, #0A2540 shadow)
 *   with one lit accent family (#635BFF / #5452FB / #2E2B8C / #D6D9FC).
 * - 0.6px leader lines anchored to physical coordinates with live numeric readouts.
 */
export function AnatomyMechanismSVG({
  suratCount,
  disposisiQueueCount,
  hadirPagi,
  totalPegawai,
  usulanActiveCount,
  dossierCount,
  activeStage = 0,
  onSelectStage,
}: AnatomyMechanismProps): React.ReactNode {
  const [hoveredPart, setHoveredPart] = useState<number | null>(null);
  const currentPart = hoveredPart !== null ? hoveredPart : activeStage;

  const parts = [
    {
      idx: 0,
      code: '01 / BUKU AGENDA 8 KOLOM',
      title: 'Baki Registrasi & Buku Agenda Fisik',
      readout: `${suratCount} Naskah`,
      sub: 'Nomor agenda, asal surat, tanggal, & 8 kolom register',
    },
    {
      idx: 1,
      code: '02 / LEMBAR DISPOSISI',
      title: 'Mekanisme Stempel Tertanda Ganda',
      readout: `${disposisiQueueCount} Antrean`,
      sub: 'Paraf Sekcam (Tertanda 1) & Instruksi Camat (Tertanda 2)',
    },
    {
      idx: 2,
      code: '03 / RADIUS PRESENSI',
      title: 'Pemancar Geofence & Apel Harian',
      readout: `${hadirPagi}/${totalPegawai} ASN`,
      sub: 'Verifikasi koordinat <= 150 meter Kantor Camat Tamalate',
    },
    {
      idx: 3,
      code: '04 / DOSSIER VAULT',
      title: 'Silinder Arsip & 6 Partisi SK/KGB',
      readout: `${dossierCount} Berkas`,
      sub: `${usulanActiveCount} usulan kepegawaian terhubung ke Single Dossier`,
    },
  ];

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--hairline)',
        borderRadius: 'var(--r-md)',
        padding: '20px 22px',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          flexWrap: 'wrap',
          gap: '12px',
          paddingBottom: '14px',
          borderBottom: '1px solid var(--hairline)',
          marginBottom: '14px',
        }}
      >
        <div>
          <span className="eyebrow" style={{ fontSize: '11px' }}>
            ANATOMI MEKANISME ADMINISTRASI
          </span>
          <h3 className="heading" style={{ fontSize: '18px', marginTop: '2px' }}>
            Meja Kendali Persuratan, Stempel Disposisi, dan Dossier Vault
          </h3>
        </div>
        <div className="caption mono" style={{ color: 'var(--ink-tertiary)' }}>
           Pembacaan langsung model: <b>{suratCount}</b> surat · <b>{hadirPagi}</b> hadir · <b>{dossierCount}</b> berkas
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: '20px',
          alignItems: 'center',
          maxWidth: '100%',
          overflow: 'hidden',
        }}
      >
        <svg
          viewBox="0 0 680 360"
          width="100%"
          height="auto"
          role="img"
          aria-label="Diagram isometrik mekanisme administrasi Kecamatan Tamalate"
          style={{ display: 'block', overflow: 'visible' }}
        >
          {/* 1. GROUND CONTACT SHADOW (PAINTER'S ORDER LAYER 0) */}
          <polygon
            points="340,326 112,212 340,98 568,212"
            fill="#0A2540"
            fillOpacity="0.06"
          />
          <polygon
            points="340,318 122,209 340,100 558,209"
            fill="#0A2540"
            fillOpacity="0.09"
          />

          {/* 2. ISOMETRIC DESK PLINTH BASE (4-TONE SHADED SOLID) */}
          {/* Top face */}
          <polygon
            points="340,96 556,204 340,312 124,204"
            fill="#F8FAFD"
            stroke="#0A2540"
            strokeWidth="0.6"
          />
          {/* Left-front bevel wall */}
          <polygon
            points="124,204 340,312 340,330 124,222"
            fill="#E5EDF5"
            stroke="#0A2540"
            strokeWidth="0.6"
          />
          {/* Right-front bevel wall */}
          <polygon
            points="556,204 340,312 340,330 556,222"
            fill="#CBD5E1"
            stroke="#0A2540"
            strokeWidth="0.6"
          />
          {/* Precision recessed inner deck */}
          <polygon
            points="340,108 534,205 340,302 146,205"
            fill="#FFFFFF"
            stroke="#CBD5E1"
            strokeWidth="0.6"
          />

          {/* Isometric calibration grid ticks on deck */}
          <line x1="243" y1="156.5" x2="437" y2="253.5" stroke="#E5EDF5" strokeWidth="0.6" />
          <line x1="437" y1="156.5" x2="243" y2="253.5" stroke="#E5EDF5" strokeWidth="0.6" />

          {/* ============================================================
              ASSEMBLY 01: BAKI BUKU AGENDA 8 KOLOM (BACK-LEFT TRAY)
              ============================================================ */}
          <g
            style={{ cursor: 'pointer' }}
            onMouseEnter={() => setHoveredPart(0)}
            onMouseLeave={() => setHoveredPart(null)}
            onClick={() => onSelectStage && onSelectStage(0)}
          >
            {/* Tray Left Wall */}
            <polygon
              points="168,196 266,245 266,263 168,214"
              fill={currentPart === 0 ? '#D6D9FC' : '#E5EDF5'}
              stroke="#0A2540"
              strokeWidth="0.6"
            />
            {/* Tray Right Wall */}
            <polygon
              points="336,210 266,245 266,263 336,228"
              fill={currentPart === 0 ? '#635BFF' : '#CBD5E1'}
              stroke="#0A2540"
              strokeWidth="0.6"
            />
            {/* Tray Top Ledger Sheet */}
            <polygon
              points="238,161 336,210 266,245 168,196"
              fill="#FFFFFF"
              stroke={currentPart === 0 ? '#635BFF' : '#0A2540'}
              strokeWidth={currentPart === 0 ? '1.1' : '0.6'}
            />
            {/* 8-Column Ledger Header Bar */}
            <polygon
              points="238,165 328,210 318,215 228,170"
              fill="#635BFF"
            />
            {/* Ruled 8-Column Ledger Dividers (0.6px) */}
            <line x1="220" y1="175" x2="310" y2="220" stroke="#94A3B8" strokeWidth="0.6" />
            <line x1="210" y1="180" x2="300" y2="225" stroke="#94A3B8" strokeWidth="0.6" />
            <line x1="200" y1="185" x2="290" y2="230" stroke="#94A3B8" strokeWidth="0.6" />
            <line x1="190" y1="190" x2="280" y2="235" stroke="#94A3B8" strokeWidth="0.6" />
            <line x1="255" y1="172" x2="195" y2="202" stroke="#CBD5E1" strokeWidth="0.6" />
            <line x1="278" y1="183" x2="218" y2="213" stroke="#CBD5E1" strokeWidth="0.6" />
            <line x1="301" y1="194" x2="241" y2="224" stroke="#CBD5E1" strokeWidth="0.6" />
          </g>

          {/* ============================================================
              ASSEMBLY 03: GEOFENCE RADIUS BEACON (BACK-TOP RIGHT)
              ============================================================ */}
          <g
            style={{ cursor: 'pointer' }}
            onMouseEnter={() => setHoveredPart(2)}
            onMouseLeave={() => setHoveredPart(null)}
            onClick={() => onSelectStage && onSelectStage(2)}
          >
            {/* Isometric Radius Rings (150m Geofence) */}
            <ellipse
              cx="352"
              cy="152"
              rx="48"
              ry="24"
              fill={currentPart === 2 ? '#E6F4EF' : '#F8FAFD'}
              stroke="#0F7A52"
              strokeWidth="0.6"
              strokeDasharray="3 2"
            />
            <ellipse
              cx="352"
              cy="152"
              rx="30"
              ry="15"
              fill="#E6F4EF"
              fillOpacity="0.65"
              stroke="#0F7A52"
              strokeWidth="0.6"
            />
            {/* Beacon Plinth */}
            <polygon
              points="352,140 368,148 352,156 336,148"
              fill="#FFFFFF"
              stroke="#0A2540"
              strokeWidth="0.6"
            />
            <polygon
              points="336,148 352,156 352,164 336,156"
              fill="#E5EDF5"
              stroke="#0A2540"
              strokeWidth="0.6"
            />
            <polygon
              points="368,148 352,156 352,164 368,156"
              fill="#CBD5E1"
              stroke="#0A2540"
              strokeWidth="0.6"
            />
            {/* Vertical Pin Needle & Sphere */}
            <line x1="352" y1="148" x2="352" y2="118" stroke="#0A2540" strokeWidth="1.4" />
            <circle
              cx="352"
              cy="114"
              r="7.5"
              fill={currentPart === 2 ? '#0F7A52' : '#635BFF'}
              stroke="#0A2540"
              strokeWidth="0.6"
            />
            <circle cx="349.5" cy="111.5" r="2.2" fill="#FFFFFF" />
          </g>

          {/* ============================================================
              ASSEMBLY 02: LEMBAR DISPOSISI & DUAL-SIGN STAMP PRESS (CENTER)
              ============================================================ */}
          <g
            style={{ cursor: 'pointer' }}
            onMouseEnter={() => setHoveredPart(1)}
            onMouseLeave={() => setHoveredPart(null)}
            onClick={() => onSelectStage && onSelectStage(1)}
          >
            {/* Paper Stack Base (Left & RightThickness) */}
            <polygon
              points="286,232 364,271 364,284 286,245"
              fill="#E5EDF5"
              stroke="#0A2540"
              strokeWidth="0.6"
            />
            <polygon
              points="432,237 364,271 364,284 432,250"
              fill="#CBD5E1"
              stroke="#0A2540"
              strokeWidth="0.6"
            />
            {/* Lembar Disposisi Top Sheet */}
            <polygon
              points="354,198 432,237 364,271 286,232"
              fill="#FFFFFF"
              stroke={currentPart === 1 ? '#635BFF' : '#0A2540'}
              strokeWidth={currentPart === 1 ? '1.2' : '0.6'}
            />
            {/* Split 2-Column Disposisi Table Lines on Paper */}
            <line x1="359" y1="201" x2="426" y2="234" stroke="#0A2540" strokeWidth="1.2" />
            <line x1="320" y1="215" x2="398" y2="254" stroke="#635BFF" strokeWidth="0.6" />
            <line x1="393" y1="217" x2="325" y2="251" stroke="#94A3B8" strokeWidth="0.6" />

            {/* Dual Stamp Seal Marks on Paper (Sekcam + Camat) */}
            <ellipse
              cx="346"
              cy="241"
              rx="10"
              ry="5"
              fill="#D6D9FC"
              stroke="#635BFF"
              strokeWidth="0.8"
            />
            <ellipse
              cx="368"
              cy="252"
              rx="11"
              ry="5.5"
              fill="#E6F4EF"
              stroke="#0F7A52"
              strokeWidth="0.8"
            />

            {/* Cylindrical Stamp Press Body (Hovering above Disposisi Sheet) */}
            <ellipse
              cx="362"
              cy="196"
              rx="18"
              ry="9"
              fill="#4032C8"
              stroke="#0A2540"
              strokeWidth="0.6"
            />
            <path
              d="M344,186 L344,196 A18,9 0 0,0 380,196 L380,186 Z"
              fill="#635BFF"
              stroke="#0A2540"
              strokeWidth="0.6"
            />
            <ellipse
              cx="362"
              cy="186"
              rx="18"
              ry="9"
              fill="#D6D9FC"
              stroke="#0A2540"
              strokeWidth="0.6"
            />
            {/* Stamp Handle Shaft */}
            <path
              d="M356,162 L356,185 A6,3 0 0,0 368,185 L368,162 Z"
              fill="#273951"
              stroke="#0A2540"
              strokeWidth="0.6"
            />
            <ellipse
              cx="362"
              cy="160"
              rx="9"
              ry="5"
              fill="#0A2540"
              stroke="#0A2540"
              strokeWidth="0.6"
            />
          </g>

          {/* ============================================================
              ASSEMBLY 04: SINGLE DOSSIER VAULT CYLINDER (FRONT-RIGHT)
              ============================================================ */}
          <g
            style={{ cursor: 'pointer' }}
            onMouseEnter={() => setHoveredPart(3)}
            onMouseLeave={() => setHoveredPart(null)}
            onClick={() => onSelectStage && onSelectStage(3)}
          >
            {/* Vault Plinth Base */}
            <polygon
              points="446,164 510,196 462,220 398,188"
              fill="#F8FAFD"
              stroke="#0A2540"
              strokeWidth="0.6"
            />
            <polygon
              points="398,188 462,220 462,232 398,200"
              fill="#E5EDF5"
              stroke="#0A2540"
              strokeWidth="0.6"
            />
            <polygon
              points="510,196 462,220 462,232 510,208"
              fill="#CBD5E1"
              stroke="#0A2540"
              strokeWidth="0.6"
            />
            {/* 6-Partition Vault Cylinder Stack */}
            <path
              d="M426,152 L426,188 A28,14 0 0,0 482,188 L482,152 Z"
              fill={currentPart === 3 ? '#635BFF' : '#1A2C44'}
              stroke="#0A2540"
              strokeWidth="0.6"
            />
            {/* Partition rings (SK CPNS, SK Pangkat, KGB, SKP, Disiplin, Pensiun) */}
            <path d="M426,161 A28,14 0 0,0 482,161" fill="none" stroke="#D6D9FC" strokeWidth="0.6" />
            <path d="M426,170 A28,14 0 0,0 482,170" fill="none" stroke="#D6D9FC" strokeWidth="0.6" />
            <path d="M426,179 A28,14 0 0,0 482,179" fill="none" stroke="#D6D9FC" strokeWidth="0.6" />
            <ellipse
              cx="454"
              cy="152"
              rx="28"
              ry="14"
              fill="#D6D9FC"
              stroke="#0A2540"
              strokeWidth="0.6"
            />
            <ellipse
              cx="454"
              cy="152"
              rx="14"
              ry="7"
              fill="#635BFF"
              stroke="#0A2540"
              strokeWidth="0.6"
            />
          </g>

          {/* ============================================================
              CALLOUT LEADER LINES (0.6px) & LABELS
              ============================================================ */}
          {/* Callout 01: Buku Agenda */}
          <circle cx="212" cy="192" r="2" fill="#635BFF" />
          <polyline
            points="212,192 145,142 22,142"
            fill="none"
            stroke="#0A2540"
            strokeWidth="0.6"
          />
          <text x="22" y="126" fill="#635BFF" fontFamily="JetBrains Mono, monospace" fontSize="9.5" fontWeight="600">
            01 · BUKU AGENDA 8 KOLOM
          </text>
          <text x="22" y="138" fill="#0A2540" fontFamily="Inter, sans-serif" fontSize="11" fontWeight="500">
            {suratCount} Naskah Dinas Terdaftar
          </text>

          {/* Callout 02: Lembar Disposisi */}
          <circle cx="362" cy="245" r="2" fill="#635BFF" />
          <polyline
            points="362,245 290,322 42,322"
            fill="none"
            stroke="#0A2540"
            strokeWidth="0.6"
          />
          <text x="42" y="306" fill="#635BFF" fontFamily="JetBrains Mono, monospace" fontSize="9.5" fontWeight="600">
            02 · LEMBAR DISPOSISI PIMPINAN
          </text>
          <text x="42" y="318" fill="#0A2540" fontFamily="Inter, sans-serif" fontSize="11" fontWeight="500">
            Paraf Sekcam &amp; TTE Camat ({disposisiQueueCount} Antrean)
          </text>

          {/* Callout 03: Geofence Presensi */}
          <circle cx="352" cy="114" r="2" fill="#0F7A52" />
          <polyline
            points="352,114 415,68 654,68"
            fill="none"
            stroke="#0A2540"
            strokeWidth="0.6"
          />
          <text
            x="654"
            y="52"
            textAnchor="end"
            fill="#0F7A52"
            fontFamily="JetBrains Mono, monospace"
            fontSize="9.5"
            fontWeight="600"
          >
            03 · RADIUS PRESENSI &lt;= 150M
          </text>
          <text
            x="654"
            y="64"
            textAnchor="end"
            fill="#0A2540"
            fontFamily="Inter, sans-serif"
            fontSize="11"
            fontWeight="500"
          >
            {hadirPagi} dari {totalPegawai} Pegawai Hadir Apel
          </text>

          {/* Callout 04: Single Dossier Vault */}
          <circle cx="482" cy="170" r="2" fill="#635BFF" />
          <polyline
            points="482,170 538,284 658,284"
            fill="none"
            stroke="#0A2540"
            strokeWidth="0.6"
          />
          <text
            x="658"
            y="268"
            textAnchor="end"
            fill="#635BFF"
            fontFamily="JetBrains Mono, monospace"
            fontSize="9.5"
            fontWeight="600"
          >
            04 · SINGLE DOSSIER VAULT
          </text>
          <text
            x="658"
            y="280"
            textAnchor="end"
            fill="#0A2540"
            fontFamily="Inter, sans-serif"
            fontSize="11"
            fontWeight="500"
          >
            6 Partisi Arsip · {dossierCount} Dokumen Sah
          </text>
        </svg>

        {/* Interactive Part Readout List */}
        <div style={{ display: 'grid', gap: '8px' }}>
          {parts.map((p) => {
            const active = currentPart === p.idx;
            return (
              <button
                key={p.idx}
                type="button"
                onClick={() => {
                  setHoveredPart(p.idx);
                  if (onSelectStage) onSelectStage(p.idx);
                }}
                style={{
                  textAlign: 'left',
                  padding: '10px 12px',
                  borderRadius: 'var(--r-sm)',
                  border: `1px solid ${active ? 'var(--accent)' : 'var(--hairline)'}`,
                  background: active ? 'var(--surface-soft)' : 'var(--surface)',
                  cursor: 'pointer',
                  transition: 'border-color 150ms ease-out, background-color 150ms ease-out',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                  <span className="mono" style={{ fontSize: '10.5px', color: 'var(--accent)', fontWeight: 600 }}>
                    {p.code}
                  </span>
                  <span className="badge badge-info tabular" style={{ fontSize: '10.5px', height: '20px' }}>
                    {p.readout}
                  </span>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--heading)', marginTop: '3px' }}>
                  {p.title}
                </div>
                <div className="caption" style={{ fontSize: '11.5px', marginTop: '2px' }}>
                  {p.sub}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
