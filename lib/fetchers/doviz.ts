import { DovizData } from '@/lib/types';
import { direction } from '@/lib/utils';

const TCMB_TODAY = 'https://www.tcmb.gov.tr/kurlar/today.xml';
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

function calcChange(current: number, previous: number): number {
  if (!previous || !current) return 0;
  return ((current - previous) / previous) * 100;
}

/** TCMB'nin bir önceki iş günü kur dosyası URL'si */
function previousBusinessDayUrl(): string {
  const d = new Date();
  // İstanbul saatiyle hesapla
  const tr = new Date(d.toLocaleString('en-US', { timeZone: 'Europe/Istanbul' }));
  tr.setDate(tr.getDate() - 1);
  while (tr.getDay() === 0 || tr.getDay() === 6) {
    tr.setDate(tr.getDate() - 1);
  }
  const yyyy = tr.getFullYear();
  const mm = String(tr.getMonth() + 1).padStart(2, '0');
  const dd = String(tr.getDate()).padStart(2, '0');
  const ddmmyyyy = `${dd}${mm}${yyyy}`;
  return `https://www.tcmb.gov.tr/kurlar/${yyyy}${mm}/${ddmmyyyy}.xml`;
}

async function fetchTcmbXml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 0 },
    });
    if (!res.ok) return null;
    return res.text();
  } catch {
    return null;
  }
}

async function fetchGoldPrices(): Promise<{ current: number; previous: number }> {
  const res = await fetch(
    'https://query1.finance.yahoo.com/v8/finance/chart/GC%3DF?interval=1d&range=5d',
    { headers: { 'User-Agent': 'Mozilla/5.0' }, next: { revalidate: 0 } }
  );
  if (!res.ok) return { current: 0, previous: 0 };
  const json = await res.json();
  const meta = json?.chart?.result?.[0]?.meta ?? {};
  return {
    current: meta.regularMarketPrice ?? 0,
    previous: meta.chartPreviousClose ?? meta.regularMarketPrice ?? 0,
  };
}

export async function fetchDoviz(): Promise<DovizData> {
  const prevUrl = previousBusinessDayUrl();

  const [todayXml, prevXml, gold] = await Promise.all([
    fetchTcmbXml(TCMB_TODAY),
    fetchTcmbXml(prevUrl),
    fetchGoldPrices(),
  ]);

  if (!todayXml) throw new Error('TCMB bugünkü kur alınamadı');
  const xml = todayXml;
  const now = new Date().toISOString();

  function makeCurrency(name: string, code: string) {
    const today = parseXmlRate(xml, code);
    const prev = prevXml ? parseXmlRate(prevXml, code) : null;
    if (!today) return { name, buying: 0, selling: 0, change: 0, direction: 'flat' as const };
    const change = calcChange(today.selling, prev?.selling ?? today.selling);
    return {
      name,
      buying: today.buying,
      selling: today.selling,
      change,
      direction: direction(change),
    };
  }

  const dolar = makeCurrency('ABD Doları', 'USD');
  const euro = makeCurrency('Euro', 'EUR');
  const sterlin = makeCurrency('İngiliz Sterlini', 'GBP');

  const usdTry = dolar.selling || 1;
  const gramGoldTry = (gold.current / TROY_OZ_TO_GRAM) * usdTry;
  const gramGoldPrevTry = (gold.previous / TROY_OZ_TO_GRAM) * usdTry;
  const gramGoldChange = calcChange(gramGoldTry, gramGoldPrevTry);

  const gramAltin = {
    name: 'Gram Altın',
    buying: gramGoldTry * 0.995,
    selling: gramGoldTry,
    change: gramGoldChange,
    direction: direction(gramGoldChange),
  };

  const ceyrekAltin = {
    name: 'Çeyrek Altın',
    buying: gramGoldTry * 1.75 * 0.995,
    selling: gramGoldTry * 1.75,
    change: gramGoldChange,
    direction: direction(gramGoldChange),
  };

  return { dolar, euro, sterlin, gramAltin, ceyrekAltin, updatedAt: now };
}
