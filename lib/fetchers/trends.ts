import * as cheerio from 'cheerio';
import { TrendsData, TrendItem } from '@/lib/types';

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
  const $ = cheerio.load(html);

  const trends: TrendItem[] = [];

  // Farklı olası selektörler dene
  $('table tr, .trend-item, [class*="trend"]').each((i, el) => {
    if (trends.length >= 10) return;
    const text = $(el).text().trim();
    const name = text.split('\n')[0]?.trim();
    if (name && name.length > 1 && name.length < 100) {
      const countMatch = text.match(/([\d,.]+)\s*[KkMm]?\s*(tweet|tw|gönderi)/i);
      trends.push({
        rank: trends.length + 1,
        name,
        tweetCount: countMatch ? parseInt(countMatch[1].replace(/[,\.]/g, '')) : undefined,
        url: `https://twitter.com/search?q=${encodeURIComponent(name)}&src=trend_click`,
      });
    }
  });

  return trends;
}

async function scrapeFromTwitterTrending(): Promise<TrendItem[]> {
  const res = await fetch('https://twitter-trending.com/turkey', {
    headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'text/html' },
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`twitter-trending.com hatası: ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);

  const trends: TrendItem[] = [];
  $('li, .trend, [class*="trend"], td').each((_, el) => {
    if (trends.length >= 10) return;
    const text = $(el).text().trim();
    if (text && text.length > 1 && text.length < 80 && !text.includes('\n\n')) {
      trends.push({
        rank: trends.length + 1,
        name: text,
        url: `https://twitter.com/search?q=${encodeURIComponent(text)}&src=trend_click`,
      });
    }
  });

  return trends;
}

export async function fetchTrends(): Promise<TrendsData> {
  const strategies = [scrapeFromTwtdata, scrapeFromTwitterTrending];

  for (const strategy of strategies) {
    try {
      const trends = await strategy();
      if (trends.length >= 3) {
        return { trends: trends.slice(0, 10), updatedAt: new Date().toISOString() };
      }
    } catch {
      // Sonraki stratejiyi dene
    }
  }

  // Her iki kaynak da başarısız olduysa boş döndür
  return { trends: [], updatedAt: new Date().toISOString() };
}
