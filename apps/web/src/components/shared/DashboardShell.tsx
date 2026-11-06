'use client';

import React, { useState, type ReactNode } from 'react';
import Link from 'next/link';

export interface DashNavItem {
  readonly key: string;
  readonly label: string;
  readonly href: string;
  readonly icon: string;
}

export interface DashNavGroup {
  readonly title: string;
  readonly items: readonly DashNavItem[];
}

const NAV_GROUPS: readonly DashNavGroup[] = [
  {
    title: 'Utama',
    items: [
      { key: 'ringkas', label: 'Dashboard', href: '/dashboard', icon: 'ph-chart-pie-slice' },
      { key: 'surat', label: 'Surat', href: '/dashboard#surat', icon: 'ph-envelope-simple' },
      { key: 'mobile', label: 'Mode Mobile', href: '/mobile', icon: 'ph-device-mobile' },
    ],
  },
  {
    title: 'Administratif Pegawai',
    items: [
      { key: 'kgb', label: 'Kenaikan Gaji Berkala', href: '/dashboard#kgb', icon: 'ph-trend-up' },
      { key: 'pangkat', label: 'Kenaikan Pangkat', href: '/dashboard#pangkat', icon: 'ph-medal' },
      { key: 'cuti', label: 'Cuti dan Izin', href: '/dashboard#cuti', icon: 'ph-airplane-tilt' },
      { key: 'pensiun', label: 'Usulan Pensiun', href: '/dashboard#pensiun', icon: 'ph-user-minus' },
    ],
  },
  {
    title: 'Data dan Konfigurasi',
    items: [
      { key: 'pegawai', label: 'Data Pegawai', href: '/pegawai', icon: 'ph-users-three' },
      { key: 'template', label: 'Template Generator', href: '/template', icon: 'ph-file-doc' },
      { key: 'register', label: 'Register API', href: '/register', icon: 'ph-book-open' },
      { key: 'fitur', label: '76 Fitur', href: '/fitur', icon: 'ph-squares-four' },
      { key: 'status', label: 'Port dan Stack', href: '/status', icon: 'ph-pulse' },
    ],
  },
];

export function DashboardShell({
  children,
  active,
  crumb,
  roleLabel = 'Administrator Tata Naskah',
}: {
  children: ReactNode;
  active?: string;
  crumb?: string;
  roleLabel?: string;
}): ReactNode {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <link rel="stylesheet" href="/assets/css/tokens.css" />
      <link rel="stylesheet" href="/assets/css/components.css" />
      <link rel="stylesheet" href="/assets/css/dashboard.css" />

      <div className="app-shell">
        <aside className={`sidebar ${sidebarOpen ? 'is-open' : ''}`} aria-label="Navigasi utama">
          <div className="brand-bar">
            <div className="brand-mark">
              <i className="ph ph-buildings" />
            </div>
            <div className="brand-text">
              <div className="brand-name">Tamalate</div>
              <div className="brand-sub">Kepegawaian Kecamatan</div>
            </div>
          </div>

          {NAV_GROUPS.map((group) => (
            <div className="nav-group" key={group.title}>
              <div className="nav-group-title">{group.title}</div>
              {group.items.map((item) => (
                <Link
                  key={item.key}
                  className={`nav-item ${active === item.key ? 'is-on' : ''}`}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                >
                  <i className={`ph ${item.icon}`} />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          ))}

          <div className="side-foot">
            <div className="side-user">
              <div className="side-avatar">AT</div>
              <div>
                <div className="side-name">{roleLabel}</div>
                <div className="side-role">Admin Tata Naskah</div>
              </div>
            </div>
          </div>
        </aside>

        <div className={`scrim ${sidebarOpen ? 'is-on' : ''}`} onClick={() => setSidebarOpen(false)} />

        <div className="shall">
          <header className="topbar">
            <button
              className="icon-btn hamburger"
              type="button"
              aria-label="Buka menu"
              onClick={() => setSidebarOpen((v) => !v)}
            >
              <i className="ph ph-list" />
            </button>
            <div className="crumb">
              <span>Kepegawaian</span>
              <i className="ph ph-caret-right" />
              <b>{crumb ?? 'Template Generator'}</b>
            </div>
            <div className="topbar-spacer" />
            <div className="user-chip">
              <div className="user-avatar">AT</div>
              <span className="user-name">Admin Tata Naskah</span>
            </div>
          </header>

          <main className="content">{children}</main>
        </div>
      </div>
    </>
  );
}
