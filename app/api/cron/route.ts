import { NextRequest, NextResponse } from 'next/server';
import { setCache } from '@/lib/redis';
import { fetchBorsa } from '@/lib/fetchers/borsa';
import { fetchDoviz } from '@/lib/fetchers/doviz';
import { fetchPortfolio } from '@/lib/fetchers/portfolio';
import { fetchHaberler } from '@/lib/fetchers/haberler';
import { fetchTrends } from '@/lib/fetchers/trends';

async function sendTelegramAlert(message: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' }),
  });
}

export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get('authorization');
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
    }
  }

  const results: Record<string, string> = {};

  const [borsa, doviz, portfolio, haberler, trends] = await Promise.allSettled([
    fetchBorsa(),
    fetchDoviz(),
    fetchPortfolio(),
    fetchHaberler(),
    fetchTrends(),
  ]);

  if (borsa.status === 'fulfilled') {
    await setCache('borsa:summary', borsa.value, 900);
    results.borsa = 'ok';

    // BIST 100 %3+ hareket etti mi?
    const change = Math.abs(borsa.value.bist100.change);
    if (change >= 3) {
      const dir = borsa.value.bist100.change > 0 ? '📈' : '📉';
      const sign = borsa.value.bist100.change > 0 ? '+' : '';
      await sendTelegramAlert(
        `🚨 <b>GÜNDEM RADAR ALERT</b>\n\n${dir} BIST 100: ${borsa.value.bist100.value.toLocaleString('tr-TR')} (${sign}%${change.toFixed(1)})\nBorsa sert hareket etti!\n\n⏰ ${new Date().toLocaleString('tr-TR')}`
      );
    }
  } else {
    results.borsa = 'hata';
  }

  if (doviz.status === 'fulfilled') {
    await setCache('doviz:latest', doviz.value, 900);
    results.doviz = 'ok';

    // Dolar %2+ hareket etti mi?
    const dolarChange = Math.abs(doviz.value.dolar.change);
    if (dolarChange >= 2) {
      const dir = doviz.value.dolar.change > 0 ? '📈' : '📉';
      const sign = doviz.value.dolar.change > 0 ? '+' : '';
      await sendTelegramAlert(
        `🚨 <b>GÜNDEM RADAR ALERT</b>\n\n${dir} Dolar: ${doviz.value.dolar.selling.toFixed(2)} TL (${sign}%${dolarChange.toFixed(1)})\n\n⏰ ${new Date().toLocaleString('tr-TR')}`
      );
    }
  } else {
    results.doviz = 'hata';
  }

  if (portfolio.status === 'fulfilled') {
    await setCache('portfolio:latest', portfolio.value, 900);
    results.portfolio = 'ok';

    // Herhangi bir hisse %5+ hareket etti mi?
    for (const stock of portfolio.value) {
      if (Math.abs(stock.change) >= 5) {
        const dir = stock.change > 0 ? '📈' : '📉';
        const sign = stock.change > 0 ? '+' : '';
        await sendTelegramAlert(
          `🚨 <b>GÜNDEM RADAR ALERT</b>\n\n${dir} ${stock.symbol}: ${stock.price.toFixed(2)} ${stock.currency === 'USD' ? '$' : 'TL'} (${sign}%${Math.abs(stock.change).toFixed(1)})\n\n⏰ ${new Date().toLocaleString('tr-TR')}`
        );
      }
    }
  } else {
    results.portfolio = 'hata';
  }

  if (haberler.status === 'fulfilled') {
    await setCache('news:latest', haberler.value, 3600);
    results.haberler = 'ok';
  } else {
    results.haberler = 'hata';
  }

  if (trends.status === 'fulfilled') {
    await setCache('trends:latest', trends.value, 1800);
    results.trends = 'ok';
  } else {
    results.trends = 'hata';
  }

  return NextResponse.json({ success: true, results, updatedAt: new Date().toISOString() });
}

// Vercel Cron da GET ile çağırabilir
export { POST as GET };
