/**
 * Price Aggregator Service - Aggregates prices from multiple sources
 */

import { PriceRecord, PriceResponse, PriceSource, Availability, CACHE_TTL } from './types';

// Источники цен
const SOURCES: { id: PriceSource; name: string; baseUrl: string }[] = [
  { id: 'autodoc', name: 'AutoDoc', baseUrl: 'https://autodoc.ru' },
  { id: 'exist', name: 'Exist.ru', baseUrl: 'https://exist.ru' },
  { id: 'emex', name: 'Emex', baseUrl: 'https://emex.ru' },
  { id: 'partsreview', name: 'PartsReview', baseUrl: 'https://partsreview.ru' },
];

// Простая база данных артикулов запчастей для разных типов кузова
const PARTS_DATABASE: Record<string, { article: string; name: string; basePrice: number }> = {
  'Передний бампер': { article: '51117287350', name: 'Передний бампер', basePrice: 25000 },
  'Задний бампер': { article: '51127387350', name: 'Задний бампер', basePrice: 22000 },
  'Капот': { article: '41637132405', name: 'Капот', basePrice: 35000 },
  'Крышка багажника': { article: '51337487350', name: 'Крышка багажника', basePrice: 28000 },
  'Крыша': { article: '51417387350', name: 'Крыша', basePrice: 45000 },
  'Левое крыло': { article: '51317287350', name: 'Левое крыло', basePrice: 18000 },
  'Правое крыло': { article: '51317287351', name: 'Правое крыло', basePrice: 18000 },
  'Дверь водителя': { article: '51417287350', name: 'Дверь водителя', basePrice: 22000 },
  'Дверь пассажира': { article: '51417287351', name: 'Дверь пассажира', basePrice: 22000 },
  'Задняя дверь': { article: '51427287350', name: 'Задняя дверь', basePrice: 20000 },
  'Лобовое стекло': { article: ' windshield_1', name: 'Лобовое стекло', basePrice: 15000 },
  'Заднее стекло': { article: ' windshield_2', name: 'Заднее стекло', basePrice: 12000 },
  'Боковое стекло': { article: 'windshield_3', name: 'Боковое стекло', basePrice: 8000 },
  'Фара передняя': { article: '63117287350', name: 'Фара передняя', basePrice: 25000 },
  'Фара задняя': { article: '63127287350', name: 'Фара задняя', basePrice: 18000 },
  'Зеркало левое': { article: '51167287350', name: 'Зеркало левое', basePrice: 12000 },
  'Зеркало правое': { article: '51167287351', name: 'Зеркало правое', basePrice: 12000 },
  'Диск колесный': { article: '36116757890', name: 'Диск колесный', basePrice: 15000 },
};

// Кэш в памяти
const memoryCache: Map<string, { data: PriceResponse; expiresAt: number }> = new Map();

/**
 * Получить данные из кэша
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
 * Сохранить в кэш
 */
function setCached(key: string, data: PriceResponse): void {
  memoryCache.set(key, {
    data,
    expiresAt: Date.now() + CACHE_TTL.PRICES * 1000,
  });
}

/**
 * Симуляция получения цен от разных источников
 * В реальном приложении здесь был бы API-запрос к парсерам
 */
async function fetchPricesFromSource(
  source: { id: PriceSource; name: string; baseUrl: string },
  article: string,
  brand: string
): Promise<PriceRecord[]> {
  // Симуляция задержки API
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

  const partInfo = Object.values(PARTS_DATABASE).find(p => p.article === article);
  const basePrice = partInfo?.basePrice || 20000;

  // Добавляем вариативность цены для каждого источника
  const variance = 0.85 + Math.random() * 0.3; // 85-115%
  const price = Math.round(basePrice * variance);

  const inStock = Math.random() > 0.2; // 80% вероятность в наличии

  const record: PriceRecord = {
    id: `${source.id}-${article}-${Date.now()}`,
    partId: article,
    article,
    brand,
    name: partInfo?.name || article,
    price,
    currency: 'RUB',
    source: source.id,
    sourceName: source.name,
    url: `${source.baseUrl}/catalog/${article}`,
    availability: inStock ? 'in_stock' : 'to_order',
    deliveryDays: inStock ? Math.floor(Math.random() * 3) + 1 : Math.floor(Math.random() * 7) + 3,
    scrapedAt: new Date().toISOString(),
  };

  return [record];
}

/**
 * PriceAggregator - агрегирует цены от нескольких источников
 */
export class PriceAggregator {
  /**
   * Получить полную информацию о ценах для запчасти
   */
  async getPriceSummary(
    article: string,
    brand: string,
    forceRefresh: boolean = false
  ): Promise<PriceResponse> {
    const cacheKey = `${article}:${brand}`;

    // Проверяем кэш
    if (!forceRefresh) {
      const cached = getCached(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Получаем цены от всех источников параллельно
    const results = await Promise.all(
      SOURCES.map(source => fetchPricesFromSource(source, article, brand))
    );

    // Объединяем результаты
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

    // Вычисляем статистику
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

    // Кэшируем результат
    setCached(cacheKey, response);

    return response;
  }

  /**
   * Получить лучшую цену (минимальную)
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

  /**
   * Поиск артикула по типу запчасти
   */
  getArticleByPartType(partType: string): { article: string; name: string; basePrice: number } | null {
    return PARTS_DATABASE[partType] || null;
  }

  /**
   * Получить все доступные типы запчастей
   */
  getAvailablePartTypes(): string[] {
    return Object.keys(PARTS_DATABASE);
  }
}

// Экспортируем экземпляр агрегатора
export const priceAggregator = new PriceAggregator();
