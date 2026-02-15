/**
 * Parts Pricing Types - TypeScript type definitions
 */

// Тип источника цен
export type PriceSource = 'autodoc' | 'exist' | 'emex' | 'partsreview' | 'umapi' | 'abcp' | 'autoeuro' | 'estimated';

// Тип доступности
export type Availability = 'in_stock' | 'out_of_stock' | 'to_order';

// Интерфейс записи цены
export interface PriceRecord {
  id: string;
  partId: string;
  article: string;
  brand: string;
  name: string;
  price: number;
  currency: 'RUB' | 'USD' | 'EUR';
  source: PriceSource;
  sourceName: string;
  url: string;
  availability: Availability;
  deliveryDays: number | null;
  scrapedAt: string;
}

// Интерфейс агрегированного ответа о цене
export interface PriceResponse {
  partId: string;
  article: string;
  brand: string;
  hasPrices: boolean;
  totalSources: number;
  inStockSources: number;
  bestPrice: number | null;
  averagePrice: number | null;
  lowestInStock: number | null;
  sources: string[];
  prices: PriceRecord[];
  message?: string;
}

// Интерфейс для запроса цены
export interface PriceRequest {
  article: string;
  brand: string;
  partType?: string;
}

// Интерфейс для оценки ремонта
export interface RepairEstimate {
  totalEstimate: number;
  parts: PartCost[];
  labor: number;
  sources: string[];
}

// Интерфейс стоимости запчасти
export interface PartCost {
  partType: string;
  article: string;
  name: string;
  price: number;
  source: string;
  url: string;
  quantity: number;
}

// Интерфейс для поиска запчасти
export interface PartSearchResult {
  article: string;
  brand: string;
  name: string;
  partTypes: string[];
  imageUrl?: string;
}

// Кэш-ключи
export const CACHE_KEYS = {
  prices: (article: string, brand: string) => `prices:${article}:${brand}`,
  search: (query: string) => `search:${query}`,
  bestPrice: (article: string, brand: string) => `best_price:${article}:${brand}`,
} as const;

// TTL в секундах
export const CACHE_TTL = {
  PRICES: 3600 * 6, // 6 часов
  SEARCH: 3600,     // 1 час
  BEST_PRICE: 3600, // 1 час
} as const;
