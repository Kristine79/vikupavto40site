# Архитектура системы парсинга цен на автозапчасти

## 1. Анализ и проектирование системы

### 1.1 Оптимальная архитектура системы

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            АРХИТЕКТУРА СИСТЕМЫ                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐                │
│  │   Клиент     │     │   Калькулятор │     │   Админ-панель│                │
│  │  (Frontend)  │◄───►│  (Next.js)    │◄───►│  (Управление) │                │
│  └──────────────┘     └───────┬───────┘     └──────────────┘                │
│                               │                                             │
│                               ▼                                             │
│                    ┌──────────────────────┐                                 │
│                    │   API Gateway        │                                 │
│                    │   (Next.js API Routes)│                                 │
│                    └───────────┬──────────┘                                 │
│                                │                                            │
│         ┌──────────────────────┼──────────────────────┐                    │
│         │                      │                      │                    │
│         ▼                      ▼                      ▼                    │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐                │
│  │   Кэш        │     │   Парсеры    │     │   База       │                │
│  │   (Redis)    │     │   (Python)   │     │   (PostgreSQL)│               │
│  │              │     │              │     │              │                │
│  │ - Цены       │     │ - Exist.ru   │     │ - Каталог    │                │
│  │ - TTL: 24ч   │     │ - AutoDoc    │     │ - VIN->детали │                │
│  │ - Fallback   │     │ - Emex       │     │ - Операции    │                │
│  └──────────────┘     └──────────────┘     └──────────────┘                │
│                               │                                             │
│                               ▼                                             │
│                    ┌──────────────────────┐                                 │
│                    │   Источники цен       │                                 │
│                    │   (Автозапчасти)      │                                 │
│                    └──────────────────────┘                                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Частота обновления цен

| Тип данных | Частота обновления | Причина |
|------------|-------------------|---------|
| Популярные запчасти (ходовые) | Каждые 6 часов | Высокая волатильность |
| Остальные запчасти | 1 раз в сутки | Достаточная актуальность |
| VIN-специфичные данные | При каждом запросе + кэш 7 дней | Индивидуальные цены |
| Коэффициенты марок | Еженедельно | Стабильные данные |

### 1.3 Обработка отсутствующих запчастей (Fallback Strategy)

```
АЛГОРИТМ ПОИСКА ЦЕНЫ:
    
    1. Поиск в кэше (Redis)
           │
           ▼
    ┌──────────────┐
    │  Есть в кэше? │────Нет───► 2. Поиск в БД (PostgreSQL)
    └──────┬───────┘
           │Да
           ▼
    Проверить TTL
           │
           ▼
    ┌──────────────────┐
    │ TTL истек?       │───Да───► 3. Запуск фонового парсинга
    └────────┬─────────┘          (async, вернуть старую цену)
             │Нет
             ▼
    Вернуть кэшированную цену
    
    4. Если ничего не найдено:
       - Использовать историческую среднюю цену по бренду
       - Показать пользователю: "Цена требует уточнения"
       - Добавить в очередь на ручную обработку
```

---

## 2. Выбор источника данных и парсинг

### 2.1 Рекомендуемые источники данных

| Магазин | API | Парсинг | Надёжность | Примечание |
|---------|-----|---------|-------------|------------|
| **Exist.ru** | Нет | Сложно | ⭐⭐⭐⭐ | Крупнейший, сильная защита |
| **AutoDoc.ru** | Есть (платно) | Средне | ⭐⭐⭐⭐⭐ | Официальное API |
| **Emex.ru** | Нет | Сложно | ⭐⭐⭐ | Актуальные цены |
| **PartsReview** | Есть | Легко | ⭐⭐⭐⭐ | Специализированный API |
| **Major Expert** | Есть | Легко | ⭐⭐⭐⭐ | Официальный дилер |

### 2.2 Рекомендуемый технологический стек для парсера

```
ВЫБОР БИБЛИОТЕКИ:
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  Scrapy vs BeautifulSoup4 vs Selenium:                                     │
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐           │
│  │    Scrapy       │  │  BeautifulSoup4 │  │    Selenium     │           │
│  ├─────────────────┤  ├─────────────────┤  ├─────────────────┤           │
│  │ ⭐⭐⭐⭐⭐       │  │ ⭐⭐⭐          │  │ ⭐⭐⭐           │           │
│  │                 │  │                 │  │                 │           │
│  │ + Асинхронность │  │ + Простой API   │  │ + JavaScript    │           │
│  │ + Встроенный    │  │ + Гибкость      │  │   рендеринг     │           │
│  │   rate limiting │  │                 │  │                 │           │
│  │ + Пайплайн      │  │ - Нет асинхро   │  │ - Медленный     │           │
│  │   данных        │  │ - Нужно отдельно│  │ - Ресурсоёмкий │           │
│  │                 │  │   управлять     │  │                 │           │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘           │
│                                                                             │
│  РЕКОМЕНДАЦИЯ: Scrapy + Playwright (для JS-рендеринга)                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.3 Архитектура модульного парсера

```python
# Файл: scraper/base.py
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Optional, List
import asyncio

@dataclass
class PartPrice:
    """Результат парсинга одной запчасти"""
    article: str              # Артикул
    brand: str                # Бренд запчасти
    name: str                 # Название
    price: float              # Цена в рублях
    availability: str        # "В наличии", "Под заказ", "Нет"
    delivery_days: int       # Дней доставки
    source_url: str          # Ссылка на товар
    source_name: str         # Название магазина
    scraped_at: str          # Время парсинга ISO

class BaseScraper(ABC):
    """Базовый класс для всех парсеров"""
    
    def __init__(self):
        self.rate_limit = 1  # запросов в секунду
        self.user_agents = []  # Ротация UA
        self.delay_between_requests = 1.0
    
    @abstractmethod
    async def search(self, article: str, brand: str = None) -> List[PartPrice]:
        """Поиск запчасти по артикулу"""
        pass
    
    @abstractmethod
    async def get_by_vin(self, vin: str, part_type: str) -> List[PartPrice]:
        """Получить цены по VIN и типу детали"""
        pass
    
    async def _make_request(self, url: str) -> str:
        """Выполнить запрос с обработкой антибота"""
        # Ротация User-Agent
        # Обработка капчи
        # Задержка между запросами
        pass
```

```python
# Файл: scraper/exist_ru.py
import asyncio
import re
from typing import List
from .base import BaseScraper, PartPrice

class ExistRuScraper(BaseScraper):
    """Парсер Exist.ru"""
    
    BASE_URL = "https://exist.ru"
    
    def __init__(self):
        super().__init__()
        self.rate_limit = 0.5  # Более строгий лимит
        self.user_agents = [
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        ]
    
    async def search(self, article: str, brand: str = None) -> List[PartPrice]:
        """Поиск по артикулу"""
        url = f"{self.BASE_URL}/catalog/ALL?article={article}"
        
        if brand:
            url += f"&maker={brand}"
        
        html = await self._make_request(url)
        
        # Парсинг HTML
        prices = self._parse_html(html, article)
        
        return prices
    
    def _parse_html(self, html: str, article: str) -> List[PartPrice]:
        """Парсинг HTML ответа"""
        results = []
        
        # Пример паттерна (нужно адаптировать под реальную структуру)
        pattern = r'data-price="(\d+)".*?data-brand="([^"]+)".*?href="([^"]+)"'
        
        for match in re.finditer(pattern, html):
            price, brand_name, href = match.groups()
            
            results.append(PartPrice(
                article=article,
                brand=brand_name,
                name=f"Запчасть {article}",  # Уточнить из HTML
                price=float(price),
                availability="В наличии",
                delivery_days=1,
                source_url=self.BASE_URL + href,
                source_name="Exist.ru",
                scraped_at=datetime.now().isoformat()
            ))
        
        return results
```

```python
# Файл: scraper/autodoc.py
# Пример с использованием официального API (без парсинга)

import aiohttp
from typing import List
from .base import BaseScraper, PartPrice

class AutodocScraper(BaseScraper):
    """Парсер через API AutoDoc (более надёжный)"""
    
    API_URL = "https://api.autodoc.ru"
    
    async def search(self, article: str, brand: str = None) -> List[PartPrice]:
        """Поиск через API"""
        
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"{self.API_URL}/search",
                params={"article": article, "brand": brand}
            ) as resp:
                data = await resp.json()
                
                return [PartPrice(
                    article=p["article"],
                    brand=p["brand"],
                    name=p["name"],
                    price=p["price"],
                    availability=p["availability"],
                    delivery_days=p.get("delivery_days", 3),
                    source_url=p["url"],
                    source_name="AutoDoc",
                    scraped_at=datetime.now().isoformat()
                ) for p in data["results"]]
```

```python
# Файл: scraper/manager.py
import asyncio
from typing import List, Dict
from .exist_ru import ExistRuScraper
from .autodoc import AutodocScraper
from .base import PartPrice

class ScraperManager:
    """Менеджер парсеров - объединяет несколько источников"""
    
    def __init__(self):
        self scrapers = [
            ExistRuScraper(),
            AutodocScraper(),
        ]
    
    async def search_all(self, article: str, brand: str = None) -> List[PartPrice]:
        """Параллельный поиск по всем парсерам"""
        
        tasks = [scraper.search(article, brand) for scraper in self.scrapers]
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Объединить результаты
        all_prices = []
        for result in results:
            if isinstance(result, list):
                all_prices.extend(result)
        
        # Сортировка по цене
        all_prices.sort(key=lambda x: x.price)
        
        return all_prices
    
    async def get_best_price(self, article: str, brand: str = None) -> PartPrice:
        """Получить лучшую цену"""
        prices = await self.search_all(article, brand)
        return prices[0] if prices else None
```

### 2.4 Обработка антибот-систем

```python
# Файл: scraper/utils.py
import asyncio
import random
from typing import Dict

class AntiBotHandler:
    """Обработчик антибот-защиты"""
    
    def __init__(self):
        self.user_agents = [
            # Список актуальных User-Agent
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        ]
        
        self.referrers = [
            "https://www.google.com/",
            "https://yandex.ru/",
            "https://mail.ru/",
        ]
    
    def get_headers(self) -> Dict[str, str]:
        """Получить случайные заголовки"""
        return {
            "User-Agent": random.choice(self.user_agents),
            "Referer": random.choice(self.referrers),
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "ru-RU,ru;q=0.9,en;q=0.8",
            "Accept-Encoding": "gzip, deflate, br",
        }
    
    async def request_with_retry(self, func, max_retries=3):
        """Выполнить запрос с повторами"""
        for attempt in range(max_retries):
            try:
                # Случайная задержка
                await asyncio.sleep(random.uniform(1, 3))
                
                return await func()
                
            except CaptchaException:
                # Обработка капчи
                print(f"Обнаружена капча, ожидание 60 сек...")
                await asyncio.sleep(60)
                
            except RateLimitException:
                # Превышение лимита
                wait_time = 2 ** attempt * 10
                print(f"Лимит превышен, ожидание {wait_time} сек...")
                await asyncio.sleep(wait_time)
        
        raise Exception("Превышено количество попыток")
```

---

## 3. Интеграция с калькулятором

### 3.1 API-интерфейс

```
ЭНДПОИНТЫ API:

┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  GET /api/parts/price                                                      │
│  ─────────────────────                                                     │
│  Параметры:                                                                │
│    - article: string (артикул OEM)                                         │
│    - brand: string (марка авто)                                            │
│    - part_type: string (тип детали: бампер, капот, фара и т.д.)           │
│                                                                             │
│  Ответ:                                                                    │
│    {                                                                       │
│      "article": "1234567890",                                              │
│      "brand": "BMW",                                                       │
│      "prices": [                                                           │
│        {                                                                   │
│          "price": 15000,                                                   │
│          "source": "Exist.ru",                                            │
│          "url": "https://...",                                             │
│          "updated_at": "2024-01-15T10:30:00Z"                              │
│        }                                                                   │
│      ],                                                                    │
│      "best_price": 15000,                                                  │
│      "cached": true                                                        │
│    }                                                                       │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  GET /api/repair/estimate                                                  │
│  ─────────────────────                                                     │
│  Параметры:                                                                │
│    - vin: string                                                           │
│    - damages: array (список повреждений)                                   │
│                                                                             │
│  Ответ:                                                                    │
│    {                                                                       │
│      "total_estimate": 85000,                                              │
│      "parts": [...],                                                       │
│      "labor": 25000,                                                       │
│      "sources": ["Exist.ru", "AutoDoc"]                                   │
│    }                                                                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Схема базы данных PostgreSQL

```sql
-- Таблица: Каталог запчастей
CREATE TABLE parts_catalog (
    id SERIAL PRIMARY KEY,
    oem_article VARCHAR(50) NOT NULL,      -- Артикул OEM
    brand VARCHAR(50) NOT NULL,            -- Бренд запчасти
    name VARCHAR(255) NOT NULL,           -- Название
    part_type VARCHAR(100),               -- Тип (бампер, капот...)
    compatible_brands VARCHAR[],          -- Совместимые марки авто
    
    UNIQUE(oem_article, brand)
);

-- Таблица: Сопоставление операций к запчастям
CREATE TABLE repair_operations (
    id SERIAL PRIMARY KEY,
    operation_code VARCHAR(50) NOT NULL,  -- Код операции
    operation_name VARCHAR(255) NOT NULL,-- Название
    parts_needed JSONB NOT NULL,          -- [{"article": "...", "qty": 1}]
    labor_hours DECIMAL(5,2),             -- Трудозатраты
    part_type VARCHAR(100)               -- Для какой детали
);

-- Таблица: История цен
CREATE TABLE price_history (
    id SERIAL PRIMARY KEY,
    part_id INTEGER REFERENCES parts_catalog(id),
    price DECIMAL(10,2) NOT NULL,
    source VARCHAR(100) NOT NULL,
    source_url VARCHAR(500),
    scraped_at TIMESTAMP NOT NULL,
    
    INDEX idx_part_time (part_id, scraped_at)
);

-- Таблица: Кэш цен (для быстрого доступа)
CREATE TABLE price_cache (
    part_key VARCHAR(100) PRIMARY KEY,    -- brand:article:part_type
    price DECIMAL(10,2) NOT NULL,
    source VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    expires_at TIMESTAMP NOT NULL
);
```

### 3.3 Сопоставление операций к запчастям

```typescript
// Файл: src/lib/repair-parts-mapping.ts

// Сопоставление: тип повреждения -> необходимые запчасти с артикулами
export const repairPartsMapping: Record<string, Array<{
  partType: string;
  oemArticle: string;        // Оригинальный артикул
  alternateArticles: string[]; // Аналоги
  quantity: number;
}>> = {
  'Передний бампер': [
    {
      partType: 'бампер',
      oemArticle: '51117287350', // Пример для BMW
      alternateArticles: ['51117287351', '51117153333'],
      quantity: 1
    },
    {
      partType: 'крепление бампера',
      oemArticle: '51117287355',
      alternateArticles: [],
      quantity: 2
    }
  ],
  'Капот': [
    {
      partType: 'капот',
      oemArticle: '41637132405',
      alternateArticles: ['41637132406'],
      quantity: 1
    }
  ],
  'Фара передняя': [
    {
      partType: 'фара',
      oemArticle: '63117289167', // Пример для BMW
      alternateArticles: ['63117289168', '63117289234'],
      quantity: 1
    }
  ]
};
```

### 3.4 API-сервис для калькулятора

```typescript
// Файл: src/lib/parts-api.ts

interface PartPriceResult {
  article: string;
  brand: string;
  price: number;
  source: string;
  url: string;
  updatedAt: string;
}

class PartsPriceService {
  private cache: Map<string, { price: number; expires: number }> = new Map();
  
  async getPrice(
    brand: string, 
    partType: string, 
    damageSeverity: 'minor' | 'moderate' | 'severe'
  ): Promise<PartPriceResult> {
    const cacheKey = `${brand}:${partType}:${damageSeverity}`;
    
    // 1. Проверить локальный кэш
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
      return { ...cached as any, cached: true };
    }
    
    // 2. Запросить с бэкенда
    const response = await fetch(
      `/api/parts/price?brand=${brand}&partType=${partType}&severity=${damageSeverity}`
    );
    
    if (!response.ok) {
      // Fallback на статическую базу
      return this.getFallbackPrice(brand, partType, damageSeverity);
    }
    
    const data = await response.json();
    
    // 3. Кэшировать результат
    this.cache.set(cacheKey, {
      price: data.bestPrice,
      expires: Date.now() + 6 * 60 * 60 * 1000 // 6 часов
    });
    
    return data;
  }
  
  private getFallbackPrice(
    brand: string, 
    partType: string, 
    severity: 'minor' | 'moderate' | 'severe'
  ): PartPriceResult {
    // Использовать статическую базу как резерв
    const basePrice = fallbackPrices[partType]?.[severity] || 25000;
    const brandMultiplier = brandMultipliers[brand] || 1.0;
    
    return {
      article: 'FALLBACK',
      brand,
      price: Math.round(basePrice * brandMultiplier),
      source: 'База данных (требует уточнения)',
      url: '',
      updatedAt: new Date().toISOString()
    };
  }
}

export const partsPriceService = new PartsPriceService();
```

### 3.5 Схема кэширования

```
КЭШИРОВАНИЕ (Redis):

Ключ: parts:{brand}:{partType}:{severity}
Значение: JSON { price, source, updatedAt }
TTL: 
  - Популярные запчасти: 6 часов
  - Остальные: 24 часа

Стратегия обновления:
1. Background refresh - обновление при истечении TTL
2. Stale-while-revalidate - отдаём старую цену, обновляем в фоне
3. Rate limiting - не более 100 запросов в минуту на один IP
```

---

## 4. Резервный план и тестирование

### 4.1 Обработка изменений структуры сайта

```
СТРАТЕГИЯ НА СЛУЧАЙ ИЗМЕНЕНИЯ САЙТА:

┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  1. МОНИТОРИНГ                                                               │
│     ├── Ежедневные проверки доступности парсеров                            │
│     ├── Уведомление при падении > 50% успешных запросов                    │
│     └── Логирование изменений в структуре HTML                             │
│                                                                             │
│  2. RESILIENCE                                                              │
│     ├── Fallback на другие магазины при ошибке                             │
│     └── Fallback на исторические данные                                     │
│                                                                             │
│  3. АВТОМАТИЧЕСКОЕ ВОССТАНОВЛЕНИЕ                                          │
│     ├── Валидация XPath/селекторов перед парсингом                        │
│     ├── Альтернативные селекторы для одного элемента                        │
│     └── Self-healing парсер (переобучение на новых данных)                 │
│                                                                             │
│  4. РУЧНОЕ ВМЕШАТЕЛЬСТВО                                                    │
│     ├── Админ-панель для быстрого исправления селекторов                   │
│     ├── Возможность отключить парсер без деплоя                            │
│     └── История изменений конфигурации                                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 A/B Тестирование

```python
# A/B тестирование точности цен

# Сценарий теста:
# 1. Показать группе A старый калькулятор (коэффициенты)
# 2. Показать группе B новый калькулятор (реальные цены)
# 3. Сравнить финальную цену ремонта с реальной

МЕТРИКИ:
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  Точность (Accuracy):                                                        │
│    - |Расчётная цена - Реальная цена| / Реальная цена * 100%               │
│    - Цель: < 15% отклонение для 80% запросов                                │
│                                                                             │
│  Конверсия:                                                                 │
│    - Сколько пользователей дошли до оставления заявки                      │
│    - Время принятия решения                                                  │
│                                                                             │
│  Попадание в диапазон:                                                      │
│    - Процент случаев, когда реальная цена попала в диапазон ±20%           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.3 Визуализация источника цены для пользователя

```tsx
// Компонент отображения цены с источником

interface PriceDisplayProps {
  price: number;
  source: string;
  updatedAt: string;
  isEstimated: boolean;
}

function PriceDisplay({ price, source, updatedAt, isEstimated }: PriceDisplayProps) {
  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="price-display">
      <div className="price-amount">
        {price.toLocaleString('ru-RU')} ₽
      </div>
      
      <div className="price-source">
        {isEstimated ? (
          <span className="badge badge-warning">
            ⚠️ Ориентировочная цена
          </span>
        ) : (
          <span className="badge badge-success">
            ✅ Актуальная цена
          </span>
        )}
        
        <span className="source-name">
          Источник: {source}
        </span>
        
        <span className="update-time">
          Обновлено: {formatDate(updatedAt)}
        </span>
      </div>
      
      {isEstimated && (
        <div className="disclaimer">
          * Точная цена будет определена при осмотре
        </div>
      )}
    </div>
  );
}
```

---

## 5. Итоговые рекомендации по стеку

```
ТЕХНОЛОГИЧЕСКИЙ СТЕК:

┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ПАРСЕР (Backend - Python):                                                 │
│  ├── Scrapy - основной фреймворк                                           │
│  ├── Playwright - для JS-рендеринга (антибот)                              │
│  ├── Redis - кэширование                                                    │
│  ├── PostgreSQL - хранение каталога и истории                               │
│  └── Celery - фоновая очередь задач                                        │
│                                                                             │
│  API (Backend - Python/FastAPI):                                           │
│  ├── FastAPI - веб-фреймворк                                               │
│  ├── Pydantic - валидация данных                                           │
│  ├── Redis - кэш                                                            │
│  └── PostgreSQL - база данных                                               │
│                                                                             │
│  FRONTEND (Existing - Next.js):                                             │
│  ├── Next.js 16 - текущий фреймворк                                         │
│  ├── React Query - управление запросами и кэшем                           │
│  └── TypeScript - типизация                                                │
│                                                                             │
│  ИНФРАСТРУКТУРА:                                                            │
│  ├── Docker - контейнеризация                                              │
│  ├── GitHub Actions - CI/CD                                                │
│  └── Vercel / Railway - деплой                                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Приоритеты реализации

| Приоритет | Задача | Сложность | Время |
|-----------|--------|-----------|-------|
| 🔴 P0 | Интеграция с API (AutoDoc/PartsReview) | Средняя | 1 неделя |
| 🔴 P0 | Создание API-шлюза | Средняя | 2-3 дня |
| 🟠 P1 | Парсер Exist.ru | Высокая | 2 недели |
| 🟠 P1 | Система кэширования | Средняя | 1 неделя |
| 🟡 P2 | Fallback на исторические данные | Низкая | 2-3 дня |
| 🟡 P2 | A/B тестирование | Средняя | 1 неделя |

---

## Заключение

Парсинг крупных магазинов автозапчастей возможен, но требует:
1. **Официального API** (AutoDoc, PartsReview) как основного источника
2. **Модульной архитектуры** парсеров для лёгкой замены
3. **Надёжной системы кэширования** для минимизации нагрузки
4. **Fallback-стратегии** на случай недоступности источников
5. **Мониторинга** за изменением структуры сайтов

Рекомендую начать с интеграции официального API (AutoDoc или PartsReview), как наиболее надёжного источника, и только потом добавлять парсеры для других сайтов.
