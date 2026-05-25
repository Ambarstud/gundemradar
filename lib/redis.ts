import { Redis } from '@upstash/redis';

let redis: Redis | null = null;

export function getRedis(): Redis {
  if (!redis) {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      throw new Error('Redis yapılandırılmamış — cache devre dışı, veriler doğrudan API\'den çekilecek');
    }
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return redis;
}

export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const r = getRedis();
    return await r.get<T>(key);
  } catch {
    return null;
  }
}

export async function setCache(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  try {
    const r = getRedis();
    await r.set(key, value, { ex: ttlSeconds });
  } catch {
    // Cache yazma hatası kritik değil, sessizce geç
  }
}
