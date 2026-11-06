import './globals.css';
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister';

export const metadata: Metadata = {
  title: { default: 'Sistem Kepegawaian Kecamatan Tamalate', template: '%s | Kepegawaian Tamalate' },
  description:
    'Sistem Informasi Kepegawaian, Presensi Geofencing, Dossier Vault, dan Pengendalian Disposisi Surat Kecamatan Tamalate - Pemerintah Kota Makassar.',
  applicationName: 'Tamalate Kepegawaian',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Tamalate Kepegawaian' },
  formatDetection: { telephone: false },
  icons: {
    icon: [{ url: '/icon-192.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/icon-192.svg', type: 'image/svg+xml' }],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#635BFF',
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: ReactNode }): ReactNode {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="/assets/vendor/fonts/fonts.css" />
        <link rel="stylesheet" href="/assets/vendor/icons/style.css" />
      </head>
      <body>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
