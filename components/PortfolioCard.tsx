'use client';

import useSWR from 'swr';
import { PortfolioItem } from '@/lib/types';
import { formatNumber } from '@/lib/utils';
import PriceChange from './PriceChange';
import CardSkeleton from './CardSkeleton';
import CardShell from './ui/CardShell';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const SYMBOL_COLORS: Record<string, string> = {
  THYAO: 'from-red-600/30 to-red-900/20 text-red-300',
  ASELS: 'from-blue-600/30 to-blue-900/20 text-blue-300',
  ENJSA: 'from-emerald-600/30 to-emerald-900/20 text-emerald-300',
  KCHOL: 'from-violet-600/30 to-violet-900/20 text-violet-300',
  VOO:   'from-amber-600/30 to-amber-900/20 text-amber-300',
};

export default function PortfolioCard() {
  const { data, error, isLoading } = useSWR<PortfolioItem[]>(
    '/api/portfolio',
    fetcher,
    { refreshInterval: 5 * 60 * 1000, revalidateOnFocus: true }
  );

  if (isLoading) return <CardSkeleton rows={5} title="Portföyüm" />;

  if (error || !data || !Array.isArray(data)) {
    return (
      <CardShell icon="💼" title="Portföyüm">
        <p className="text-red-400 text-sm">Veri alınamadı</p>
      </CardShell>
    );
  }

  const sorted = [...data].sort((a, b) => b.change - a.change);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];
  const avgChange = data.reduce((s, i) => s + i.change, 0) / data.length;

  return (
    <CardShell
      icon="💼"
      title="Portföyüm"
      accent="violet"
      className="h-full"
      badge={
        <PriceChange
          change={avgChange}
          direction={avgChange > 0.01 ? 'up' : avgChange < -0.01 ? 'down' : 'flat'}
          size="sm"
        />
      }
    >
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="stat-cell border-emerald-500/10">
          <p className="text-[9px] text-emerald-500 font-semibold uppercase tracking-wider mb-1">En İyi</p>
          <p className="text-xs font-bold text-slate-200">{best.symbol}</p>
          <PriceChange change={best.change} direction={best.direction} size="sm" />
        </div>
        <div className="stat-cell border-red-500/10">
          <p className="text-[9px] text-red-400 font-semibold uppercase tracking-wider mb-1">En Kötü</p>
          <p className="text-xs font-bold text-slate-200">{worst.symbol}</p>
          <PriceChange change={best.change} direction={worst.direction} size="sm" />
        </div>
      </div>

      <div className="space-y-0.5">
        {data.map((item) => (
          <div
            key={item.symbol}
            className="flex items-center justify-between px-2 py-2 rounded-xl hover:bg-white/[0.03] transition-colors group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`symbol-avatar bg-gradient-to-br ${SYMBOL_COLORS[item.symbol] ?? 'from-slate-700 to-slate-800 text-slate-400'}`}>
                {item.symbol.slice(0, 3)}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-slate-500 leading-none mb-0.5 truncate">{item.name}</p>
                <p className="text-sm font-semibold text-slate-100 tabular-nums leading-none">
                  {formatNumber(item.price)}{' '}
                  <span className="text-slate-600 text-[10px]">{item.currency === 'USD' ? '$' : '₺'}</span>
                </p>
              </div>
            </div>
            <PriceChange change={item.change} direction={item.direction} size="sm" />
          </div>
        ))}
      </div>
    </CardShell>
  );
}
