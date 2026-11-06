import type { ReactNode } from 'react';
import Link from 'next/link';

interface NavItem {
  href: string;
  label: string;
  short: string;
  mobile: boolean;
}

const NAV: readonly NavItem[] = [
  { href: '/', label: 'Landing Profil', short: 'Profil', mobile: true },
  { href: '/dashboard', label: 'Dasbor Desktop', short: 'Dasbor', mobile: true },
  { href: '/mobile', label: 'Dasbor Mobile PWA', short: 'Mobile', mobile: true },
  { href: '/fitur', label: '76 Fitur (9 Kernel)', short: 'Fitur', mobile: true },
  { href: '/sop', label: 'SOP', short: 'SOP', mobile: false },
  { href: '/pengajuan', label: 'Pengajuan API', short: 'Ajuan', mobile: false },
  { href: '/register', label: 'Register API', short: 'Register', mobile: false },
  { href: '/status', label: 'Port & 21 Stack', short: 'Port', mobile: true },
];

const MOBILE_NAV = NAV.filter((item) => item.mobile);
const MOBILE_COLS: Record<number, string> = {
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
};
const MOBILE_GRID = MOBILE_COLS[MOBILE_NAV.length] ?? 'grid-cols-5';

export interface AppShellProps {
  children: ReactNode;
  active?: string;
  title?: string;
  subtitle?: string;
}

export function AppShell({ children, active, title, subtitle }: AppShellProps): ReactNode {
  return (
    <div className="min-h-dvh flex flex-col">
      <a
        href="#konten-utama"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-accentfg"
      >
        Lompat ke konten utama
      </a>

      <header className="sticky top-0 z-20 surface border-x-0 border-t-0 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between gap-4">
            <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accentfg font-bold text-sm">
                KT
              </span>
              <span className="font-semibold tracking-tight text-sm sm:text-base">Kepegawaian Tamalate</span>
            </Link>
            <nav aria-label="Navigasi utama" className="hidden md:flex items-center gap-1">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active === item.href ? 'page' : undefined}
                  className={
                    'whitespace-nowrap rounded-lg px-3 py-2 text-xs lg:text-sm transition-colors ' +
                    (active === item.href
                      ? 'bg-accent/10 text-accent font-medium'
                      : 'muted hover:text-fg hover:bg-line/40')
                  }
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main id="konten-utama" className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {(title || subtitle) && (
          <header className="mb-6">
            {title ? <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1> : null}
            {subtitle ? <p className="mt-1 text-sm text-[var(--muted)]">{subtitle}</p> : null}
          </header>
        )}
        {children}
      </main>

      <nav aria-label="Navigasi bawah" className="md:hidden sticky bottom-0 surface border-x-0 border-b-0">
        <div className={'grid ' + MOBILE_GRID}>
          {MOBILE_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active === item.href ? 'page' : undefined}
              className={
                'flex flex-col items-center gap-1 py-3 text-[10px] transition-colors ' +
                (active === item.href ? 'text-accent font-medium' : 'muted')
              }
            >
              <span
                aria-hidden="true"
                className={'h-1.5 w-1.5 rounded-full ' + (active === item.href ? 'bg-accent' : 'bg-transparent')}
              />
              {item.short}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
