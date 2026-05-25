import { TrendsData, TrendItem } from '@/lib/types';

async function scrapeFromTrends24(): Promise<TrendItem[]> {
  const res = await fetch('https://trends24.in/turkey/', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml',
      'Accept-Language': 'tr-TR,tr;q=0.9',
    },
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`trends24.in hatası: ${res.status}`);
  const html = await res.text();

  // trends24.in: Twitter arama linkleri olan tüm <a> elemanları
  const matches = Array.from(
    html.matchAll(/href="(https:\/\/twitter\.com\/search\?q=[^"]+)"[^>]*>([^<]+)<\/a>/g)
  );

  const seen = new Set<string>();
  const trends: TrendItem[] = [];

  for (const [, url, rawName] of matches) {
    const name = rawName.trim();
    if (!name || seen.has(name) || name.length > 80 || name.length < 2) continue;
    seen.add(name);
    trends.push({
      rank: trends.length + 1,
      name,
      url,
    });
    if (trends.length >= 20) break;
  }

  return trends;
}

async function scrapeFromTwtdata(): Promise<TrendItem[]> {
  const res = await fetch('https://twtdata.com/twitter-trends/turkey/', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      Accept: 'text/html',
    },
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`twtdata.com hatası: ${res.status}`);
  const html = await res.text();

  const matches = Array.from(
    html.matchAll(/href="(https?:\/\/(?:twitter|x)\.com\/search[^"]+)"[^>]*>([^<]{2,60})<\/a>/g)
  );

  const seen = new Set<string>();
  const trends: TrendItem[] = [];

  for (const [, url, rawName] of matches) {
    const name = rawName.trim();
    if (!name || seen.has(name)) continue;
    seen.add(name);
    trends.push({ rank: trends.length + 1, name, url });
    if (trends.length >= 20) break;
  }

  return trends;
}

export async function fetchTrends(): Promise<TrendsData> {
  for (const scraper of [scrapeFromTrends24, scrapeFromTwtdata]) {
    try {
      const trends = await scraper();
      if (trends.length >= 5) {
        return { trends: trends.slice(0, 20), updatedAt: new Date().toISOString() };
      }
    } catch {
      // sonraki kaynağı dene
    }
  }
  return { trends: [], updatedAt: new Date().toISOString() };
}
