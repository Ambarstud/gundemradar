'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { NewsData } from '@/lib/types';
import { formatRelativeTime } from '@/lib/utils';
import LastUpdated from './LastUpdated';
import CardSkeleton from './CardSkeleton';
import CardShell from './ui/CardShell';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const SOURCE_STYLE: Record<string, string> = {
  'NTV':       'bg-blue-500/15 text-blue-400 border-blue-500/20',
  'TRT Haber': 'bg-red-500/15 text-red-400 border-red-500/20',
  'Sözcü':     'bg-orange-500/15 text-orange-400 border-orange-500/20',
  'CNN Türk':  'bg-purple-500/15 text-purple-400 border-purple-500/20',
};

type Filter = 'all' | 'gündem' | 'ekonomi';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Tümü' },
  { key: 'gündem', label: 'Gündem' },
  { key: 'ekonomi', label: 'Ekonomi' },
];

export default function NewsCard() {
  const [filter, setFilter] = useState<Filter>('all');

  const { data, error, isLoading } = useSWR<NewsData>('/api/haberler', fetcher, {
    refreshInterval: 60 * 60 * 1000,
    revalidateOnFocus: true,
  });

  if (isLoading) return <CardSkeleton rows={8} title="Son Haberler" />;

  if (error || !data || 'error' in data) {
    return (
      <CardShell icon="📰" title="Son Haberler">
        <p className="text-red-400 text-sm">Veri alınamadı</p>
      </CardShell>
    );
  }

  const filtered =
    filter === 'all'
      ? data.articles
      : data.articles.filter((a) => a.category === filter);

  return (
    <CardShell
      icon="📰"
      title="Son Haberler"
      accent="green"
      className="h-full"
      badge={
        <div className="flex gap-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`filter-pill ${filter === f.key ? 'filter-pill-active' : 'filter-pill-inactive'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      }
      footer={<LastUpdated iso={data.updatedAt} />}
    >
      <div className="space-y-0.5">
        {filtered.length === 0 ? (
          <p className="text-slate-600 text-sm py-4 text-center">Bu kategoride haber yok</p>
        ) : (
          filtered.slice(0, 12).map((article, i) => (
            <a
              key={`${article.url}-${i}`}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-3 px-2 py-2.5 rounded-xl hover:bg-white/[0.04] transition-all"
            >
              <div className="w-1 self-stretch rounded-full bg-slate-800 group-hover:bg-blue-500/60 transition-colors shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-slate-300 text-sm leading-snug line-clamp-2 group-hover:text-white transition-colors">
                  {article.title}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span
                    className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${
                      SOURCE_STYLE[article.source] ?? 'bg-slate-800/60 text-slate-400 border-slate-700/50'
                    }`}
                  >
                    {article.source}
                  </span>
                  {article.category && (
                    <span className="text-[9px] text-slate-700 capitalize">{article.category}</span>
                  )}
                  <span className="text-[9px] text-slate-700 ml-auto shrink-0">
                    {formatRelativeTime(article.publishedAt)}
                  </span>
                </div>
              </div>
            </a>
          ))
        )}
      </div>
    </CardShell>
  );
}
