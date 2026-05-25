# 🇹🇷 GÜNDEM RADAR — Proje Dökümanı (PRD)

> **Türkiye gündemini tek ekrandan takip eden kişisel dashboard uygulaması.**
> Vercel üzerinde deploy edilmiş, tamamen ücretsiz altyapı ile çalışıyor.

---

## 1. PROJE ÖZETİ

**Gündem Radar**, Türkiye'deki güncel gelişmeleri — haberler, X/Twitter trendleri, borsa, döviz ve altın — tek bir dashboard üzerinden takip eden kişisel bir web uygulamasıdır.

| Alan | Detay |
|------|-------|
| **Proje sahibi** | Berkay (GitHub: Ambarstud) |
| **Kullanım** | Kişisel (tek kullanıcı) |
| **Platform** | Web (responsive, mobil uyumlu) + PWA + Telegram bildirim |
| **Tech stack** | Next.js 16 (App Router), TypeScript, Tailwind CSS v4 |
| **Deployment** | Vercel Hobby plan (ücretsiz) |
| **Cache** | Upstash Redis (opsiyonel — olmadan da çalışır) |
| **Bütçe** | $0 — tamamen ücretsiz servisler |
| **Production URL** | https://gundem-radar.vercel.app |
| **GitHub** | https://github.com/Ambarstud/gundemradar |
| **Proje dizini** | `/Users/berkaysarikaya/Projects/gundem-radar` |

---

## 2. KULLANICI HİKAYELERİ

1. **Gündem Özeti:** Uygulamayı açınca Türkiye gündeminin tek ekranlık özetini görür.
2. **Borsa Durumu:** "Borsa bugün artıda mı ekside mi?", "Dolar ne kadar?", "Altın düştü mü?" sorularına tek bakışta cevap alır.
3. **X Trendleri:** Türkiye'de şu an X'te neyin konuşulduğunu, haberlere girmeden önce patlayan konuları görür.
4. **Haber Takibi:** NTV, TRT Haber, Sözcü kaynaklı son dakika haberlerini takip eder.
5. **Portföy Takibi:** THYAO, ASELS, ENJSA, KCHOL ve VOO ETF'inin anlık durumunu görür.
6. **Bildirim:** Önemli gelişmelerde (BIST %3+, hisse %5+, Dolar %2+) Telegram'dan bildirim alır.
7. **Mobil Erişim:** Telefonunun ana ekranına ekleyerek (PWA) hızlıca açar.

---

## 3. TEKNİK MİMARİ

```
┌─────────────────────────────────────────────────────────┐
│                      FRONTEND                            │
│          Next.js 16 + Tailwind CSS v4 + TypeScript       │
│                                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                 │
│  │  Borsa   │ │  Döviz   │ │ Portföy  │  ← üst bant     │
│  └──────────┘ └──────────┘ └──────────┘                 │
│  ┌───────────────────┐ ┌───────────────────┐             │
│  │  X Trendleri      │ │   Son Haberler    │  ← yan yana │
│  └───────────────────┘ └───────────────────┘             │
│                                                          │
│  Her kart SWR ile kendi API'sini 5dk'da bir çeker        │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                   NEXT.JS API ROUTES                     │
│           /api/borsa      /api/doviz                     │
│           /api/portfolio  /api/haberler                  │
│           /api/trends     /api/cron                      │
│                                                          │
├──────────────────────────────────────────────────────────┤
│               UPSTASH REDIS (Opsiyonel Cache)            │
│     borsa:summary    → TTL 15 dk                         │
│     doviz:latest     → TTL 15 dk                         │
│     portfolio:latest → TTL 15 dk                         │
│     news:latest      → TTL 60 dk                         │
│     trends:latest    → TTL 30 dk                         │
│  ⚠️  Redis yoksa her istek doğrudan kaynak API'ye gider  │
│                                                          │
├──────────────────────────────────────────────────────────┤
│            VERCEL CRON (Hobby: günde 1 çalışma)          │
│     Her gün 07:00 UTC (10:00 TR) → /api/cron             │
│     Tüm cache'i ısıtır + Telegram alertleri gönderir     │
└──────────────────────────────────────────────────────────┘
```

### 3.1 Mimari Kararları

- **Next.js API Routes:** Sunucu tarafında çalışır, API key'ler gizli kalır, CORS sorunu olmaz.
- **Upstash Redis (opsiyonel):** Env var tanımlanmazsa cache atlanır, her istek kaynaktan çeker. SWR zaten client tarafında 5 dakika cache'lediği için Redis olmadan da kullanılabilir.
- **Vercel Cron:** Hobby planda günde 1 çalışma hakkı var. Cache ısıtma ve Telegram alert için sabah 10'da çalışır. Gün içi veri güncellemesi frontend SWR tarafından yapılır.

---

## 4. VERİ KAYNAKLARI

### 4.1 Borsa — Yahoo Finance ✅

> **⚠️ BigPara (hurriyet.com.tr) endpoint'leri test sırasında erişim engeli verdi ("You do not have permission"). Yahoo Finance kullanılıyor.**

| Veri | Kaynak | Endpoint | Maliyet |
|------|--------|----------|---------|
| BIST 100 | Yahoo Finance | `query1.finance.yahoo.com/v8/finance/chart/XU100.IS` | Ücretsiz |
| BIST 30 | Yahoo Finance | `query1.finance.yahoo.com/v8/finance/chart/XU030.IS` | Ücretsiz |
| THYAO, ASELS, ENJSA, KCHOL | Yahoo Finance | `query1.finance.yahoo.com/v8/finance/chart/{SEMBOL}.IS` | Ücretsiz |
| VOO (S&P 500 ETF) | Yahoo Finance | `query1.finance.yahoo.com/v8/finance/chart/VOO` | Ücretsiz |

**Günlük değişim hesabı:** `(regularMarketPrice - chartPreviousClose) / chartPreviousClose × 100`

### 4.2 Döviz & Altın

| Veri | Kaynak | Endpoint | Maliyet |
|------|--------|----------|---------|
| Dolar/TL, Euro/TL, Sterlin/TL | TCMB (resmi) | `https://www.tcmb.gov.tr/kurlar/today.xml` | Ücretsiz |
| Gram Altın (TRY) | Hesaplanmış | `(Yahoo GC=F fiyatı ÷ 31.1035) × USD/TRY` | Ücretsiz |
| Çeyrek Altın (TRY) | Hesaplanmış | `Gram Altın × 1.75` | — |

**Altın Hesaplama:**
```
Yahoo Finance: GC=F (Altın vadeli - USD/troy oz)
Gram Altın TRY = (GC=F_fiyat / 31.1035) × TCMB_USD_satis
```

**TCMB XML Notu:** Hafta sonu güncellenmez. Cuma kapanış verisi Pazartesi'ye kadar aynı kalır.

### 4.3 X/Twitter Trendleri

Twitter API 2023'te ücretsiz tier'ı kaldırdı. Scraping kullanılıyor:

| Kaynak | URL | Yöntem | Durum |
|--------|-----|--------|-------|
| **Birincil** | `trends24.in/turkey/` | Regex: Twitter arama linkleri | ✅ Çalışıyor, 20 trend |
| **Yedek** | `twtdata.com/twitter-trends/turkey/` | Regex: Twitter/X arama linkleri | Fallback |

**Scraping Yöntemi (regex, cheerio yok):**
```typescript
const matches = html.matchAll(
  /href="(https:\/\/twitter\.com\/search\?q=[^"]+)"[^>]*>([^<]+)<\/a>/g
);
```
Duplicate filtresi + 80 karakter sınırı ile top 20 benzersiz trend alınır.

**Gösterilecek veriler:** Top 20 trend, tıklayınca X'te o arama açılır.

### 4.4 Haberler — RSS Feed'leri

| Kaynak | RSS URL | Kategori |
|--------|---------|----------|
| NTV Gündem | `https://www.ntv.com.tr/gundem.rss` | gündem |
| NTV Ekonomi | `https://www.ntv.com.tr/ekonomi.rss` | ekonomi |
| TRT Haber | `https://www.trthaber.com/sondakika.rss` | gündem |
| Sözcü | `https://www.sozcu.com.tr/rss/tum-haberler.xml` | gündem |

**Parse Stratejisi:** `rss-parser` paketi ile paralel fetch → tarihe göre sırala → son 20 haber.

---

## 5. DASHBOARD TASARIMI

### 5.1 Layout

```
Desktop (≥768px):
┌──────────────┬──────────────┬──────────────┐
│  Borsa Özeti │ Döviz/Altın  │  Portföyüm   │
├──────────────┴──────────────┴──────────────┤
│  X'te Şu An (sol)  │  Son Haberler (sağ)  │
└────────────────────┴──────────────────────┘

Mobil (<768px):
┌────────────────────┐
│     Borsa Özeti    │
├────────────────────┤
│    Döviz / Altın   │
├────────────────────┤
│     Portföyüm      │
├────────────────────┤
│   X'te Şu An      │
├────────────────────┤
│    Son Haberler    │
└────────────────────┘
```

### 5.2 Tasarım Sistemi

- **Background:** `#020817` (slate-950 benzeri), mavi/mor radial gradient glow
- **Kartlar:** Glassmorphism — `backdrop-blur`, `rgba(15,23,42,0.7)` arka plan, ince `slate/8` border
- **Renk sistemi:**
  - Artış: `emerald-400` + `emerald-500/10` pill badge
  - Düşüş: `red-400` + `red-500/10` pill badge
  - Nötr: `slate-400` + `slate-500/10` pill badge
- **Font:** Inter (Google Fonts)
- **Köşe:** `rounded-2xl` (16px)
- **Loading:** Shimmer animasyonlu skeleton kartlar
- **Header:** Sticky, `backdrop-blur-xl`, `#020817/80`

### 5.3 Kartlar

**BorsaCard** — BIST 100 büyük font, BIST 30 ikinci satır. Piyasa açık/kapalı badge.

**DovizCard** — Dolar, Euro, Gram Altın, Çeyrek Altın. Kaynak: TCMB.

**PortfolioCard** — Her hisse için mini logo kutusu + sembol + fiyat + değişim badge.

**TrendsCard** — Sıralı liste, her satır tıklanabilir (X aramasına gider). "𝕏 X'te Şu An" başlığı.

**NewsCard** — Kompakt liste, kaynak renkli badge (NTV mavi, TRT kırmızı, Sözcü turuncu), göreceli zaman (5dk önce).

---

## 6. PROJE DOSYA YAPISI

```
gundem-radar/
├── app/
│   ├── layout.tsx              # Root layout, Inter font, PWA meta, SW kaydı
│   ├── page.tsx                # Ana dashboard (client component, tüm kartlar)
│   ├── globals.css             # Tailwind v4, glassmorphism, shimmer, ticker CSS
│   │
│   └── api/
│       ├── borsa/route.ts      # GET — Yahoo Finance XU100.IS + XU030.IS
│       ├── doviz/route.ts      # GET — TCMB XML + Yahoo GC=F (altın)
│       ├── portfolio/route.ts  # GET — Yahoo Finance .IS hisseleri + VOO
│       ├── trends/route.ts     # GET — trends24.in scraping
│       ├── haberler/route.ts   # GET — RSS feed parse (rss-parser)
│       └── cron/route.ts       # GET/POST — tüm cache güncelle + Telegram alert
│
├── components/
│   ├── BorsaCard.tsx           # BIST 100/30, piyasa durumu badge
│   ├── DovizCard.tsx           # Döviz + altın satırları
│   ├── PortfolioCard.tsx       # Hisse listesi, mini logo kutuları
│   ├── TrendsCard.tsx          # X trendleri, sıralı liste
│   ├── NewsCard.tsx            # Haberler, kaynak badge, göreceli zaman
│   ├── PriceChange.tsx         # Pill badge: ▲+%1.23 veya ▼-0.45%
│   ├── LastUpdated.tsx         # Pulse dot + "5dk önce güncellendi"
│   ├── CardSkeleton.tsx        # Shimmer loading skeleton
│   ├── RefreshButton.tsx       # SWR mutate ile tüm kartları yenile
│   └── ServiceWorkerRegistrar.tsx  # PWA service worker kaydı
│
├── lib/
│   ├── types.ts                # BorsaSummary, DovizData, PortfolioItem, TrendItem, NewsItem
│   ├── utils.ts                # formatNumber, formatRelativeTime, isBorsaOpen, direction
│   ├── redis.ts                # Upstash Redis client (opsiyonel, try-catch sarmalı)
│   └── fetchers/
│       ├── borsa.ts            # Yahoo Finance XU100.IS / XU030.IS
│       ├── doviz.ts            # TCMB XML parse + Yahoo GC=F altın hesabı
│       ├── portfolio.ts        # Yahoo Finance .IS + VOO
│       ├── trends.ts           # trends24.in regex scraper + twtdata fallback
│       └── haberler.ts         # rss-parser ile 4 RSS kaynağı
│
├── public/
│   ├── manifest.json           # PWA manifest
│   ├── sw.js                   # Service Worker (cache-first, API hariç)
│   ├── icon-192.png            # PWA ikon (eklenecek)
│   └── icon-512.png            # PWA ikon (eklenecek)
│
├── vercel.json                 # Cron: "0 7 * * 1-5" (Hobby plan: günde 1)
├── next.config.ts              # Next.js config
├── .env.local                  # Gerçek env vars (git'e commit edilmez)
├── .env.example                # Örnek env (commit edilir)
└── gundem-radar-prd.md         # Bu döküman
```

---

## 7. ENVIRONMENT VARIABLES

```env
# .env.local

# Upstash Redis (OPSİYONEL — olmadan da çalışır, sadece cache olmaz)
# UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
# UPSTASH_REDIS_REST_TOKEN=xxx

# Telegram Bildirimleri (OPSİYONEL)
# TELEGRAM_BOT_TOKEN=xxx          # BotFather'dan alınan token
# TELEGRAM_CHAT_ID=xxx            # Kendi chat ID'n

# Cron Güvenliği (OPSİYONEL ama önerilen)
# CRON_SECRET=gizli-bir-sifre    # /api/cron endpoint'ini yetkisiz çağrılara karşı korur
```

**Vercel'de env vars eklemek için:**
```bash
vercel env add TELEGRAM_BOT_TOKEN
vercel env add TELEGRAM_CHAT_ID
```

---

## 8. TypeScript TİP TANIMLARI

```typescript
// lib/types.ts

interface BorsaSummary {
  bist100: { value: number; change: number; changeAmount: number; direction: Dir; time: string };
  bist30:  { value: number; change: number; changeAmount: number; direction: Dir; time: string };
  updatedAt: string;
}

interface CurrencyItem {
  name: string; buying: number; selling: number; change: number; direction: Dir;
}

interface DovizData {
  dolar: CurrencyItem; euro: CurrencyItem; sterlin: CurrencyItem;
  gramAltin: CurrencyItem; ceyrekAltin: CurrencyItem;
  updatedAt: string;
}

interface PortfolioItem {
  symbol: string; name: string; price: number;
  change: number; direction: Dir; currency: 'TRY' | 'USD';
}

interface TrendItem {
  rank: number; name: string; tweetCount?: number; url?: string;
}

interface TrendsData { trends: TrendItem[]; updatedAt: string; }

interface NewsItem {
  title: string; source: string; url: string;
  publishedAt: string; category?: string;
}

interface NewsData { articles: NewsItem[]; updatedAt: string; }

type Dir = 'up' | 'down' | 'flat';
```

---

## 9. API ROUTE DETAYLARI

### GET /api/borsa

1. Redis'ten `borsa:summary` oku (TTL 900s)
2. Cache miss → Yahoo Finance `XU100.IS` + `XU030.IS` paralel fetch
3. `(price - prevClose) / prevClose × 100` ile değişim hesapla
4. Redis'e yaz (TTL 900s), döndür

### GET /api/doviz

1. Redis'ten `doviz:latest` oku (TTL 900s)
2. Cache miss → TCMB `today.xml` + Yahoo `GC=F` paralel fetch
3. XML'den USD, EUR, GBP regex ile parse et
4. Gram Altın = `(GC=F / 31.1035) × USD_satis`; Çeyrek Altın = `Gram × 1.75`
5. Redis'e yaz, döndür

### GET /api/portfolio

1. Redis'ten `portfolio:latest` oku (TTL 900s)
2. Cache miss → `['THYAO.IS', 'ASELS.IS', 'ENJSA.IS', 'KCHOL.IS', 'VOO']` için Promise.allSettled
3. Başarısız olanlar sonuçtan çıkar (kart hata vermez)
4. Redis'e yaz, döndür

### GET /api/trends

1. Redis'ten `trends:latest` oku (TTL 1800s)
2. Cache miss → `trends24.in/turkey/` fetch
3. Regex ile Twitter arama link'lerini çıkar, top 20 benzersiz trend al
4. Başarısız → `twtdata.com` fallback dene
5. Redis'e yaz, döndür

### GET /api/haberler

1. Redis'ten `news:latest` oku (TTL 3600s)
2. Cache miss → 4 RSS kaynağı `Promise.allSettled` ile paralel çek
3. `rss-parser` ile parse, tarihe göre sırala, top 20
4. Redis'e yaz, döndür

### GET|POST /api/cron

**Güvenlik:** `Authorization: Bearer {CRON_SECRET}` header kontrolü (CRON_SECRET tanımlıysa)

1. Tüm fetcher'ları `Promise.allSettled` ile çalıştır
2. Sonuçları Redis'e yaz
3. Alert kuralları kontrol et:
   - BIST 100 `|change| ≥ 3%` → Telegram mesajı
   - Herhangi hisse `|change| ≥ 5%` → Telegram mesajı
   - Dolar `|change| ≥ 2%` → Telegram mesajı
4. Sonuç JSON döndür

**vercel.json:**
```json
{ "crons": [{ "path": "/api/cron", "schedule": "0 7 * * 1-5" }] }
```
> Hobby plan günde 1 cron hakkı tanır. Her gün 07:00 UTC (10:00 TR saati).
> Gün içi güncelleme frontend SWR tarafından yapılır (5dk interval).

---

## 10. FRONTEND — VERİ ÇEKME STRATEJİSİ

Her kart kendi SWR hook'unu kullanır, birbirinden bağımsız:

```typescript
const { data, error, isLoading } = useSWR<BorsaSummary>('/api/borsa', fetcher, {
  refreshInterval: 5 * 60 * 1000,  // 5 dakikada bir yenile
  revalidateOnFocus: true,          // Sekmeye dönünce yenile
});
```

| Kart | Endpoint | Refresh |
|------|----------|---------|
| BorsaCard | `/api/borsa` | 5 dk |
| DovizCard | `/api/doviz` | 5 dk |
| PortfolioCard | `/api/portfolio` | 5 dk |
| TrendsCard | `/api/trends` | 30 dk |
| NewsCard | `/api/haberler` | 60 dk |

**RefreshButton:** `useSWRConfig().mutate(() => true)` ile tüm key'leri aynı anda revalidate eder.

---

## 11. PWA YAPILANDIRMASI

`public/manifest.json`:
```json
{
  "name": "Gündem Radar", "short_name": "Gündem",
  "start_url": "/", "display": "standalone",
  "background_color": "#0f172a", "theme_color": "#0f172a"
}
```

`public/sw.js`: Cache-first strateji. API route'ları (`/api/*`) cache'lenmez.

`ServiceWorkerRegistrar.tsx`: `useEffect` içinde `navigator.serviceWorker.register('/sw.js')`.

**Ana ekrana eklemek için:** Safari → Paylaş → Ana Ekrana Ekle

---

## 12. TELEGRAM BİLDİRİM

### Bot Kurulumu
1. Telegram'da `@BotFather` → `/newbot` → token al
2. Bot'a bir mesaj at, sonra `api.telegram.org/bot{TOKEN}/getUpdates` ile `chat_id` al
3. `.env.local`'e ekle (veya Vercel dashboard'dan)

### Alert Kuralları
```typescript
const RULES = {
  bist100_pct: 3,    // BIST 100 günlük %3+ hareket
  portfolio_pct: 5,  // Portföydeki herhangi hisse %5+
  dolar_pct: 2,      // Dolar/TL %2+
};
```

### Mesaj Formatı
```
🚨 GÜNDEM RADAR ALERT

📈 BIST 100: 13.827 (+%3.1)
Borsa sert yükseldi!

⏰ 25.05.2026 10:15
```

---

## 13. BAĞIMLILIKLAR

```json
{
  "dependencies": {
    "next": "16.2.6",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "swr": "^2.4.1",
    "@upstash/redis": "^1.38.0",
    "rss-parser": "^3.13.0",
    "cheerio": "^1.2.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/postcss": "^4.0.0",
    "eslint": "^9.0.0",
    "eslint-config-next": "16.2.6"
  }
}
```

---

## 14. ÖNEMLİ NOTLAR VE EDGE CASE'LER

1. **BigPara engeli:** `bigpara.hurriyet.com.tr/api/*` endpoint'leri "permission denied" veriyor. Tüm borsa/hisse verisi Yahoo Finance'a taşındı (`XU100.IS`, `THYAO.IS` vb.).

2. **Yahoo Finance resmi değil:** `query1.finance.yahoo.com` resmi API değil, değişebilir. Alternatif: `query2.finance.yahoo.com` (aynı format, farklı sunucu).

3. **Borsa saatleri:** BIST 10:00-18:00 TR (07:00-15:00 UTC), Pazartesi-Cuma. `isBorsaOpen()` utility fonksiyonu kartlarda "Kapalı" badge'i göstermek için kullanılır. Hafta sonu son kapanış fiyatı gösterilir.

4. **TCMB hafta sonu:** XML Cumartesi-Pazar güncellenmez. Cuma kapanış verisi Pazartesi'ye kadar gösterilir.

5. **Altın değişim yüzdesi:** TCMB XML önceki gün verisini içermiyor. Yahoo `GC=F` üzerinden `chartPreviousClose` kullanılarak hesaplanıyor. USD/TRY kuru sabittir dolayısıyla TRY değişim ≈ USD değişime eşit.

6. **Trends scraping kırılganlığı:** `trends24.in` HTML yapısı değişirse regex bozulabilir. Hata durumunda kart "Trend verisi geçici olarak alınamıyor" gösterir, uygulama çökmez. `twtdata.com` ikinci fallback.

7. **Vercel Hobby limitleri:**
   - Serverless Function timeout: 10 saniye
   - Bandwidth: 100 GB/ay
   - Cron: **günde 1** (Pro'da sınırsız)
   - Redis olmadan her API çağrısı doğrudan kaynak sunucuya gider

8. **Redis opsiyonel:** `getCached`/`setCache` fonksiyonları try-catch sarmalıdır. Env var tanımlı değilse hata fırlatılır ama yakalanır, `null` döner, fetcher direkt çalışır.

9. **Error isolation:** Her kart `Promise.allSettled` / bağımsız SWR hook kullanır. Bir kaynak çökerse diğer kartlar etkilenmez.

---

## 15. DEPLOYMENT

### İlk Deploy
```bash
cd /Users/berkaysarikaya/Projects/gundem-radar
vercel link        # Vercel projesine bağla
vercel --prod      # Production deploy
```

### Sonraki Deploy'lar
GitHub'a push yapıldığında Vercel otomatik preview deploy oluşturur.
Production için:
```bash
git push && vercel --prod
```

### Env Vars (Vercel Dashboard veya CLI)
```bash
vercel env add TELEGRAM_BOT_TOKEN production
vercel env add TELEGRAM_CHAT_ID production
vercel env add UPSTASH_REDIS_REST_URL production
vercel env add UPSTASH_REDIS_REST_TOKEN production
```

---

## 16. GELİŞTİRME FAZLARI — TAMAMLANAN

Tüm fazlar tek oturumda tamamlandı (25.05.2026):

- [x] **FAZ 1** — Next.js 16 kurulumu, Redis client, BorsaCard, DovizCard, responsive layout, Vercel deploy
- [x] **FAZ 2** — PortfolioCard (Yahoo Finance), NewsCard (4 RSS kaynağı), SWR auto-refresh
- [x] **FAZ 3** — TrendsCard (trends24.in scraping, twtdata fallback), 20 trend
- [x] **FAZ 4** — `/api/cron`, Telegram bildirimleri, alert kuralları, Vercel Cron
- [x] **FAZ 5** — PWA manifest, Service Worker, shimmer skeleton, error handling, glassmorphism UI

---

## 17. BACKLOG

- [ ] Kripto para kartı (BTC, ETH — Yahoo Finance: `BTC-USD`)
- [ ] Hava durumu mini kartı (İstanbul — Open-Meteo ücretsiz API)
- [ ] Deprem bilgisi (AFAD veya Kandilli RSS)
- [ ] PWA ikonu tasarla (`public/icon-192.png`, `public/icon-512.png`)
- [ ] Upstash Redis bağlantısı kur (cache iyileştirmesi için)
- [ ] Telegram bot aktif et (TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID)
- [ ] Borsa kapanış özeti (günlük Claude API ile otomatik özet)
- [ ] Haftalık özet Telegram mesajı
- [ ] Tema: açık/koyu mod toggle

---

*Bu döküman uygulamanın gerçek implementasyonunu yansıtır (v1.0 — 25.05.2026).*
*Tüm fazlar tamamlandı. Production: https://gundem-radar.vercel.app*
