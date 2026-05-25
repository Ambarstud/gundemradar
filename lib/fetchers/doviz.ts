import { DovizData, CurrencyItem } from '@/lib/types';
import { direction } from '@/lib/utils';

const TCMB_URL = 'https://www.tcmb.gov.tr/kurlar/today.xml';
const TROY_OZ_TO_GRAM = 31.1035;

function parseXmlRate(xml: string, currencyCode: string): { buying: number; selling: number } | null {
  const regex = new RegExp(
    `<Currency[^>]*CurrencyCode="${currencyCode}"[^>]*>[\\s\\S]*?<ForexBuying>([\\d.]+)<\\/ForexBuying>[\\s\\S]*?<ForexSelling>([\\d.]+)<\\/ForexSelling>`,
    'i'
  );
  const match = xml.match(regex);
  if (!match) return null;
  return { buying: parseFloat(match[1]), selling: parseFloat(match[2]) };
}

async function fetchGoldUSD(): Promise<number> {
  const res = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/GC%3DF?interval=1d&range=2d', {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error('Gold fiyatı alınamadı');
  const json = await res.json();
  return json?.chart?.result?.[0]?.meta?.regularMarketPrice ?? 0;
}

async function fetchGoldPrevUSD(): Promise<number> {
  const res = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/GC%3DF?interval=1d&range=2d', {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    next: { revalidate: 0 },
  });
  if (!res.ok) return 0;
  const json = await res.json();
  return json?.chart?.result?.[0]?.meta?.chartPreviousClose ?? 0;
}

export async function fetchDoviz(): Promise<DovizData> {
  const [tcmbRes, goldUSD, goldPrevUSD] = await Promise.all([
    fetch(TCMB_URL, { headers: { 'User-Agent': 'Mozilla/5.0' }, next: { revalidate: 0 } }),
    fetchGoldUSD(),
    fetchGoldPrevUSD(),
  ]);

  if (!tcmbRes.ok) throw new Error(`TCMB hatası: ${tcmbRes.status}`);
  const xml = await tcmbRes.text();
  const now = new Date().toISOString();

  function makeItem(name: string, code: string, multiplier = 1): CurrencyItem {
    const rates = parseXmlRate(xml, code);
    if (!rates) return { name, buying: 0, selling: 0, change: 0, direction: 'flat' };
    // TCMB çapraz kurları için birim çarpanı (bazı kurlar 100 birim için)
    return {
      name,
      buying: rates.buying * multiplier,
      selling: rates.selling * multiplier,
      change: 0,
      direction: 'flat',
    };
  }

  const dolar = makeItem('ABD Doları', 'USD');
  const euro = makeItem('Euro', 'EUR');
  const sterlin = makeItem('İngiliz Sterlini', 'GBP');

  // Gram altın = (USD/oz × USD/TRY) / 31.1035
  const usdTry = dolar.selling || 1;
  const gramGoldTry = (goldUSD / TROY_OZ_TO_GRAM) * usdTry;
  const gramGoldPrevTry = (goldPrevUSD / TROY_OZ_TO_GRAM) * usdTry;
  const gramGoldChange = gramGoldPrevTry ? ((gramGoldTry - gramGoldPrevTry) / gramGoldPrevTry) * 100 : 0;

  const gramAltin: CurrencyItem = {
    name: 'Gram Altın',
    buying: gramGoldTry * 0.995,
    selling: gramGoldTry,
    change: gramGoldChange,
    direction: direction(gramGoldChange),
  };

  // Çeyrek altın = 1.75 gram
  const ceyrekAltin: CurrencyItem = {
    name: 'Çeyrek Altın',
    buying: gramGoldTry * 1.75 * 0.995,
    selling: gramGoldTry * 1.75,
    change: gramGoldChange,
    direction: direction(gramGoldChange),
  };

  return { dolar, euro, sterlin, gramAltin, ceyrekAltin, updatedAt: now };
}
