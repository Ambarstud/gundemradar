'use client';

import useSWR from 'swr';
import { DovizData } from '@/lib/types';
import { formatNumber } from '@/lib/utils';
import PriceChange from './PriceChange';
import LastUpdated from './LastUpdated';
import CardSkeleton from './CardSkeleton';
import CardShell from './ui/CardShell';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function DovizCell({
  label,
  emoji,
  value,
  change,
  direction,
  suffix = '₺',
}: {
  label: string;
  emoji: string;
  value: number;
  change: number;
  direction: 'up' | 'down' | 'flat';
  suffix?: string;
}) {
  return (
    <div className="stat-cell">
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-xs">{emoji}</span>
        <p className="text-[10px] text-slate-500 font-medium">{label}</p>
      </div>
      <p className="text-sm font-bold text-slate-100 tabular-nums mb-1.5">
        {formatNumber(value)} <span className="text-slate-600 text-[10px] font-normal">{suffix}</span>
      </p>
      <PriceChange change={change} direction={direction} size="sm" />
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
      <CardShell icon="💰" title="Döviz & Altın">
        <p className="text-red-400 text-sm">Veri alınamadı</p>
      </CardShell>
    );
  }

  return (
    <CardShell
      icon="💰"
      title="Döviz & Altın"
      accent="amber"
      className="h-full"
      footer={<LastUpdated iso={data.updatedAt} label="TCMB" />}
    >
      <div className="stat-grid">
        <DovizCell label="Dolar" emoji="🇺🇸" value={data.dolar.selling} change={data.dolar.change} direction={data.dolar.direction} />
        <DovizCell label="Euro" emoji="🇪🇺" value={data.euro.selling} change={data.euro.change} direction={data.euro.direction} />
        <DovizCell label="Gram Altın" emoji="🥇" value={data.gramAltin.selling} change={data.gramAltin.change} direction={data.gramAltin.direction} />
        <DovizCell label="Çeyrek" emoji="🪙" value={data.ceyrekAltin.selling} change={data.ceyrekAltin.change} direction={data.ceyrekAltin.direction} />
      </div>
    </CardShell>
  );
}
