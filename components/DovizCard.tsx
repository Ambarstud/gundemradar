'use client';

import useSWR from 'swr';
import { DovizData } from '@/lib/types';
import { formatNumber } from '@/lib/utils';
import PriceChange from './PriceChange';
import LastUpdated from './LastUpdated';
import CardSkeleton from './CardSkeleton';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function Row({ label, value, change, direction, suffix = 'TL' }: {
  label: string; value: number; change: number;
  direction: 'up' | 'down' | 'flat'; suffix?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <div>
        <p className="text-xs text-slate-500 mb-0.5">{label}</p>
        <p className="text-slate-100 font-semibold tabular-nums text-sm">
          {formatNumber(value)} <span className="text-slate-600 text-xs">{suffix}</span>
        </p>
      </div>
      <PriceChange change={change} direction={direction} />
    </div>
  );
}

export default function DovizCard() {
  const { data, error, isLoading } = useSWR<DovizData>('/api/doviz', fetcher, {
    refreshInterval: 5 * 60 * 1000,
    revalidateOnFocus: true,
  });

  if (isLoading) return <CardSkeleton rows={4} title="Döviz & Altın" />;

  if (error || !data || 'error' in data) {
    return (
      <div className="glass rounded-2xl p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">💰 Döviz & Altın</p>
        <p className="text-red-400 text-sm">Veri alınamadı</p>
      </div>
    );
  }

  return (
    <div className="glass glass-hover rounded-2xl p-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1">💰 Döviz & Altın</p>

      <div className="divide-y divide-slate-800">
        <Row label="Dolar" value={data.dolar.selling} change={data.dolar.change} direction={data.dolar.direction} />
        <Row label="Euro" value={data.euro.selling} change={data.euro.change} direction={data.euro.direction} />
        <Row label="Gram Altın" value={data.gramAltin.selling} change={data.gramAltin.change} direction={data.gramAltin.direction} />
        <Row label="Çeyrek Altın" value={data.ceyrekAltin.selling} change={data.ceyrekAltin.change} direction={data.ceyrekAltin.direction} />
      </div>

      <LastUpdated iso={data.updatedAt} />
    </div>
  );
}
