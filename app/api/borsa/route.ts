import { NextResponse } from 'next/server';
import { getCached, setCache } from '@/lib/redis';
import { fetchBorsa } from '@/lib/fetchers/borsa';
import { BorsaSummary } from '@/lib/types';

const CACHE_KEY = 'borsa:summary';
const CACHE_TTL = 900; // 15 dakika

export async function GET() {
  try {
    const cached = await getCached<BorsaSummary>(CACHE_KEY);
    if (cached) return NextResponse.json(cached);

    const data = await fetchBorsa();
    await setCache(CACHE_KEY, data, CACHE_TTL);
    return NextResponse.json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
