import { NextResponse } from 'next/server';
import { getCached, setCache } from '@/lib/redis';
import { fetchDoviz } from '@/lib/fetchers/doviz';
import { DovizData } from '@/lib/types';

const CACHE_KEY = 'doviz:latest';
const CACHE_TTL = 900;

export async function GET() {
  try {
    const cached = await getCached<DovizData>(CACHE_KEY);
    if (cached) return NextResponse.json(cached);

    const data = await fetchDoviz();
    await setCache(CACHE_KEY, data, CACHE_TTL);
    return NextResponse.json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
