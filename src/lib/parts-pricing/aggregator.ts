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
  { id: 'abcp', name: 'ABCP', baseUrl: 'https://www.abcp.ru' },
  { id: 'autoeuro', name: 'AutoEuro', baseUrl: 'https://api.autoeuro.ru' },
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
  // Для ABCP используем реальный API
  if (source.id === 'abcp') {
    return fetchAbcpPrice(article, brand);
  }

  // Для AutoEuro используем реальный API
  if (source.id === 'autoeuro') {
    return fetchAutoEuroPrice(article, brand);
  }

  // Для остальных источников - симуляция
  // Симуляция задержки API
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

  const partInfo = Object.values(PARTS_DATABASE).find(p => p.article === article);
  const basePrice = partInfo?.basePrice || 20000;
  const brandMultiplier = getBrandMultiplier(brand);

  // Добавляем вариативность цены для каждого источника
  const variance = 0.85 + Math.random() * 0.3; // 85-115%
  const price = Math.round(basePrice * variance * brandMultiplier);

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
 * Получение реальной цены от ABCP API
 * API: https://www.abcp.ru/wiki/API:Docs
 * Endpoint: https://abcp84097.public.api.abcp.ru/search/articles/
 */
async function fetchAbcpPrice(article: string, brand: string): Promise<PriceRecord[]> {
  try {
    // ABCP API требует авторизацию через userlogin и userpsw (md5 хеш пароля)
    const login = 'api@abcp84097';
    const passwordMd5 = 'a0e55fd6065dd4c79d2d08258b274b87'; // Уже MD5
    
    const params = new URLSearchParams({
      userlogin: login,
      userpsw: passwordMd5,
      number: article,
      ...(brand && { brand }),
    });

    // Используем боевой API ABCP
    const apiUrl = `https://abcp84097.public.api.abcp.ru/search/articles/?${params.toString()}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`ABCP API error: ${response.status} ${response.statusText}`);
      return getSimulatedAbcpPrice(article, brand);
    }

    const data = await response.json();
    
    if (!Array.isArray(data) || data.length === 0) {
      return getSimulatedAbcpPrice(article, brand);
    }

    // Преобразуем ответ ABCP в наш формат
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
    return getSimulatedAbcpPrice(article, brand);
  }
}

/**
 * Преобразование статуса наличия ABCP в наш формат
 */
function parseAvailability(availability: string | number): Availability {
  const val = parseInt(String(availability), 10);
  if (val > 0) return 'in_stock';
  if (val === -1) return 'in_stock';
  if (val === -2) return 'to_order';
  return 'to_order';
}

// Brand multipliers for price calculation
const BRAND_PRICE_MULTIPLIER: Record<string, number> = {
  // Premium brands - parts cost more
  'Mercedes': 1.5,
  'BMW': 1.45,
  'Audi': 1.4,
  'Lexus': 1.55,
  'Porsche': 1.7,
  'Land Rover': 1.45,
  'Genesis': 1.35,
  'Jaguar': 1.4,
  'Maserati': 1.65,
  'Tesla': 1.3,
  'Volvo': 1.25,
  'MINI': 1.25,
  // Budget brands - parts are cheaper
  'Lada (ВАЗ)': 0.7,
  'ГАЗ': 0.75,
  'УАЗ': 0.75,
  'ЗАЗ': 0.6,
  'Daewoo': 0.65,
  // Chinese brands
  'Geely': 0.85,
  'Haval': 0.85,
  'Chery': 0.8,
  'Exeed': 0.9,
  'Changan': 0.85,
  // Korean brands
  'Hyundai': 0.95,
  'Kia': 0.95,
  'Samsung': 0.9,
  // Japanese brands - standard
  'Toyota': 1.0,
  'Honda': 1.0,
  'Nissan': 1.0,
  'Mitsubishi': 0.95,
  'Subaru': 1.0,
  'Suzuki': 0.9,
  // American brands
  'Ford': 1.0,
  'Chevrolet': 0.95,
  'Jeep': 1.05,
  'Dodge': 1.05,
  // European brands
  'Volkswagen': 1.1,
  'Skoda': 0.95,
  'Peugeot': 0.9,
  'Citroen': 0.9,
  'Renault': 0.85,
};

function getBrandMultiplier(brand: string): number {
  return BRAND_PRICE_MULTIPLIER[brand] || 1.0;
}

/**
 * Симулированная цена ABCP для случаев, когда API недоступен
 */
function getSimulatedAbcpPrice(article: string, brand: string): PriceRecord[] {
  const partInfo = Object.values(PARTS_DATABASE).find(p => p.article === article);
  const basePrice = partInfo?.basePrice || 20000;
  const brandMultiplier = getBrandMultiplier(brand);
  const variance = 0.90 + Math.random() * 0.2; // 90-110%
  const price = Math.round(basePrice * variance * brandMultiplier);
  const inStock = Math.random() > 0.3;

  return [{
    id: `abcp-${article}-${Date.now()}`,
    partId: article,
    article,
    brand,
    name: partInfo?.name || article,
    price,
    currency: 'RUB',
    source: 'abcp',
    sourceName: 'ABCP',
    url: `https://www.abcp.ru/catalog/${brand}/${article}`,
    availability: inStock ? 'in_stock' : 'to_order',
    deliveryDays: inStock ? 2 : 5,
    scrapedAt: new Date().toISOString(),
  }];
}

/**
 * Получение реальной цены от AutoEuro API
 * API: https://api.autoeuro.ru/doc/v2
 * Endpoint: /api/v2/json/search_items/{apikey}/
 * Requires: delivery_key from /api/v2/json/get_deliveries/
 */
async function fetchAutoEuroPrice(article: string, brand: string): Promise<PriceRecord[]> {
  try {
    const login = 'hU8os9M2V0XlRjkYu5T3m7GiLynqLBmOKe8rq4JsxbPRnhIgN7PEVDwZOsLQ';
    
    // Moscow warehouse delivery key (closest to Kaluga region)
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
      return getSimulatedAutoEuroPrice(article, brand);
    }

    const data = await response.json();
    
    // AutoEuro returns data in DATA field
    if (!data || !data.DATA || !Array.isArray(data.DATA) || data.DATA.length === 0) {
      return getSimulatedAutoEuroPrice(article, brand);
    }

    // Filter to only show exact brand match and get top 3 results
    const exactBrandItems = data.DATA.filter((item: any) => 
      item.brand && item.brand.toLowerCase() === brand.toLowerCase()
    );
    
    const itemsToUse = exactBrandItems.length > 0 ? exactBrandItems : data.DATA;
    
    // Преобразуем ответ AutoEuro в наш формат
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
    return getSimulatedAutoEuroPrice(article, brand);
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
 * Преобразование статуса наличия AutoEuro в наш формат
 */
function parseAutoEuroAvailability(item: any): Availability {
  // AutoEuro returns amount > 0 when in stock
  const amount = item.amount || item.stock || 0;
  if (amount > 0) return 'in_stock';
  return 'to_order';
}

/**
 * Симулированная цена AutoEuro для случаев, когда API недоступен
 */
function getSimulatedAutoEuroPrice(article: string, brand: string): PriceRecord[] {
  const partInfo = Object.values(PARTS_DATABASE).find(p => p.article === article);
  const basePrice = partInfo?.basePrice || 20000;
  const brandMultiplier = getBrandMultiplier(brand);
  const variance = 0.88 + Math.random() * 0.24; // 88-112%
  const price = Math.round(basePrice * variance * brandMultiplier);
  const inStock = Math.random() > 0.25;

  return [{
    id: `autoeuro-${article}-${Date.now()}`,
    partId: article,
    article,
    brand,
    name: partInfo?.name || article,
    price,
    currency: 'RUB',
    source: 'autoeuro',
    sourceName: 'AutoEuro',
    url: `https://autoeuro.ru/catalog/${brand}/${article}`,
    availability: inStock ? 'in_stock' : 'to_order',
    deliveryDays: inStock ? 1 : 4,
    scrapedAt: new Date().toISOString(),
  }];
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
