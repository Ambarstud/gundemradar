import { BorsaSummary } from '@/lib/types';
import { direction } from '@/lib/utils';

async function fetchYahooQuote(symbol: string): Promise<{ price: number; change: number }> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=2d`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`Yahoo Finance ${symbol} hatası: ${res.status}`);
  const json = await res.json();
  const meta = json?.chart?.result?.[0]?.meta ?? {};
  const price: number = meta.regularMarketPrice ?? 0;
  const prev: number = meta.chartPreviousClose ?? price;
  const change = prev ? ((price - prev) / prev) * 100 : 0;
  return { price, change };
}

export async function fetchBorsa(): Promise<BorsaSummary> {
  const now = new Date().toISOString();
  const [bist100, bist30] = await Promise.all([
    fetchYahooQuote('XU100.IS'),
    fetchYahooQuote('XU030.IS'),
  ]);

  return {
    bist100: {
      value: bist100.price,
      change: bist100.change,
      changeAmount: 0,
      direction: direction(bist100.change),
      time: now,
    },
    bist30: {
      value: bist30.price,
      change: bist30.change,
      changeAmount: 0,
      direction: direction(bist30.change),
      time: now,
    },
    updatedAt: now,
  };
}
