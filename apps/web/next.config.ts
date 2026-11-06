import type { NextConfig } from 'next';

// Standalone hanya untuk image Docker Linux. Windows gagal symlink EPERM.
const useStandalone = process.env.NEXT_OUTPUT === 'standalone';
const apiOrigin = process.env.API_URL ?? 'http://127.0.0.1:4000';

const config: NextConfig = {
  ...(useStandalone ? { output: 'standalone' as const } : {}),
  reactStrictMode: true,
  poweredByHeader: false,
  async rewrites() {
    return [{ source: '/api/:path*', destination: apiOrigin + '/api/:path*' }];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(self), microphone=(self), geolocation=(self)' },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
    ];
  },
};

export default config;
