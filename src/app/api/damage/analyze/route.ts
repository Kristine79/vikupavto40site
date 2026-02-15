import { NextRequest, NextResponse } from 'next/server';
import { analyzeCarDamage } from '@/lib/car-damage-analyzer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image } = body;
    
    if (!image) {
      return NextResponse.json(
        { error: 'No image provided', success: false, damages: [] },
        { status: 400 }
      );
    }

    // Convert base64 to Buffer
    const buffer = Buffer.from(image, 'base64');

    // Analyze the image
    const result = await analyzeCarDamage(buffer);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Damage analysis error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to analyze image',
        details: error instanceof Error ? error.message : 'Unknown error',
        success: false,
        damages: [],
        totalDamageScore: 0,
        estimatedRepairCost: 0
      },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
