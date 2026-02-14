import { NextResponse } from "next/server";

// Rossko API endpoint for Kaluga region
const ROSSKO_API_BASE = process.env.ROSSKO_ENDPOINT || "https://klg-api.rossko.ru";

// Simple in-memory cache (5 minutes)
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface RosskoPart {
  name: string;
  article: string;
  price: number;
  delivery_days: number;
  brand: string;
}

interface PartsSearchResult {
  success: boolean;
  parts: RosskoPart[];
  error?: string;
  cached?: boolean;
}

// Map of common damaged parts to Rossko search terms
const partSearchTerms: Record<string, string[]> = {
  "Передний бампер": ["бампер передний", "бампер перед"],
  "Задний бампер": ["бампер задний", "бампер зад"],
  "Капот": ["капот"],
  "Крышка багажника": ["крышка багажника", "дверь задняя"],
  "Крыша": ["крыша", "панель крыши"],
  "Левое крыло": ["крыло переднее левое", "крыло левое"],
  "Правое крыло": ["крыло переднее правое", "крыло правое"],
  "Дверь водителя": ["дверь водителя", "дверь передняя левая"],
  "Дверь пассажира": ["дверь пассажира", "дверь передняя правая"],
  "Задняя дверь": ["дверь задняя", "дверь зад"],
  "Лобовое стекло": ["стекло лобовое", "лобовое стекло"],
  "Заднее стекло": ["стекло заднее", "заднее стекло"],
  "Боковое стекло": ["стекло боковое", "боковое стекло"],
  "Фара передняя": ["фара передняя", "фара"],
  "Фара задняя": ["фонарь задний", "фара задняя"],
  "Зеркало левое": ["зеркало левое", "зеркало наружное левое"],
  "Зеркало правое": ["зеркало правое", "зеркало наружное правое"],
  "Диск колесный": ["диск колесный", "диск колеса"],
  "Подвеска передняя": ["подвеска передняя", "амортизатор передний"],
  "Подвеска задняя": ["подвеска задняя", "амортизатор задний"],
  "Двигатель": ["двигатель", "мотор"],
  "Коробка передач": ["коробка передач", "АКПП"],
};

export async function POST(request: Request): Promise<NextResponse<PartsSearchResult>> {
  try {
    const body = await request.json();
    const { partName, partCategory } = body;

    if (!partName) {
      return NextResponse.json(
        { success: false, parts: [], error: "Название запчасти не указано" },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = `${partName}-${partCategory || "default"}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({
        ...(cached.data as PartsSearchResult),
        cached: true,
      });
    }

    // Get search terms for this part
    const searchTerms = partSearchTerms[partName] || [partName];

    const apiKey1 = process.env.ROSSKO_KEY1;
    const apiKey2 = process.env.ROSSKO_KEY2;

    // If no API keys, return fallback with estimated prices
    if (!apiKey1 || !apiKey2) {
      const estimatedPrices = getEstimatedPrices(partName, partCategory);
      return NextResponse.json({
        success: true,
        parts: estimatedPrices,
        error: "API ключи не настроены - показаны примерные цены",
      });
    }

    // Try to search on Rossko API
    let allParts: RosskoPart[] = [];

    for (const term of searchTerms) {
      try {
        const response = await fetch(`${ROSSKO_API_BASE}/search`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-KEY": apiKey1,
            "X-API-SECRET": apiKey2,
          },
          body: JSON.stringify({
            text: term,
            region_id: 40, // Kaluga region
            limit: 5,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.result && data.result.parts) {
            const parts: RosskoPart[] = data.result.parts.map((p: Record<string, string | number>) => ({
              name: p.name || term,
              article: p.article || "",
              price: Number(p.price) || 0,
              delivery_days: Number(p.delivery_days) || 1,
              brand: p.brand || "Unknown",
            }));
            allParts = [...allParts, ...parts];
          }
        }
      } catch (apiError) {
        console.error(`Rossko API error for term "${term}":`, apiError);
        // Continue to next term
      }
    }

    // Remove duplicates by article
    const uniqueParts = allParts.filter(
      (part, index, self) =>
        index === self.findIndex((p) => p.article === part.article)
    );

    // Sort by price
    uniqueParts.sort((a, b) => a.price - b.price);

    // Take top 5 results
    const resultParts = uniqueParts.slice(0, 5);

    // If no results from API, fall back to estimates
    if (resultParts.length === 0) {
      const estimatedPrices = getEstimatedPrices(partName, partCategory);
      return NextResponse.json({
        success: true,
        parts: estimatedPrices,
        error: "Запчасти не найдены - показаны примерные цены",
      });
    }

    // Cache the result
    cache.set(cacheKey, {
      data: { success: true, parts: resultParts },
      timestamp: Date.now(),
    });

    return NextResponse.json({
      success: true,
      parts: resultParts,
    });
  } catch (error) {
    console.error("Rossko API route error:", error);
    return NextResponse.json(
      { success: false, parts: [], error: "Ошибка при запросе цен" },
      { status: 500 }
    );
  }
}

// Fallback estimated prices when API is not available
function getEstimatedPrices(partName: string, category?: string): RosskoPart[] {
  const basePrices: Record<string, number> = {
    bodyParts: 15000,
    glass: 18000,
    lighting: 12000,
    mirrors: 8000,
    wheels: 12000,
    engine: 45000,
    interior: 15000,
  };

  const basePrice = basePrices[category || "bodyParts"] || 15000;

  return [
    {
      name: partName,
      article: "EST-001",
      price: basePrice,
      delivery_days: 1,
      brand: "Аналог",
    },
    {
      name: partName,
      article: "EST-002",
      price: Math.round(basePrice * 1.5),
      delivery_days: 3,
      brand: "Оригинал",
    },
    {
      name: partName,
      article: "EST-003",
      price: Math.round(basePrice * 0.7),
      delivery_days: 7,
      brand: "Б/У",
    },
  ];
}
