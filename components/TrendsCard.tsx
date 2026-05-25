'use client';

import useSWR from 'swr';
import { TrendsData } from '@/lib/types';
import LastUpdated from './LastUpdated';
import CardSkeleton from './CardSkeleton';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function TrendsCard() {
  const { data, error, isLoading } = useSWR<TrendsData>('/api/trends', fetcher, {
    refreshInterval: 30 * 60 * 1000,
    revalidateOnFocus: false,
  });

  if (isLoading) return <CardSkeleton rows={8} title="X'te Şu An" />;

  if (error || !data || 'error' in data || !data.trends?.length) {
    return (
      <div className="glass rounded-2xl p-5 h-full">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">𝕏 X'te Şu An</span>
        </div>
        <p className="text-slate-600 text-sm">Trend verisi geçici olarak alınamıyor</p>
      </div>
    );
  }

  return (
    <div className="glass glass-hover rounded-2xl p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">𝕏 X'te Şu An</span>
        <span className="text-[10px] text-slate-600">{data.trends.length} konu</span>
      </div>

      <ol className="space-y-0.5 flex-1">
        {data.trends.map((trend) => (
          <li key={trend.rank}>
            <a
              href={trend.url ?? `https://twitter.com/search?q=${encodeURIComponent(trend.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-800/70 transition-colors"
            >
              <span className="text-[11px] font-mono text-slate-700 w-5 text-right shrink-0">
                {trend.rank}
              </span>
              <span className="text-slate-300 text-sm group-hover:text-blue-400 transition-colors font-medium truncate">
                {trend.name}
              </span>
              {trend.tweetCount && (
                <span className="text-slate-700 text-[10px] ml-auto shrink-0">
                  {trend.tweetCount >= 1000 ? `${Math.round(trend.tweetCount / 1000)}K` : trend.tweetCount}
                </span>
              )}
            </a>
          </li>
        ))}
      </ol>

      <LastUpdated iso={data.updatedAt} />
    </div>
  );
}
