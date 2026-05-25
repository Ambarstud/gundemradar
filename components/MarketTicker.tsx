'use client';

import useSWR from 'swr';
import { BorsaSummary, DovizData } from '@/lib/types';
import { formatNumber } from '@/lib/utils';
import PriceChange from './PriceChange';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface TickerItem {
  label: string;
  value: string;
  change: number;
  direction: 'up' | 'down' | 'flat';
}

function TickerSegment({ items }: { items: TickerItem[] }) {
  return (
    <>
      {items.map((item) => (
        <div key={item.label} className="ticker-item">
          <span className="text-slate-500 font-medium">{item.label}</span>
          <span className="text-slate-200 font-semibold tabular-nums">{item.value}</span>
          <PriceChange change={item.change} direction={item.direction} size="sm" />
          <span className="ticker-sep" aria-hidden="true">·</span>
        </div>
      ))}
    </>
  );
}

export default function MarketTicker() {
  const { data: borsa } = useSWR<BorsaSummary>('/api/borsa', fetcher, {
    refreshInterval: 5 * 60 * 1000,
  });
  const { data: doviz } = useSWR<DovizData>('/api/doviz', fetcher, {
    refreshInterval: 5 * 60 * 1000,
  });

  if (!borsa && !doviz) return null;

  const items: TickerItem[] = [];

  if (borsa?.bist100) {
    items.push({
      label: 'BIST 100',
      value: formatNumber(borsa.bist100.value, 0),
      change: borsa.bist100.change,
      direction: borsa.bist100.direction,
    });
    items.push({
      label: 'BIST 30',
      value: formatNumber(borsa.bist30.value, 0),
      change: borsa.bist30.change,
      direction: borsa.bist30.direction,
    });
  }

  if (doviz) {
    items.push({
      label: 'USD/TRY',
      value: formatNumber(doviz.dolar.selling, 2),
      change: doviz.dolar.change,
      direction: doviz.dolar.direction,
    });
    items.push({
      label: 'EUR/TRY',
      value: formatNumber(doviz.euro.selling, 2),
      change: doviz.euro.change,
      direction: doviz.euro.direction,
    });
    items.push({
      label: 'Gram Altın',
      value: `${formatNumber(doviz.gramAltin.selling, 0)} ₺`,
      change: doviz.gramAltin.change,
      direction: doviz.gramAltin.direction,
    });
  }

  if (!items.length) return null;

  return (
    <div className="ticker-wrap border-b border-slate-800/60 bg-slate-950/50">
      <div className="ticker-label">CANLI</div>
      <div className="ticker-track overflow-hidden">
        <div className="ticker-inner">
          <TickerSegment items={items} />
          <TickerSegment items={items} />
        </div>
      </div>
    </div>
  );
}
