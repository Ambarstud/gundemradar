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
  });

  return (
    <div className="bg-grid min-h-dvh flex flex-col">

      {/* Sticky header */}
      <header className="sticky top-0 z-50 border-b border-slate-800/60 backdrop-blur-xl bg-[#020817]/80">
        <div className="max-w-6xl mx-auto px-4 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-xs">
              📡
            </div>
            <span className="text-sm font-bold text-slate-100">Gündem Radar</span>
            <span className="text-slate-700 text-xs hidden sm:inline">·</span>
            <span className="text-slate-600 text-xs capitalize hidden sm:inline">{now}</span>
          </div>
          <RefreshButton />
        </div>
      </header>

      <main className="max-w-6xl mx-auto w-full px-4 py-4 flex flex-col gap-4 flex-1">

        {/* Finansal özet — kompakt üst bant */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <BorsaCard />
          <DovizCard />
          <PortfolioCard />
        </div>

        {/* Gündem — trendler + haberler yan yana */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
          <TrendsCard />
          <NewsCard />
        </div>

      </main>

      <footer className="border-t border-slate-800/40 py-3">
        <p className="text-center text-[11px] text-slate-800">
          Gündem Radar · Veriler her 5 dakikada otomatik yenilenir
        </p>
      </footer>
    </div>
  );
}
