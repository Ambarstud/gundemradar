'use client';

import useSWR from 'swr';
import { TrendsData } from '@/lib/types';
import LastUpdated from './LastUpdated';
import CardSkeleton from './CardSkeleton';
import CardShell from './ui/CardShell';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function rankClass(rank: number) {
  if (rank === 1) return 'rank-1';
  if (rank === 2) return 'rank-2';
  if (rank === 3) return 'rank-3';
  return 'rank-n';
}

export default function TrendsCard() {
  const { data, error, isLoading } = useSWR<TrendsData>('/api/trends', fetcher, {
    refreshInterval: 30 * 60 * 1000,
    revalidateOnFocus: false,
  });

  if (isLoading) return <CardSkeleton rows={8} title="X Trendleri" />;

  if (error || !data || 'error' in data || !data.trends?.length) {
    return (
      <CardShell icon="𝕏" title="X Trendleri" accent="blue" className="h-full">
        <p className="text-slate-600 text-sm">Trend verisi geçici olarak alınamıyor</p>
      </CardShell>
    );
  }

  return (
    <CardShell
      icon="𝕏"
      title="X Trendleri"
      accent="blue"
      className="h-full"
      badge={
        <span className="text-[10px] text-slate-600 bg-slate-800/60 px-2 py-0.5 rounded-full">
          {data.trends.length} konu
        </span>
      }
      footer={<LastUpdated iso={data.updatedAt} />}
    >
      <ol className="space-y-0.5">
        {data.trends.slice(0, 12).map((trend) => (
          <li key={trend.rank}>
            <a
              href={trend.url ?? `https://twitter.com/search?q=${encodeURIComponent(trend.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/[0.04] transition-all"
            >
              <span className={`rank-badge ${rankClass(trend.rank)}`}>
                {trend.rank}
              </span>
              <span className="text-slate-300 text-sm group-hover:text-blue-400 transition-colors font-medium truncate flex-1">
                {trend.name}
              </span>
              {trend.tweetCount && (
                <span className="text-slate-700 text-[10px] shrink-0 tabular-nums">
                  {trend.tweetCount >= 1000
                    ? `${Math.round(trend.tweetCount / 1000)}K`
                    : trend.tweetCount}
                </span>
              )}
              <svg
                className="w-3 h-3 text-slate-700 group-hover:text-blue-500 transition-colors shrink-0 opacity-0 group-hover:opacity-100"
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </li>
        ))}
      </ol>
    </CardShell>
  );
}
