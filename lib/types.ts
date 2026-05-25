export interface BorsaSummary {
  bist100: {
    value: number;
    change: number;
    changeAmount: number;
    direction: 'up' | 'down' | 'flat';
    time: string;
  };
  bist30: {
    value: number;
    change: number;
    changeAmount: number;
    direction: 'up' | 'down' | 'flat';
    time: string;
  };
  updatedAt: string;
}

export interface CurrencyItem {
  name: string;
  buying: number;
  selling: number;
  change: number;
  direction: 'up' | 'down' | 'flat';
}

export interface DovizData {
  dolar: CurrencyItem;
  euro: CurrencyItem;
  sterlin: CurrencyItem;
  gramAltin: CurrencyItem;
  ceyrekAltin: CurrencyItem;
  updatedAt: string;
}

export interface PortfolioItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  direction: 'up' | 'down' | 'flat';
  currency: 'TRY' | 'USD';
}

export interface TrendItem {
  rank: number;
  name: string;
  tweetCount?: number;
  url?: string;
}

export interface TrendsData {
  trends: TrendItem[];
  updatedAt: string;
}

export interface NewsItem {
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  category?: string;
}

export interface NewsData {
  articles: NewsItem[];
  updatedAt: string;
}
