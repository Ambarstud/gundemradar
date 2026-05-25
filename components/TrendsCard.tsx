'use client';

import useSWR from 'swr';
import { TrendsData } from '@/lib/types';
import LastUpdated from './LastUpdated';
import CardSkeleton from './CardSkeleton';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const rankColors = [
  'text-amber-400',
  'text-slate-400',
  'text-orange-700',
];

export default function TrendsCard() {
  const { data, error, isLoading } = useSWR<TrendsData>('/api/trends', fetcher, {
    refreshInterval: 30 * 60 * 1000,
    revalidateOnFocus: false,
  });

  if (isLoading) return <CardSkeleton rows={5} title="Türkiye Trend" />;

  if (error || !data || 'error' in data) {
    return (
      <div className="glass rounded-2xl p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">🔥 Türkiye Trend</p>
        <p className="text-slate-500 text-sm">Trend verisi geçici olarak kullanılamıyor</p>
      </div>
    );
  }

  if (!data.trends?.length) {
    return (
      <div className="glass rounded-2xl p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">🔥 Türkiye Trend</p>
        <p className="text-slate-500 text-sm">Şu an trend verisi bulunamadı</p>
        <LastUpdated iso={data.updatedAt} />
      </div>
    );
  }

  return (
    <div className="glass glass-hover rounded-2xl p-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">🔥 Türkiye Trend</p>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {data.trends.map((trend) => (
          <a
            key={trend.rank}
            href={trend.url ?? `https://twitter.com/search?q=${encodeURIComponent(trend.name)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col gap-1 p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all"
          >
            <span className={`text-xs font-bold ${rankColors[trend.rank - 1] ?? 'text-slate-600'}`}>
              #{trend.rank}
            </span>
            <span className="text-slate-200 text-sm font-medium leading-tight truncate group-hover:text-blue-400 transition-colors">
              {trend.name}
            </span>
            {trend.tweetCount && (
              <span className="text-slate-600 text-xs">
                {trend.tweetCount >= 1000 ? `${(trend.tweetCount / 1000).toFixed(0)}K` : trend.tweetCount} tw
              </span>
            )}
          </a>
        ))}
      </div>

      <LastUpdated iso={data.updatedAt} />
    </div>
  );
}
