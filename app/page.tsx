'use client';

import BorsaCard from '@/components/BorsaCard';
import DovizCard from '@/components/DovizCard';
import PortfolioCard from '@/components/PortfolioCard';
import TrendsCard from '@/components/TrendsCard';
import NewsCard from '@/components/NewsCard';
import RefreshButton from '@/components/RefreshButton';

export default function Home() {
  const now = new Date().toLocaleDateString('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="bg-grid min-h-dvh">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800/60 backdrop-blur-xl bg-[#020817]/80">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-sm shadow-lg shadow-blue-500/20">
              📡
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-100 leading-none">Gündem Radar</h1>
              <p className="text-[10px] text-slate-600 capitalize mt-0.5 hidden sm:block">{now}</p>
            </div>
          </div>
          <RefreshButton />
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 py-5 space-y-4 pb-10">

        {/* Üst satır — 3 finansal kart */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <BorsaCard />
          <DovizCard />
          <div className="sm:col-span-2 lg:col-span-1">
            <PortfolioCard />
          </div>
        </div>

        {/* Trendler */}
        <TrendsCard />

        {/* Haberler */}
        <NewsCard />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-4">
        <p className="text-center text-xs text-slate-700">
          Gündem Radar · Veriler her 5 dakikada otomatik yenilenir
        </p>
      </footer>
    </div>
  );
}
