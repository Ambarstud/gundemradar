import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ServiceWorkerRegistrar from '@/components/ServiceWorkerRegistrar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Gündem Radar',
  description: 'Türkiye gündem takip paneli — borsa, döviz, haberler, trendler',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Gündem',
  },
};

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className={`${inter.className} bg-slate-900 text-slate-100 min-h-screen`}>
        <ServiceWorkerRegistrar />
        {children}
      </body>
    </html>
  );
}
