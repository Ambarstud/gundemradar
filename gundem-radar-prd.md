# 🇹🇷 GÜNDEM RADAR — Proje Dökümanı (PRD)

> **Türkiye gündemini tek ekrandan takip eden kişisel dashboard uygulaması.**
> Vercel üzerinde deploy edilecek, tamamen ücretsiz altyapı ile çalışacak.

---

## 1. PROJE ÖZETİ

**Gündem Radar**, Türkiye'deki güncel gelişmeleri — haberler, Twitter/X trendleri, borsa, döviz ve altın — tek bir dashboard üzerinden takip etmeyi sağlayan kişisel bir web uygulamasıdır.

| Alan | Detay |
|------|-------|
| **Proje sahibi** | Berkay |
| **Kullanım** | Kişisel (tek kullanıcı) |
| **Platform** | Web (responsive, mobil uyumlu) + PWA + Telegram bildirim |
| **Tech stack** | Next.js 14+ (App Router), TypeScript, Tailwind CSS |
| **Deployment** | Vercel (Hobby plan — ücretsiz) |
| **Veritabanı** | Upstash Redis (ücretsiz tier, cache amaçlı) |
| **Bütçe** | $0 — tamamen ücretsiz servisler kullanılacak |

---

## 2. KULLANICI HİKAYELERİ

1. **Gündem Özeti:** Kullanıcı uygulamayı açtığında, Türkiye gündeminin tek ekranlık bir özetini görür.
2. **Borsa Durumu:** "Borsa bugün artıda mı ekside mi?", "Dolar ne kadar?", "Altın düştü mü?" sorularına tek bakışta cevap alır.
3. **Twitter Trendleri:** Türkiye'de şu an neyin konuşulduğunu, en popüler 10 trendi görür.
4. **Haber Takibi:** Son dakika ve önemli haberleri kategoriye göre takip eder.
5. **Portföy Takibi:** Kendi hisselerinin (THYAO, ASELS, ENJSA, KCHOL) ve VOO ETF'inin anlık durumunu görür.
6. **Bildirim:** Önemli gelişmelerde (borsa %3+ hareket, önemli haber) Telegram'dan bildirim alır.
7. **Mobil Erişim:** Telefonunun ana ekranına ekleyerek (PWA) hızlıca açar.

---

## 3. TEKNİK MİMARİ

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND                          │
│         Next.js 14 + Tailwind CSS + TypeScript       │
│                                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐ │
│  │ Twitter  │ │  Borsa   │ │ Haberler │ │Portföy  │ │
│  │ Trendler │ │Döviz/Alt.│ │          │ │         │ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬────┘ │
│       │            │            │             │      │
├───────┼────────────┼────────────┼─────────────┼──────┤
│       ▼            ▼            ▼             ▼      │
│              NEXT.JS API ROUTES                      │
│           /api/trends                                │
│           /api/borsa                                 │
│           /api/haberler                              │
│           /api/portfolio                             │
│                                                      │
├──────────────────────────────────────────────────────┤
│              VERCEL CRON JOBS                        │
│     Her 15 dk → borsa/döviz güncelle                 │
│     Her 30 dk → trendleri güncelle                   │
│     Her 1 saat → haberleri güncelle                  │
│     Tetiklenince → Telegram bildirim                 │
│                                                      │
├──────────────────────────────────────────────────────┤
│              UPSTASH REDIS (Cache)                   │
│     trends:latest    → Twitter trend verisi          │
│     borsa:summary    → BIST özet verisi              │
│     doviz:latest     → Döviz/altın kurları           │
│     news:latest      → Son haberler                  │
│     portfolio:latest → Portföy durumu                │
└──────────────────────────────────────────────────────┘
```

### 3.1 Neden Bu Mimari?

- **Next.js API Routes**: Vercel'de sunucu tarafında çalışır. Dış API'lere istek atar, veriyi işler, frontend'e temiz JSON döner. Böylece API key'ler gizli kalır, CORS sorunları olmaz.
- **Upstash Redis**: Vercel ile entegre, ücretsiz tier günde 10.000 istek. Cache olarak kullanılır — her seferinde dış API'ye gitmek yerine Redis'ten okur, cron job ile periyodik günceller.
- **Vercel Cron**: `vercel.json` dosyasında tanımlanan zamanlı görevler. Ücretsiz planda günde 1 cron çalışır, Hobby planda (ücretsiz ama kredi kartı gerekir) daha sık çalışır.

---

## 4. VERİ KAYNAKLARI

### 4.1 Borsa / Döviz / Altın

| Veri | Kaynak | Endpoint | Maliyet |
|------|--------|----------|---------|
| BIST 100 özet | BigPara (Hürriyet) | `bigpara.hurriyet.com.tr/api/v1/borsa/hisseyuzeysel/{SEMBOL}` | Ücretsiz, API key yok |
| Hisse listesi | BigPara | `bigpara.hurriyet.com.tr/api/v1/hisse/list` | Ücretsiz |
| BIST Endeksler | Foreks/ParaGaranti | `web-paragaranti-pubsub.foreks.com/web-services/securities/exchanges/BIST/groups/E` | Ücretsiz |
| Döviz kurları | TCMB | `tcmb.gov.tr/kurlar/today.xml` | Ücretsiz, resmi |
| Altın fiyatları | BigPara veya CollectAPI | Çeşitli endpoint'ler | Ücretsiz |
| VOO (S&P 500 ETF) | Yahoo Finance | `query1.finance.yahoo.com/v8/finance/chart/VOO` | Ücretsiz |

**Önemli Not:** BigPara endpoint'leri resmi bir API değil, Hürriyet'in kendi mobil uygulaması için kullandığı public endpoint'ler. Rate limiting yapabilirler. Bu yüzden her istekte değil, cron ile cache'leyerek kullanıyoruz.

**Gösterilecek veriler:**
- BIST 100 endeksi: son değer, günlük değişim yüzdesi, artı/eksi durumu
- Dolar/TL, Euro/TL: alış-satış, günlük değişim
- Gram altın, çeyrek altın: güncel fiyat, değişim
- Kullanıcı portföyü: THYAO, ASELS, ENJSA, KCHOL, VOO — her birinin fiyatı ve günlük değişimi

### 4.2 Twitter/X Trendleri

Twitter API ücretsiz tier'ı 2023'te kaldırıldı. Alternatif yöntemler:

| Yöntem | Kaynak | Detay |
|--------|--------|-------|
| **Birincil** | Scraping: `twtdata.com/twitter-trends/turkey/` veya `twitter-trending.com/turkey` | HTML'den trend listesini parse et |
| **Yedek** | Apify Twitter Trends Scraper | Ücretsiz tier'da sınırlı (aylık belirli kredi) |
| **Yedek 2** | Google Trends API (resmi olmayan) | `trends.google.com` TR verisini çek |

**Scraping Stratejisi:**
1. Vercel Cron → API Route tetiklenir
2. API Route, `twtdata.com/twitter-trends/turkey/` sayfasını fetch eder
3. HTML'den trend adı ve tweet volume bilgisi parse edilir (regex veya cheerio ile)
4. Sonuç Redis'e yazılır
5. Frontend Redis'ten okur

**Gösterilecek veriler:**
- Top 10 trend konusu
- Her trendin tweet hacmi (varsa)
- Trend olma süresi (varsa)

### 4.3 Haberler

| Kaynak | Endpoint | Detay |
|--------|----------|-------|
| **Birincil: RSS Feed'ler** | NTV, CNN Türk, Sözcü, TRT Haber | Ücretsiz, sınırsız, güvenilir |
| **Yedek: NewsAPI** | `newsapi.org/v2/top-headlines?country=tr` | Ücretsiz: 100 istek/gün (development only) |
| **Yedek 2: MediaStack** | `api.mediastack.com/v1/news?countries=tr` | Ücretsiz: 100 istek/ay |

**RSS Feed URL'leri:**
```
NTV Gündem:    https://www.ntv.com.tr/gundem.rss
NTV Ekonomi:   https://www.ntv.com.tr/ekonomi.rss
CNN Türk:      https://www.cnnturk.com/feed/rss/all/news
TRT Haber:     https://www.trthaber.com/sondakika.rss
Sözcü:         https://www.sozcu.com.tr/rss/tum-haberler.xml
```

**RSS Parse Stratejisi:**
1. `rss-parser` npm paketi ile RSS XML → JSON dönüşümü
2. Birden fazla kaynaktan haberleri çek
3. Tarihe göre sırala, son 20 haberi al
4. Redis'e yaz

**Gösterilecek veriler:**
- Son 15-20 haber başlığı
- Kaynak adı ve zamanı
- Habere tıklayınca orijinal kaynağa yönlendirme

---

## 5. MODÜLLER VE DASHBOARD TASARIMI

Dashboard tek sayfalık bir layout. Mobilde kartlar alt alta, desktop'ta grid şeklinde.

### 5.1 Kart: Borsa Özeti
```
┌────────────────────────────────┐
│ 📈 BORSA ÖZETİ                │
│                                │
│ BIST 100   10.234   ▲ +%1.2   │
│ BIST 30     5.678   ▲ +%0.8   │
│                                │
│ Son güncelleme: 14:35          │
└────────────────────────────────┘
```

### 5.2 Kart: Döviz & Altın
```
┌────────────────────────────────┐
│ 💰 DÖVİZ & ALTIN              │
│                                │
│ Dolar    38.42 TL   ▼ -%0.3   │
│ Euro     42.15 TL   ▲ +%0.1   │
│ Gr.Altın  3.245 TL  ▲ +%0.5   │
│ Çy.Altın  5.320 TL  ▲ +%0.4   │
│                                │
│ Kaynak: TCMB / Son: 14:35     │
└────────────────────────────────┘
```

### 5.3 Kart: Portföyüm
```
┌────────────────────────────────┐
│ 💼 PORTFÖYÜM                  │
│                                │
│ THYAO    312.40 TL  ▲ +%2.1   │
│ ASELS    178.60 TL  ▼ -%0.5   │
│ ENJSA     48.90 TL  ▲ +%1.3   │
│ KCHOL    215.80 TL  ▲ +%0.7   │
│ VOO     $542.30     ▼ -%0.2   │
│                                │
│ Son: 14:35                     │
└────────────────────────────────┘
```

### 5.4 Kart: Twitter/X Trendleri
```
┌────────────────────────────────┐
│ 🔥 TÜRKİYE TREND              │
│                                │
│ 1. #GalatasaraySK    125K tw   │
│ 2. Erdoğan            89K tw   │
│ 3. #dolar              67K tw   │
│ 4. ...                         │
│ ...                            │
│ 10. ...                        │
│                                │
│ Son: 14:00                     │
└────────────────────────────────┘
```

### 5.5 Kart: Son Haberler
```
┌────────────────────────────────┐
│ 📰 SON HABERLER                │
│                                │
│ • Başlık 1...          NTV 5dk │
│ • Başlık 2...      CNN Türk 12dk│
│ • Başlık 3...          TRT 18dk│
│ • Başlık 4...        Sözcü 25dk│
│ • ...                          │
│                                │
│ Tümünü gör →                   │
└────────────────────────────────┘
```

---

## 6. PROJE DOSYA YAPISI

```
gundem-radar/
├── app/
│   ├── layout.tsx              # Root layout, font, meta tags
│   ├── page.tsx                # Ana dashboard sayfası
│   ├── globals.css             # Tailwind base + custom styles
│   │
│   └── api/                    # API Routes (sunucu tarafı)
│       ├── borsa/
│       │   └── route.ts        # BIST endeks + özet veri
│       ├── doviz/
│       │   └── route.ts        # Döviz kurları + altın
│       ├── portfolio/
│       │   └── route.ts        # Kullanıcı portföy hisseleri
│       ├── trends/
│       │   └── route.ts        # Twitter/X trendleri
│       ├── haberler/
│       │   └── route.ts        # RSS haber akışı
│       └── cron/
│           └── route.ts        # Cron job handler (tüm verileri güncelle)
│
├── components/
│   ├── Dashboard.tsx           # Ana dashboard grid layout
│   ├── BorsaCard.tsx           # Borsa özet kartı
│   ├── DovizCard.tsx           # Döviz & altın kartı
│   ├── PortfolioCard.tsx       # Portföy kartı
│   ├── TrendsCard.tsx          # Twitter trendleri kartı
│   ├── NewsCard.tsx            # Haberler kartı
│   ├── PriceChange.tsx         # Fiyat değişim göstergesi (▲▼ + renk)
│   ├── LastUpdated.tsx         # "Son güncelleme" etiketi
│   └── RefreshButton.tsx       # Manuel yenileme butonu
│
├── lib/
│   ├── redis.ts                # Upstash Redis client
│   ├── fetchers/
│   │   ├── borsa.ts            # BigPara API fetcher
│   │   ├── doviz.ts            # TCMB + döviz fetcher
│   │   ├── altin.ts            # Altın fiyatları fetcher
│   │   ├── portfolio.ts        # Hisse + VOO fetcher
│   │   ├── trends.ts           # Twitter trend scraper
│   │   └── haberler.ts         # RSS parser
│   ├── types.ts                # TypeScript tipleri
│   └── utils.ts                # Yardımcı fonksiyonlar (format, tarih vs.)
│
├── public/
│   ├── manifest.json           # PWA manifest
│   ├── sw.js                   # Service Worker (PWA)
│   ├── icon-192.png            # PWA ikon
│   └── icon-512.png            # PWA ikon
│
├── vercel.json                 # Cron job tanımları
├── next.config.js              # Next.js config
├── tailwind.config.ts          # Tailwind config
├── tsconfig.json               # TypeScript config
├── package.json
├── .env.local                  # Environment variables (API key'ler)
└── .env.example                # Örnek env dosyası
```

---

## 7. ENVIRONMENT VARIABLES

```env
# .env.local

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx

# Haber API'leri (opsiyonel, RSS birincil)
NEWSAPI_KEY=xxx                 # newsapi.org ücretsiz key

# Telegram Bot (Faz 4)
TELEGRAM_BOT_TOKEN=xxx
TELEGRAM_CHAT_ID=xxx

# Cron güvenliği
CRON_SECRET=xxx                 # Cron endpoint'ini korumak için secret key
```

---

## 8. TypeScript TİP TANIMLARI

```typescript
// lib/types.ts

// Borsa
interface BorsaSummary {
  bist100: {
    value: number;
    change: number;        // yüzde değişim
    changeAmount: number;  // TL değişim
    direction: 'up' | 'down' | 'flat';
    time: string;          // son güncelleme saati
  };
  bist30: {
    value: number;
    change: number;
    direction: 'up' | 'down' | 'flat';
    time: string;
  };
}

// Döviz & Altın
interface DovizData {
  dolar: CurrencyItem;
  euro: CurrencyItem;
  sterlin: CurrencyItem;
  gramAltin: CurrencyItem;
  ceyrekAltin: CurrencyItem;
  updatedAt: string;
}

interface CurrencyItem {
  name: string;
  buying: number;    // alış
  selling: number;   // satış
  change: number;    // yüzde değişim
  direction: 'up' | 'down' | 'flat';
}

// Portföy
interface PortfolioItem {
  symbol: string;       // THYAO, ASELS, vs.
  name: string;         // Türk Hava Yolları
  price: number;
  change: number;       // yüzde
  direction: 'up' | 'down' | 'flat';
  currency: 'TRY' | 'USD';
}

type Portfolio = PortfolioItem[];

// Twitter Trendleri
interface TrendItem {
  rank: number;
  name: string;         // hashtag veya konu
  tweetCount?: number;  // tweet sayısı (varsa)
  url?: string;         // Twitter arama linki
}

interface TrendsData {
  trends: TrendItem[];
  updatedAt: string;
}

// Haberler
interface NewsItem {
  title: string;
  source: string;       // NTV, CNN Türk, vs.
  url: string;
  publishedAt: string;  // ISO tarih
  category?: string;    // gündem, ekonomi, spor
}

interface NewsData {
  articles: NewsItem[];
  updatedAt: string;
}

// Dashboard'un tüm verisi
interface DashboardData {
  borsa: BorsaSummary;
  doviz: DovizData;
  portfolio: Portfolio;
  trends: TrendsData;
  news: NewsData;
  lastFullUpdate: string;
}
```

---

## 9. API ROUTE DETAYLARI

### 9.1 GET /api/borsa

**İş akışı:**
1. Redis'ten `borsa:summary` key'ini oku
2. Eğer cache varsa ve 15 dakikadan yeni ise → direkt döndür
3. Eğer cache yoksa veya eskiyse:
   - BigPara API'den BIST 100 ve BIST 30 verisini çek
   - Parse et, `BorsaSummary` formatına dönüştür
   - Redis'e yaz (TTL: 900 saniye = 15 dakika)
   - Döndür

**BigPara Endpoint:**
```
GET http://bigpara.hurriyet.com.tr/api/v1/hisse/list
```
Response: Hisse listesi JSON (tüm BIST hisseleri)

### 9.2 GET /api/doviz

**İş akışı:**
1. Redis'ten `doviz:latest` oku
2. Cache kontrol (15 dk)
3. Yoksa → TCMB XML + BigPara altın verisi çek
4. Parse, kaydet, döndür

**TCMB Endpoint:**
```
GET https://www.tcmb.gov.tr/kurlar/today.xml
```
Response: XML formatında döviz kurları

### 9.3 GET /api/portfolio

**İş akışı:**
1. Sabit tanımlı semboller: `['THYAO', 'ASELS', 'ENJSA', 'KCHOL']`
2. Her sembol için BigPara'dan detay çek
3. VOO için Yahoo Finance'ten çek
4. Birleştir, döndür

**Sabit portföy tanımı (kod içinde, env'de değil):**
```typescript
const MY_STOCKS = ['THYAO', 'ASELS', 'ENJSA', 'KCHOL'];
const MY_ETFS = [{ symbol: 'VOO', source: 'yahoo' }];
```

### 9.4 GET /api/trends

**İş akışı:**
1. Redis'ten `trends:latest` oku
2. Cache kontrol (30 dk)
3. Yoksa → `twtdata.com/twitter-trends/turkey/` sayfasını fetch et
4. HTML'den trend bilgilerini cheerio ile parse et
5. Top 10 trendi al, kaydet, döndür

**Fallback:** Parse başarısız olursa, Google Trends Türkiye verisini dene.

### 9.5 GET /api/haberler

**İş akışı:**
1. Redis'ten `news:latest` oku
2. Cache kontrol (1 saat)
3. Yoksa → RSS feed'leri paralel olarak çek (Promise.all)
4. `rss-parser` ile parse et
5. Tüm haberleri birleştir, tarihe göre sırala, son 20'yi al
6. Kaydet, döndür

### 9.6 POST /api/cron

**Güvenlik:** `CRON_SECRET` header kontrolü

**İş akışı:**
1. Header'da `Authorization: Bearer {CRON_SECRET}` kontrol et
2. Tüm veri kaynaklarını paralel güncelle
3. Eğer önemli bir değişiklik varsa (BIST %3+ hareket gibi) → Telegram bildirim gönder
4. Sonuçları döndür

**vercel.json cron tanımı:**
```json
{
  "crons": [
    {
      "path": "/api/cron",
      "schedule": "*/15 9-18 * * 1-5"
    }
  ]
}
```
Bu cron: Pazartesi-Cuma, 09:00-18:00 arası, her 15 dakikada çalışır (borsa saatleri).

---

## 10. FRONTEND DETAYLARI

### 10.1 Dashboard Layout

```tsx
// app/page.tsx — Ana Sayfa
// Tüm kartları yan yana (desktop) veya alt alta (mobil) gösterir.
// Veri çekme: Her kart kendi verisini client-side fetch ile alır (SWR veya React Query).
// Auto-refresh: Her 5 dakikada otomatik yenile.
// Manuel refresh: Sağ üstte yenile butonu.
```

**Desktop Layout (grid):**
```
┌──────────────┬──────────────┬──────────────┐
│  Borsa Özeti │ Döviz/Altın  │  Portföyüm   │
│              │              │              │
├──────────────┴──────────────┴──────────────┤
│           Twitter/X Trendleri              │
├────────────────────────────────────────────┤
│              Son Haberler                  │
└────────────────────────────────────────────┘
```

**Mobil Layout:** Tüm kartlar tek sütun, alt alta.

### 10.2 Stil Kılavuzu

- **Renk paleti:** Koyu tema (dark mode default) — göz yormayan, haber/finans uygulaması hissi
  - Background: `#0f172a` (slate-900)
  - Card background: `#1e293b` (slate-800)
  - Text: `#f1f5f9` (slate-100)
  - Accent yeşil (artış): `#22c55e` (green-500)
  - Accent kırmızı (düşüş): `#ef4444` (red-500)
  - Accent mavi (nötr/link): `#3b82f6` (blue-500)
- **Font:** `Inter` veya sistem fontu
- **Border radius:** `rounded-xl` (12px)
- **Kart gölge:** `shadow-lg` hafif glow efekti

### 10.3 Veri Çekme Stratejisi (Frontend)

```typescript
// SWR kullanımı — otomatik yenileme ve cache
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

// Her kart kendi hook'unu kullanır:
function useBorsa() {
  return useSWR<BorsaSummary>('/api/borsa', fetcher, {
    refreshInterval: 5 * 60 * 1000, // 5 dakikada bir yenile
    revalidateOnFocus: true,         // Sekmeye dönünce yenile
  });
}
```

---

## 11. PWA YAPILANDIRMASI

### 11.1 manifest.json
```json
{
  "name": "Gündem Radar",
  "short_name": "Gündem",
  "description": "Türkiye gündem takip paneli",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0f172a",
  "theme_color": "#0f172a",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### 11.2 Service Worker
Basit cache-first stratejisi. Offline'da son cache'li veriyi göster.

---

## 12. TELEGRAM BİLDİRİM (FAZ 4)

### 12.1 Bot Kurulumu
1. BotFather'dan yeni bot oluştur → token al
2. Kendine mesaj at → chat_id'yi al
3. `.env.local`'e ekle

### 12.2 Bildirim Kuralları
```typescript
// Tetikleyiciler:
const ALERT_RULES = {
  bist100_change: 3,     // BIST 100 %3+ hareket ederse bildir
  portfolio_change: 5,    // Portföydeki bir hisse %5+ hareket ederse
  dolar_change: 2,        // Dolar %2+ hareket ederse
};
```

### 12.3 Mesaj Formatı
```
🚨 GÜNDEM RADAR ALERT

📈 BIST 100: 10.234 (+%3.5)
Borsa bugün sert yükseldi!

⏰ 25.05.2026 14:35
```

---

## 13. GELİŞTİRME FAZLARI

### FAZ 1 — Temel Altyapı + Borsa/Döviz (1-2 gün)
- [x] Next.js projesi oluştur (App Router, TypeScript, Tailwind)
- [x] Upstash Redis bağlantısı kur
- [x] `/api/borsa` route — BigPara'dan BIST verisi çek
- [x] `/api/doviz` route — TCMB + altın verisi çek
- [x] `BorsaCard` ve `DovizCard` komponentleri
- [x] Dashboard layout (responsive grid)
- [x] Vercel'e deploy et

### FAZ 2 — Haberler + Portföy (1 gün)
- [ ] `/api/haberler` route — RSS parse
- [ ] `/api/portfolio` route — BigPara + Yahoo Finance
- [ ] `NewsCard` ve `PortfolioCard` komponentleri
- [ ] Auto-refresh (SWR)

### FAZ 3 — Twitter Trendleri (1 gün)
- [ ] `/api/trends` route — trend scraping
- [ ] `TrendsCard` komponenti
- [ ] Fallback mekanizması (scraping başarısız olursa)

### FAZ 4 — Bildirim + Cron (1 gün)
- [ ] Vercel Cron job kurulumu
- [ ] Telegram bot entegrasyonu
- [ ] Alert kuralları tanımla
- [ ] `/api/cron` route

### FAZ 5 — PWA + Polish (1 gün)
- [ ] PWA manifest + service worker
- [ ] Uygulama ikonu tasarla
- [ ] Offline fallback
- [ ] Loading skeleton'lar
- [ ] Error handling iyileştirmeleri
- [ ] Son test ve production deploy

---

## 14. BAĞIMLILIKLAR (package.json)

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "swr": "^2.0.0",
    "@upstash/redis": "^1.28.0",
    "rss-parser": "^3.13.0",
    "cheerio": "^1.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.0.0",
    "postcss": "^8.0.0"
  }
}
```

---

## 15. ÖNEMLİ NOTLAR VE EDGE CASE'LER

1. **Borsa saatleri:** BIST 10:00-18:00 arası açık (Pazartesi-Cuma). Hafta sonu ve tatillerde son kapanış verisi gösterilecek. Kart üzerinde "Borsa kapalı — son kapanış verisi" uyarısı göster.

2. **Rate limiting:** BigPara endpoint'leri ticari API değil. Agresif istek atma. Cache kullan, minimum 15 dakikada bir güncelle.

3. **Scraping kırılganlığı:** Twitter trend scraping'i site yapısı değişirse bozulabilir. Cheerio selector'lerini esnek tut. Hata durumunda "Trend verisi geçici olarak kullanılamıyor" mesajı göster, uygulamayı çökertme.

4. **TCMB XML:** Hafta sonu güncellenmiyor. Cuma kapanış verisi Pazartesi'ye kadar aynı kalır.

5. **VOO verisi:** Yahoo Finance API resmi değil, değişebilir. `yfinance` Python paketi yerine direkt endpoint kullan. Alternatif: `query1.finance.yahoo.com/v8/finance/chart/VOO`

6. **Vercel Hobby plan limitleri:**
   - Serverless Function: 10 saniye timeout
   - Bandwidth: 100 GB/ay
   - Cron: günde 2 cron çalışma (Hobby), Pro'da sınırsız
   - Edge Function: ücretsiz

7. **Hata yönetimi:** Her API route'ta try-catch. Bir kaynak çökerse diğerleri etkilenmemeli. Frontend'de her kart bağımsız loading/error state'e sahip olmalı.

8. **Dil:** Arayüz tamamen Türkçe.

---

## 16. GELECEK FİKİRLER (BACKLOG)

- [ ] Kripto para kartı (BTC, ETH)
- [ ] Hava durumu mini kartı (İstanbul)
- [ ] Deprem bilgisi (AFAD API)
- [ ] Borsa kapanış özeti (günlük AI-generated)
- [ ] Haftalık özet Telegram mesajı
- [ ] Tema değiştirme (açık/koyu mod)
- [ ] Widget desteği (kart sıralamasını değiştir)

---

*Bu döküman, AI ajanlarının (Claude Code, Cursor, Copilot vs.) projeyi baştan sona inşa etmesi için yeterli bilgiyi içerir. Her faz bağımsız olarak tamamlanabilir. Faz 1'den başlayın.*
