/**
 * Parts Pricing API Route
 * GET /api/parts/price?article=XXX&brand=YYY
 */

import { NextRequest, NextResponse } from 'next/server';
import { priceAggregator } from '@/lib/parts-pricing/aggregator';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET handler for fetching part prices
 * 
 * Query parameters:
 * - article: string (required) - Part article number
 * - brand: string (required) - Car brand
 * - forceRefresh: boolean (optional) - Force refresh from sources
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const article = searchParams.get('article');
    const brand = searchParams.get('brand');
    const forceRefresh = searchParams.get('forceRefresh') === 'true';

    if (!article) {
      return NextResponse.json(
        { error: 'Параметр article обязателен' },
        { status: 400 }
      );
    }

    if (!brand) {
      return NextResponse.json(
        { error: 'Параметр brand обязателен' },
        { status: 400 }
      );
    }

    // Get price summary from aggregator
    const priceSummary = await priceAggregator.getPriceSummary(
      article,
      brand,
      forceRefresh
    );

    return NextResponse.json(priceSummary, {
      headers: {
        'Cache-Control': `public, s-maxage=3600, stale-while-revalidate=7200`,
      },
    });

  } catch (error) {
    console.error('Error fetching part prices:', error);
    
    return NextResponse.json(
      { error: 'Ошибка при получении цен', details: String(error) },
      { status: 500 }
    );
  }
}
