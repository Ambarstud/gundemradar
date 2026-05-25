import { NextResponse } from 'next/server';
import { getCached, setCache } from '@/lib/redis';
import { fetchTrends } from '@/lib/fetchers/trends';
import { TrendsData } from '@/lib/types';

const CACHE_KEY = 'trends:latest';
const CACHE_TTL = 1800; // 30 dakika

export async function GET() {
  try {
    const cached = await getCached<TrendsData>(CACHE_KEY);
    if (cached) return NextResponse.json(cached);

    const data = await fetchTrends();
    await setCache(CACHE_KEY, data, CACHE_TTL);
    return NextResponse.json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
