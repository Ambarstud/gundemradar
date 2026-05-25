'use client';

import useSWR from 'swr';
import { NewsData } from '@/lib/types';
import { formatRelativeTime } from '@/lib/utils';
import LastUpdated from './LastUpdated';
import CardSkeleton from './CardSkeleton';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const SOURCE_STYLE: Record<string, string> = {
  'NTV':      'bg-blue-500/15 text-blue-400',
  'TRT Haber':'bg-red-500/15 text-red-400',
  'Sözcü':    'bg-orange-500/15 text-orange-400',
  'CNN Türk': 'bg-purple-500/15 text-purple-400',
};

export default function NewsCard() {
  const { data, error, isLoading } = useSWR<NewsData>('/api/haberler', fetcher, {
    refreshInterval: 60 * 60 * 1000,
    revalidateOnFocus: true,
  });

  if (isLoading) return <CardSkeleton rows={8} title="Son Haberler" />;

  if (error || !data || 'error' in data) {
    return (
      <div className="glass rounded-2xl p-5 h-full">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">📰 Son Haberler</p>
        <p className="text-red-400 text-sm">Veri alınamadı</p>
      </div>
    );
  }

  return (
    <div className="glass glass-hover rounded-2xl p-5 h-full flex flex-col">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">📰 Son Haberler</p>

      <div className="space-y-0.5 flex-1">
        {data.articles.map((article, i) => (
          <a
            key={i}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-2.5 px-2 py-2 rounded-lg hover:bg-slate-800/70 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <p className="text-slate-300 text-sm leading-snug line-clamp-2 group-hover:text-white transition-colors">
                {article.title}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0 pt-0.5">
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded whitespace-nowrap ${SOURCE_STYLE[article.source] ?? 'bg-slate-700/50 text-slate-400'}`}>
                {article.source}
              </span>
              <span className="text-[10px] text-slate-700">{formatRelativeTime(article.publishedAt)}</span>
            </div>
          </a>
        ))}
      </div>

      <LastUpdated iso={data.updatedAt} label="güncellendi" />
    </div>
  );
}
