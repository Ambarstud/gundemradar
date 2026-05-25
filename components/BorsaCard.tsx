'use client';

import useSWR from 'swr';
import { BorsaSummary } from '@/lib/types';
import { formatNumber, isBorsaOpen } from '@/lib/utils';
import PriceChange from './PriceChange';
import LastUpdated from './LastUpdated';
import CardSkeleton from './CardSkeleton';
import CardShell from './ui/CardShell';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function BorsaCard() {
  const { data, error, isLoading } = useSWR<BorsaSummary>('/api/borsa', fetcher, {
    refreshInterval: 5 * 60 * 1000,
    revalidateOnFocus: true,
  });

  if (isLoading) return <CardSkeleton rows={2} title="Borsa" />;

  if (error || !data || 'error' in data) {
    return (
      <CardShell icon="📈" title="Borsa">
        <p className="text-red-400 text-sm">Veri alınamadı</p>
      </CardShell>
    );
  }

  const acik = isBorsaOpen();
  const glow = data.bist100.direction === 'up' ? 'green' : data.bist100.direction === 'down' ? 'red' : 'none';
  const accent = glow === 'none' ? 'blue' : glow;

  return (
    <CardShell
      icon="📈"
      title="Borsa"
      glow={glow}
      accent={accent}
      className="h-full"
      badge={
        <span
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
            acik ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
          }`}
        >
          {acik ? 'Canlı' : 'Son Kapanış'}
        </span>
      }
      footer={<LastUpdated iso={data.updatedAt} />}
    >
      {/* Hero BIST 100 */}
      <div className="mb-4">
        <p className="text-[11px] text-slate-500 mb-1.5 font-medium">BIST 100</p>
        <div className="flex items-end justify-between gap-3">
          <p className="stat-hero text-slate-50 animate-value">
            {formatNumber(data.bist100.value, 2)}
          </p>
          <PriceChange
            change={data.bist100.change}
            direction={data.bist100.direction}
            size="lg"
          />
        </div>
      </div>

      {/* BIST 30 secondary */}
      <div className="stat-cell flex items-center justify-between">
        <div>
          <p className="text-[10px] text-slate-500 mb-0.5">BIST 30</p>
          <p className="text-lg font-bold text-slate-200 tabular-nums">
            {formatNumber(data.bist30.value, 2)}
          </p>
        </div>
        <PriceChange
          change={data.bist30.change}
          direction={data.bist30.direction}
        />
      </div>
    </CardShell>
  );
}
