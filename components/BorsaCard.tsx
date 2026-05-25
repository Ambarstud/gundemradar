'use client';

import useSWR from 'swr';
import { BorsaSummary } from '@/lib/types';
import { formatNumber, isBorsaOpen } from '@/lib/utils';
import PriceChange from './PriceChange';
import LastUpdated from './LastUpdated';
import CardSkeleton from './CardSkeleton';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface IndexRowProps {
  label: string;
  value: number;
  change: number;
  direction: 'up' | 'down' | 'flat';
  big?: boolean;
}

function IndexRow({ label, value, change, direction, big }: IndexRowProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-xs text-slate-500 mb-1">{label}</p>
        <p className={`font-bold tabular-nums ${big ? 'text-2xl text-slate-100' : 'text-lg text-slate-200'}`}>
          {formatNumber(value, 0)}
        </p>
      </div>
      <PriceChange change={change} direction={direction} />
    </div>
  );
}

export default function BorsaCard() {
  const { data, error, isLoading } = useSWR<BorsaSummary>('/api/borsa', fetcher, {
    refreshInterval: 5 * 60 * 1000,
    revalidateOnFocus: true,
  });

  if (isLoading) return <CardSkeleton rows={2} title="Borsa" />;

  if (error || !data || 'error' in data) {
    return (
      <div className="glass rounded-2xl p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">📈 Borsa</p>
        <p className="text-red-400 text-sm">Veri alınamadı</p>
      </div>
    );
  }

  const acik = isBorsaOpen();

  return (
    <div className={`glass glass-hover rounded-2xl p-5 ${data.bist100.direction === 'up' ? 'glow-green' : data.bist100.direction === 'down' ? 'glow-red' : ''}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">📈 Borsa</span>
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${acik ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
          {acik ? '● Açık' : '● Kapalı'}
        </span>
      </div>

      <div className="divide-y divide-slate-800">
        <IndexRow label="BIST 100" value={data.bist100.value} change={data.bist100.change} direction={data.bist100.direction} big />
        <IndexRow label="BIST 30" value={data.bist30.value} change={data.bist30.change} direction={data.bist30.direction} />
      </div>

      <LastUpdated iso={data.updatedAt} />
    </div>
  );
}
