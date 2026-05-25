import { NextResponse } from 'next/server';
import { getCached, setCache } from '@/lib/redis';
import { fetchHaberler } from '@/lib/fetchers/haberler';
import { NewsData } from '@/lib/types';

const CACHE_KEY = 'news:latest';
const CACHE_TTL = 3600; // 1 saat

export async function GET() {
  try {
    const cached = await getCached<NewsData>(CACHE_KEY);
    if (cached) return NextResponse.json(cached);

    const data = await fetchHaberler();
    await setCache(CACHE_KEY, data, CACHE_TTL);
    return NextResponse.json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
