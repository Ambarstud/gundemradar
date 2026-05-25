import Parser from 'rss-parser';
import { NewsData, NewsItem } from '@/lib/types';

const RSS_FEEDS = [
  { url: 'https://www.ntv.com.tr/gundem.rss', source: 'NTV', category: 'gündem' },
  { url: 'https://www.ntv.com.tr/ekonomi.rss', source: 'NTV', category: 'ekonomi' },
  { url: 'https://www.trthaber.com/sondakika.rss', source: 'TRT Haber', category: 'gündem' },
  { url: 'https://www.sozcu.com.tr/rss/tum-haberler.xml', source: 'Sözcü', category: 'gündem' },
];

const parser = new Parser({ timeout: 8000 });

async function fetchFeed(
  feed: (typeof RSS_FEEDS)[0]
): Promise<NewsItem[]> {
  const result = await parser.parseURL(feed.url);
  return (result.items ?? []).slice(0, 10).map((item) => ({
    title: item.title ?? '',
    source: feed.source,
    url: item.link ?? '',
    publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
    category: feed.category,
  }));
}

export async function fetchHaberler(): Promise<NewsData> {
  const results = await Promise.allSettled(RSS_FEEDS.map(fetchFeed));

  const allArticles: NewsItem[] = results
    .filter((r): r is PromiseFulfilledResult<NewsItem[]> => r.status === 'fulfilled')
    .flatMap((r) => r.value);

  const sorted = allArticles
    .filter((a) => a.title && a.url)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 20);

  return { articles: sorted, updatedAt: new Date().toISOString() };
}
