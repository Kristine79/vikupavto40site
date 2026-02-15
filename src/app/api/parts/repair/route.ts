/**
 * Repair Estimate API Route
 * POST /api/parts/repair
 * 
 * Body:
 * {
 *   brand: string,
 *   damages: Array<{ zone: string; severity: string }>
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { priceAggregator } from '@/lib/parts-pricing/aggregator';
import { RepairEstimate, PartCost } from '@/lib/parts-pricing/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Тип для стоимости ремонта по severity
type RepairCostBySeverity = {
  minor: number;
  moderate: number;
  severe: number;
};

// База стоимости ремонта по типам повреждений
const REPAIR_COSTS: Record<string, Record<string, RepairCostBySeverity>> = {
  bodyParts: {
    'Передний бампер': { minor: 5000, moderate: 15000, severe: 25000 },
    'Задний бампер': { minor: 5000, moderate: 14000, severe: 22000 },
    'Капот': { minor: 8000, moderate: 20000, severe: 35000 },
    'Крышка багажника': { minor: 7000, moderate: 18000, severe: 28000 },
    'Крыша': { minor: 10000, moderate: 25000, severe: 45000 },
    'Левое крыло': { minor: 4000, moderate: 12000, severe: 18000 },
    'Правое крыло': { minor: 4000, moderate: 12000, severe: 18000 },
    'Дверь водителя': { minor: 5000, moderate: 15000, severe: 22000 },
    'Дверь пассажира': { minor: 5000, moderate: 15000, severe: 22000 },
    'Задняя дверь': { minor: 5000, moderate: 14000, severe: 20000 },
  },
  glass: {
    'Лобовое стекло': { minor: 3000, moderate: 8000, severe: 15000 },
    'Заднее стекло': { minor: 2500, moderate: 7000, severe: 12000 },
    'Боковое стекло': { minor: 2000, moderate: 5000, severe: 8000 },
  },
  lighting: {
    'Фара передняя': { minor: 3000, moderate: 12000, severe: 25000 },
    'Фара задняя': { minor: 2500, moderate: 10000, severe: 18000 },
  },
  mirrors: {
    'Зеркало левое': { minor: 2000, moderate: 6000, severe: 12000 },
    'Зеркало правое': { minor: 2000, moderate: 6000, severe: 12000 },
  },
  wheels: {
    'Диск колесный': { minor: 3000, moderate: 8000, severe: 15000 },
  },
};

// Мультипликатор для премиальных брендов
const BRAND_MULTIPLIER: Record<string, number> = {
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
  // Российские бренды - дешевле
  'Lada (ВАЗ)': 0.7,
  'ГАЗ': 0.75,
  'УАЗ': 0.75,
  'ЗАЗ': 0.6,
  'Daewoo': 0.65,
  // Китайские - средне
  'Geely': 0.85,
  'Haval': 0.85,
  'Chery': 0.8,
  'Exeed': 0.9,
  'Changan': 0.85,
  // Корейские - средне
  'Hyundai': 0.95,
  'Kia': 0.95,
  'Samsung': 0.9,
  // Японские - стандарт
  'Toyota': 1.0,
  'Honda': 1.0,
  'Nissan': 1.0,
  'Mitsubishi': 0.95,
  'Subaru': 1.0,
  'Suzuki': 0.9,
  // Американские
  'Ford': 1.0,
  'Chevrolet': 0.95,
  'Jeep': 1.05,
  'Dodge': 1.05,
  // Европейские
  'Volkswagen': 1.1,
  'Skoda': 0.95,
  'Peugeot': 0.9,
  'Citroen': 0.9,
  'Renault': 0.85,
};

/**
 * POST handler for calculating repair estimate
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { brand, damages } = body;

    if (!brand || !damages || !Array.isArray(damages)) {
      return NextResponse.json(
        { error: 'Некорректные параметры запроса' },
        { status: 400 }
      );
    }

    const parts: PartCost[] = [];
    let totalPartsCost = 0;
    const sources = new Set<string>();

    // Для каждого повреждения получаем стоимость запчастей
    for (const damage of damages) {
      const { zone, severity = 'moderate' } = damage;
      
      // Определяем категорию
      let category: string | null = null;
      for (const [cat, parts_] of Object.entries(REPAIR_COSTS)) {
        if (zone in parts_) {
          category = cat;
          break;
        }
      }

      if (!category) {
        continue;
      }

      // Получаем базовую стоимость
      const categoryCosts = REPAIR_COSTS[category];
      if (!categoryCosts) {
        continue;
      }
      
      const partCosts = categoryCosts[zone];
      
      if (!partCosts) {
        continue;
      }

      // Get the cost for the specific severity
      const severityKey = severity as keyof RepairCostBySeverity;
      const baseRepairCost = partCosts[severityKey] || partCosts.moderate;

      // Применяем мультипликатор бренда
      const multiplier = BRAND_MULTIPLIER[brand] || 1.0;
      const repairCost = Math.round(baseRepairCost * multiplier);

      // Получаем информацию о запчасти
      const partInfo = priceAggregator.getArticleByPartType(zone);

      // Пытаемся получить реальную цену запчасти
      let partPrice = repairCost;
      let sourceName = 'Оценка';

      if (partInfo) {
        try {
          const priceResult = await priceAggregator.getBestPrice(
            partInfo.article,
            brand,
            true
          );

          if (priceResult) {
            partPrice = priceResult.price;
            sourceName = priceResult.sourceName;
            sources.add(sourceName);
          }
        } catch (error) {
          console.error(`Error fetching price for ${zone}:`, error);
        }
      }

      const partCost: PartCost = {
        partType: zone,
        article: partInfo?.article || 'N/A',
        name: partInfo?.name || zone,
        price: partPrice,
        source: sourceName,
        url: partInfo ? `/api/parts/price?article=${partInfo.article}&brand=${brand}` : '',
        quantity: 1,
      };

      parts.push(partCost);
      totalPartsCost += partPrice;
    }

    // Рассчитываем стоимость работы (обычно 30-50% от стоимости запчастей)
    const labor = Math.round(totalPartsCost * 0.4);

    const estimate: RepairEstimate = {
      totalEstimate: totalPartsCost + labor,
      parts,
      labor,
      sources: sources.size > 0 ? Array.from(sources) : ['Оценка'],
    };

    return NextResponse.json(estimate, {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1800',
      },
    });

  } catch (error) {
    console.error('Error calculating repair estimate:', error);
    
    return NextResponse.json(
      { error: 'Ошибка при расчёте стоимости ремонта', details: String(error) },
      { status: 500 }
    );
  }
}
