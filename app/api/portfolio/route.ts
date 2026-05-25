import { NextResponse } from 'next/server';
import { getCached, setCache } from '@/lib/redis';
import { fetchPortfolio } from '@/lib/fetchers/portfolio';
import { PortfolioItem } from '@/lib/types';

const CACHE_KEY = 'portfolio:latest';
const CACHE_TTL = 900;

export async function GET() {
  try {
    const cached = await getCached<PortfolioItem[]>(CACHE_KEY);
    if (cached) return NextResponse.json(cached);

    const data = await fetchPortfolio();
    await setCache(CACHE_KEY, data, CACHE_TTL);
    return NextResponse.json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
