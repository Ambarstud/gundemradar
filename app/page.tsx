'use client';

import BorsaCard from '@/components/BorsaCard';
import DovizCard from '@/components/DovizCard';
import PortfolioCard from '@/components/PortfolioCard';
import TrendsCard from '@/components/TrendsCard';
import NewsCard from '@/components/NewsCard';
import RefreshButton from '@/components/RefreshButton';
import MarketTicker from '@/components/MarketTicker';
import ThemeToggle from '@/components/ThemeToggle';
import MobileNav from '@/components/MobileNav';
import { useLiveClock } from '@/lib/hooks/useLiveClock';
import { isBorsaOpen } from '@/lib/utils';

export default function Home() {
  const { time, date, weekday } = useLiveClock();
  const borsaAcik = isBorsaOpen();

  return (
    <div className="bg-grid min-h-dvh flex flex-col">

      <header className="sticky top-0 z-50 backdrop-blur-xl app-header">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 via-violet-500 to-violet-700 flex items-center justify-center text-sm shadow-lg shadow-violet-500/20">
                📡
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 app-header-dot pulse-dot" />
            </div>
            <div>
              <h1 className="text-sm font-bold app-text-primary leading-none">Gündem Radar</h1>
              <p className="text-[10px] app-text-muted mt-0.5 capitalize">{weekday}, {date}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2">
              <span
                className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                  borsaAcik
                    ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20'
                }`}
              >
                {borsaAcik ? '● Borsa Açık' : '● Borsa Kapalı'}
              </span>
              <span className="text-xs font-mono app-text-muted tabular-nums">{time}</span>
            </div>
            <ThemeToggle />
            <RefreshButton />
          </div>
        </div>
        <div className="header-accent" />
        <MarketTicker />
      </header>

      <main className="max-w-6xl mx-auto w-full px-4 py-5 pb-24 md:pb-5 flex flex-col gap-4 flex-1">

        <section aria-label="Finansal özet">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            <div id="borsa" className="lg:col-span-5 scroll-mt-20">
              <BorsaCard />
            </div>
            <div id="doviz" className="lg:col-span-3 scroll-mt-20">
              <DovizCard />
            </div>
            <div id="portfoy" className="lg:col-span-4 scroll-mt-20">
              <PortfolioCard />
            </div>
          </div>
        </section>

        <section aria-label="Gündem" className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 min-h-0">
          <div id="trendler" className="scroll-mt-20">
            <TrendsCard />
          </div>
          <div id="haberler" className="scroll-mt-20">
            <NewsCard />
          </div>
        </section>

      </main>

      <footer className="app-footer border-t py-4 mt-auto hidden md:block">
        <p className="text-center text-[11px] app-text-faint">
          Gündem Radar · Veriler 5 dakikada bir otomatik yenilenir · Kaynaklar: Yahoo Finance, TCMB, RSS
        </p>
      </footer>

      <MobileNav />
    </div>
  );
}
