/**
 * Price Aggregator Service - Aggregates prices from real APIs only
 * Uses ABCP and AutoEuro APIs
 */

import { PriceRecord, PriceResponse, PriceSource, Availability, CACHE_TTL } from './types';

// Real API sources only
const SOURCES: { id: PriceSource; name: string }[] = [
  { id: 'abcp', name: 'ABCP' },
  { id: 'autoeuro', name: 'AutoEuro' },
];

// Part article mapping (for damage zone to article mapping - not prices)
const PART_ARTICLE_MAP: Record<string, { article: string; name: string }> = {
  'Передний бампер': { article: '51117287350', name: 'Передний бампер' },
  'Задний бампер': { article: '51127387350', name: 'Задний бампер' },
  'Капот': { article: '41637132405', name: 'Капот' },
  'Крышка багажника': { article: '51337487350', name: 'Крышка багажника' },
  'Крыша': { article: '51417387350', name: 'Крыша' },
  'Левое крыло': { article: '51317287350', name: 'Левое крыло' },
  'Правое крыло': { article: '51317287351', name: 'Правое крыло' },
  'Дверь водителя': { article: '51417287350', name: 'Дверь водителя' },
  'Дверь пассажира': { article: '51417287351', name: 'Дверь пассажира' },
  'Задняя дверь': { article: '51427287350', name: 'Задняя дверь' },
  'Лобовое стекло': { article: 'windshield_1', name: 'Лобовое стекло' },
  'Заднее стекло': { article: 'windshield_2', name: 'Заднее стекло' },
  'Боковое стекло': { article: 'windshield_3', name: 'Боковое стекло' },
  'Фара передняя': { article: '63117287350', name: 'Фара передняя' },
  'Фара задняя': { article: '63127287350', name: 'Фара задняя' },
  'Зеркало левое': { article: '51167287350', name: 'Зеркало левое' },
  'Зеркало правое': { article: '51167287351', name: 'Зеркало правое' },
  'Диск колесный': { article: '36116757890', name: 'Диск колесный' },
};

// In-memory cache
const memoryCache: Map<string, { data: PriceResponse; expiresAt: number }> = new Map();

/**
 * Get data from cache
 */
function getCached(key: string): PriceResponse | null {
  const cached = memoryCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }
  memoryCache.delete(key);
  return null;
}

/**
 * Save to cache
 */
function setCached(key: string, data: PriceResponse): void {
  memoryCache.set(key, {
    data,
    expiresAt: Date.now() + CACHE_TTL.PRICES * 1000,
  });
}

/**
 * Fetch prices from real API sources only
 */
async function fetchPricesFromSource(
  source: { id: PriceSource; name: string },
  article: string,
  brand: string
): Promise<PriceRecord[]> {
  // Use real ABCP API
  if (source.id === 'abcp') {
    return fetchAbcpPrice(article, brand);
  }

  // Use real AutoEuro API
  if (source.id === 'autoeuro') {
    return fetchAutoEuroPrice(article, brand);
  }

  // Unknown source - return empty
  return [];
}

/**
 * Get real price from ABCP API
 * API: https://www.abcp.ru/wiki/API:Docs
 * Endpoint: https://abcp84097.public.api.abcp.ru/search/articles/
 */
async function fetchAbcpPrice(article: string, brand: string): Promise<PriceRecord[]> {
  try {
    const login = 'api@abcp84097';
    const passwordMd5 = 'a0e55fd6065dd4c79d2d08258b274b87';
    
    const params = new URLSearchParams({
      userlogin: login,
      userpsw: passwordMd5,
      number: article,
      ...(brand && { brand }),
    });

    const apiUrl = `https://abcp84097.public.api.abcp.ru/search/articles/?${params.toString()}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`ABCP API error: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    
    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }

    // Transform ABCP response to our format
    const records: PriceRecord[] = data.slice(0, 3).map((item: any) => ({
      id: `abcp-${item.articleId || article}-${Date.now()}`,
      partId: article,
      article: item.articleCode || article,
      brand: item.brand || brand,
      name: item.description || article,
      price: item.price || 0,
      currency: 'RUB' as const,
      source: 'abcp' as const,
      sourceName: 'ABCP',
      url: `https://www.abcp.ru/catalog/${item.brand || brand}/${item.articleCode || article}`,
      availability: parseAvailability(item.availability),
      deliveryDays: item.deliveryPeriod || null,
      scrapedAt: new Date().toISOString(),
    }));

    return records;
  } catch (error) {
    console.error('ABCP API error:', error);
    return [];
  }
}

/**
 * Parse ABCP availability status to our format
 */
function parseAvailability(availability: string | number): Availability {
  const val = parseInt(String(availability), 10);
  if (val > 0) return 'in_stock';
  if (val === -1) return 'in_stock';
  if (val === -2) return 'to_order';
  return 'to_order';
}

/**
 * Get real price from AutoEuro API
 * API: https://api.autoeuro.ru/doc/v2
 */
async function fetchAutoEuroPrice(article: string, brand: string): Promise<PriceRecord[]> {
  try {
    const login = 'hU8os9M2V0XlRjkYu5T3m7GiLynqLBmOKe8rq4JsxbPRnhIgN7PEVDwZOsLQ';
    
    // Moscow warehouse delivery key
    const deliveryKey = 'Yxov1KCdAii0deRp3HepSJz8wcxasI6FJzCbgkkDgHbY9hrszkUNTsEuZYBmJUwOEPb2iIb01uSVTJYQWkRv05qrVm4c';
    
    const params = new URLSearchParams({
      brand: brand,
      code: article,
      delivery_key: deliveryKey,
      with_offers: '1',
      with_crosses: '1',
    });

    const apiUrl = `https://api.autoeuro.ru/api/v2/search_items/${login}?${params.toString()}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`AutoEuro API error: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    
    // AutoEuro returns data in DATA field
    if (!data || !data.DATA || !Array.isArray(data.DATA) || data.DATA.length === 0) {
      return [];
    }

    // Filter to exact brand match and get top 3 results
    const exactBrandItems = data.DATA.filter((item: any) => 
      item.brand && item.brand.toLowerCase() === brand.toLowerCase()
    );
    
    const itemsToUse = exactBrandItems.length > 0 ? exactBrandItems : data.DATA;
    
    // Transform AutoEuro response to our format
    const records: PriceRecord[] = itemsToUse.slice(0, 3).map((item: any) => ({
      id: `autoeuro-${item.product_id || article}-${Date.now()}`,
      partId: article,
      article: item.code || article,
      brand: item.brand || brand,
      name: item.name || article,
      price: parseFloat(item.price) || 0,
      currency: 'RUB' as const,
      source: 'autoeuro' as const,
      sourceName: 'AutoEuro',
      url: `https://autoeuro.ru/catalog/${item.brand || brand}/${item.code || article}`,
      availability: parseAutoEuroAvailability(item),
      deliveryDays: parseDeliveryDays(item.delivery_time),
      scrapedAt: new Date().toISOString(),
    }));

    return records;
  } catch (error) {
    console.error('AutoEuro API error:', error);
    return [];
  }
}

/**
 * Parse delivery days from AutoEuro response
 */
function parseDeliveryDays(deliveryTime: string | undefined): number | null {
  if (!deliveryTime) return null;
  try {
    const deliveryDate = new Date(deliveryTime);
    const now = new Date();
    const diffTime = deliveryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  } catch {
    return null;
  }
}

/**
 * Parse AutoEuro availability status
 */
function parseAutoEuroAvailability(item: any): Availability {
  const amount = item.amount || item.stock || 0;
  if (amount > 0) return 'in_stock';
  return 'to_order';
}

/**
 * PriceAggregator - aggregates prices from real APIs only
 */
export class PriceAggregator {
  /**
   * Get full price information for a part
   */
  async getPriceSummary(
    article: string,
    brand: string,
    forceRefresh: boolean = false
  ): Promise<PriceResponse> {
    const cacheKey = `${article}:${brand}`;

    // Check cache
    if (!forceRefresh) {
      const cached = getCached(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Get prices from all sources in parallel
    const results = await Promise.all(
      SOURCES.map(source => fetchPricesFromSource(source, article, brand))
    );

    // Merge results
    const allPrices = results.flat();

    if (allPrices.length === 0) {
      const response: PriceResponse = {
        partId: article,
        article,
        brand,
        hasPrices: false,
        totalSources: 0,
        inStockSources: 0,
        bestPrice: null,
        averagePrice: null,
        lowestInStock: null,
        sources: [],
        prices: [],
        message: 'Цены не найдены',
      };
      setCached(cacheKey, response);
      return response;
    }

    // Calculate statistics
    const inStockPrices = allPrices.filter(p => p.availability === 'in_stock');
    const uniqueSources = [...new Set(allPrices.map(p => p.sourceName))];

    const response: PriceResponse = {
      partId: article,
      article,
      brand,
      hasPrices: true,
      totalSources: allPrices.length,
      inStockSources: inStockPrices.length,
      bestPrice: Math.min(...allPrices.map(p => p.price)),
      averagePrice: Math.round(allPrices.reduce((sum, p) => sum + p.price, 0) / allPrices.length),
      lowestInStock: inStockPrices.length > 0 ? Math.min(...inStockPrices.map(p => p.price)) : null,
      sources: uniqueSources,
      prices: allPrices,
    };

    // Cache result
    setCached(cacheKey, response);

    return response;
  }

  /**
   * Get article by part type/damage zone
   */
  getArticleByPartType(partType: string): { article: string; name: string } | null {
    return PART_ARTICLE_MAP[partType] || null;
  }

  /**
   * Get best (minimum) price
   */
  async getBestPrice(
    article: string,
    brand: string,
    inStockOnly: boolean = true
  ): Promise<PriceRecord | null> {
    const summary = await this.getPriceSummary(article, brand);
    
    if (!summary.hasPrices || summary.prices.length === 0) {
      return null;
    }

    let prices = summary.prices;
    
    if (inStockOnly) {
      prices = prices.filter(p => p.availability === 'in_stock');
    }

    if (prices.length === 0) {
      return null;
    }

    return prices.reduce((best, current) => 
      current.price < best.price ? current : best
    );
  }
}

// Export singleton instance
export const priceAggregator = new PriceAggregator();
