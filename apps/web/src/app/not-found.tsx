import Link from 'next/link';
import type { ReactNode } from 'react';

export default function NotFound(): ReactNode {
  return (
    <main className="min-h-dvh flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <p className="font-mono text-sm text-accent">404</p>
        <h1 className="mt-2 text-xl font-semibold">Halaman tidak ditemukan</h1>
        <p className="mt-2 text-sm muted">Alamat yang diminta tidak tersedia di sistem ini.</p>
        <Link href="/" className="mt-6 inline-flex rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-accentfg">
          Kembali ke Ringkasan
        </Link>
      </div>
    </main>
  );
}
