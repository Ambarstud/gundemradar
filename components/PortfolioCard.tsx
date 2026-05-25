'use client';

import useSWR from 'swr';
import { PortfolioItem } from '@/lib/types';
import { formatNumber } from '@/lib/utils';
import PriceChange from './PriceChange';
import LastUpdated from './LastUpdated';
import CardSkeleton from './CardSkeleton';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function PortfolioCard() {
  const { data, error, isLoading } = useSWR<PortfolioItem[]>('/api/portfolio', fetcher, {
    refreshInterval: 5 * 60 * 1000,
    revalidateOnFocus: true,
  });

  if (isLoading) return <CardSkeleton rows={5} title="Portföyüm" />;

  if (error || !data || !Array.isArray(data)) {
    return (
      <div className="glass rounded-2xl p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">💼 Portföyüm</p>
        <p className="text-red-400 text-sm">Veri alınamadı</p>
      </div>
    );
  }

  return (
    <div className="glass glass-hover rounded-2xl p-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1">💼 Portföyüm</p>

      <div className="divide-y divide-slate-800">
        {data.map((item) => (
          <div key={item.symbol} className="flex items-center justify-between py-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-bold text-slate-400">
                  {item.symbol.slice(0, 3)}
                </span>
              </div>
              <div>
                <p className="text-xs text-slate-500 leading-none mb-0.5">{item.symbol}</p>
                <p className="text-slate-100 font-semibold tabular-nums text-sm leading-none">
                  {formatNumber(item.price)}{' '}
                  <span className="text-slate-600 text-xs">{item.currency === 'USD' ? '$' : '₺'}</span>
                </p>
              </div>
            </div>
            <PriceChange change={item.change} direction={item.direction} />
          </div>
        ))}
      </div>

      <LastUpdated iso={new Date().toISOString()} />
    </div>
  );
}
