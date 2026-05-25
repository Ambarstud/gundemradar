import { PortfolioItem } from '@/lib/types';
import { direction } from '@/lib/utils';

const STOCKS: { symbol: string; yahooSymbol: string; name: string; currency: 'TRY' | 'USD' }[] = [
  { symbol: 'THYAO', yahooSymbol: 'THYAO.IS', name: 'Türk Hava Yolları', currency: 'TRY' },
  { symbol: 'ASELS', yahooSymbol: 'ASELS.IS', name: 'Aselsan', currency: 'TRY' },
  { symbol: 'ENJSA', yahooSymbol: 'ENJSA.IS', name: 'Enerjisa Enerji', currency: 'TRY' },
  { symbol: 'KCHOL', yahooSymbol: 'KCHOL.IS', name: 'Koç Holding', currency: 'TRY' },
  { symbol: 'VOO', yahooSymbol: 'VOO', name: 'Vanguard S&P 500 ETF', currency: 'USD' },
];

async function fetchYahooStock(
  item: (typeof STOCKS)[0]
): Promise<PortfolioItem> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${item.yahooSymbol}?interval=1d&range=2d`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`Yahoo ${item.yahooSymbol} hatası`);
  const json = await res.json();
  const meta = json?.chart?.result?.[0]?.meta ?? {};
  const price: number = meta.regularMarketPrice ?? 0;
  const prev: number = meta.chartPreviousClose ?? price;
  const change = prev ? ((price - prev) / prev) * 100 : 0;
  return {
    symbol: item.symbol,
    name: item.name,
    price,
    change,
    direction: direction(change),
    currency: item.currency,
  };
}

export async function fetchPortfolio(): Promise<PortfolioItem[]> {
  const results = await Promise.allSettled(STOCKS.map(fetchYahooStock));
  return results
    .filter((r): r is PromiseFulfilledResult<PortfolioItem> => r.status === 'fulfilled')
    .map((r) => r.value);
}
